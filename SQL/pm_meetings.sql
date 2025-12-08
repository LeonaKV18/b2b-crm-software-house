-- Procedure to get projects managed by a specific PM for scheduling meetings
CREATE OR REPLACE PROCEDURE get_pm_projects_for_scheduling (
    p_user_id IN NUMBER,
    p_projects_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_projects_cursor FOR
        SELECT
            p.proposal_id AS id,
            p.title AS title,
            c.company_name AS client_name
        FROM
            proposals p
        JOIN
            clients c ON p.client_id = c.client_id
        WHERE
            p.pm_user_id = p_user_id
            AND p.status IN ('active', 'in_progress', 'approved');
END;
/

-- Procedure to get developers assigned to a specific project (via tasks or team_members)
CREATE OR REPLACE PROCEDURE get_project_developers (
    p_project_id IN NUMBER,
    p_developers_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_developers_cursor FOR
        SELECT DISTINCT
            u.user_id AS id,
            u.name AS name,
            u.email AS email
        FROM
            users u
        WHERE
            u.role = 'developer'
            AND (
                u.user_id IN (
                    SELECT tm.user_id
                    FROM team_members tm
                    JOIN tasks t ON tm.team_id = t.team_id
                    WHERE t.proposal_id = p_project_id
                )
                OR
                u.user_id IN (
                    SELECT t.locked_by
                    FROM tasks t
                    WHERE t.proposal_id = p_project_id
                    AND t.locked_by IS NOT NULL
                )
            );
END;
/

-- Procedure to create a meeting with multiple participants (developers + optional client)
-- Note: This requires a custom type or comma-separated string for multiple dev IDs.
-- For simplicity in this environment, we'll use a comma-separated string for p_developer_ids.
CREATE OR REPLACE PROCEDURE create_pm_meeting (
    p_proposal_id IN NUMBER,
    p_creator_id IN NUMBER, -- PM's user_id
    p_subject IN VARCHAR2,
    p_scheduled_date IN DATE,
    p_meeting_type IN VARCHAR2,
    p_developer_ids IN VARCHAR2, -- Comma separated IDs e.g. "101,102,105"
    p_include_client IN NUMBER, -- 1 to include, 0 to exclude
    p_meeting_id OUT NUMBER
)
AS
    v_client_user_id NUMBER;
    v_client_id NUMBER;
    v_dev_id NUMBER;
    v_pos NUMBER;
    v_list VARCHAR2(32767) := p_developer_ids || ','; -- Append comma for loop logic
    v_len NUMBER;
BEGIN
    -- 1. Create Meeting
    INSERT INTO meetings (proposal_id, subject, scheduled_date, meeting_type, status)
    VALUES (p_proposal_id, p_subject, p_scheduled_date, p_meeting_type, 'scheduled')
    RETURNING meeting_id INTO p_meeting_id;

    -- 2. Add Creator (PM)
    INSERT INTO meeting_participants (meeting_id, user_id, attendance)
    VALUES (p_meeting_id, p_creator_id, 'invited');

    -- 3. Add Developers
    IF p_developer_ids IS NOT NULL AND LENGTH(p_developer_ids) > 0 THEN
        LOOP
            v_pos := INSTR(v_list, ',');
            EXIT WHEN v_pos = 0;
            
            BEGIN
                v_dev_id := TO_NUMBER(SUBSTR(v_list, 1, v_pos - 1));
                
                -- Check if not already added (basic safety)
                INSERT INTO meeting_participants (meeting_id, user_id, attendance)
                SELECT p_meeting_id, v_dev_id, 'invited' FROM DUAL
                WHERE NOT EXISTS (
                    SELECT 1 FROM meeting_participants WHERE meeting_id = p_meeting_id AND user_id = v_dev_id
                );
            EXCEPTION
                WHEN OTHERS THEN NULL; -- Ignore conversion errors or dupes
            END;

            v_list := SUBSTR(v_list, v_pos + 1);
        END LOOP;
    END IF;

    -- 4. Add Client (Optional)
    IF p_include_client = 1 THEN
        SELECT client_id INTO v_client_id
        FROM proposals
        WHERE proposal_id = p_proposal_id;

        BEGIN
            SELECT user_id INTO v_client_user_id
            FROM clients
            WHERE client_id = v_client_id;

            IF v_client_user_id IS NOT NULL THEN
                INSERT INTO meeting_participants (meeting_id, user_id, attendance)
                VALUES (p_meeting_id, v_client_user_id, 'invited');
            END IF;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN NULL;
        END;
    END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/
