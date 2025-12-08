-- PROCEDURE2.SQL - Consolidated extra procedures
-- New procedures for Meeting management
CREATE OR REPLACE PROCEDURE get_projects_for_scheduling (
    p_projects_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_projects_cursor FOR
        SELECT
            p.proposal_id AS id,
            p.title AS title,
            c.company_name AS client_name,
            u.name AS pm_name
        FROM
            proposals p
        JOIN
            clients c ON p.client_id = c.client_id
        LEFT JOIN
            users u ON p.pm_user_id = u.user_id
        WHERE
            p.status IN ('active', 'in_progress', 'approved');
END;
/

CREATE OR REPLACE PROCEDURE create_meeting_custom (
    p_proposal_id IN NUMBER,
    p_creator_id IN NUMBER, -- Admin's user_id
    p_subject IN VARCHAR2,
    p_scheduled_date IN DATE,
    p_meeting_type IN VARCHAR2,
    p_include_client IN NUMBER, -- 1 to include, 0 to exclude
    p_meeting_id OUT NUMBER
)
AS
    v_pm_user_id NUMBER;
    v_client_user_id NUMBER;
    v_client_id NUMBER;
BEGIN
    INSERT INTO meetings (proposal_id, subject, scheduled_date, meeting_type, status)
    VALUES (p_proposal_id, p_subject, p_scheduled_date, p_meeting_type, 'scheduled')
    RETURNING meeting_id INTO p_meeting_id;

    INSERT INTO meeting_participants (meeting_id, user_id, attendance)
    VALUES (p_meeting_id, p_creator_id, 'invited');

    SELECT pm_user_id, client_id INTO v_pm_user_id, v_client_id
    FROM proposals
    WHERE proposal_id = p_proposal_id;

    IF v_pm_user_id IS NOT NULL THEN
        INSERT INTO meeting_participants (meeting_id, user_id, attendance)
        VALUES (p_meeting_id, v_pm_user_id, 'invited');
    END IF;

    IF p_include_client = 1 THEN
        SELECT user_id INTO v_client_user_id
        FROM clients
        WHERE client_id = v_client_id;

        IF v_client_user_id IS NOT NULL THEN
            INSERT INTO meeting_participants (meeting_id, user_id, attendance)
            VALUES (p_meeting_id, v_client_user_id, 'invited');
        END IF;
    END IF;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

CREATE OR REPLACE PROCEDURE update_meeting_mom (
    p_meeting_id IN NUMBER,
    p_mom IN CLOB,
    p_success OUT NUMBER
)
AS
BEGIN
    UPDATE meetings
    SET minutes_of_meeting = p_mom,
        status = 'completed'
    WHERE meeting_id = p_meeting_id;

    p_success := 1;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        p_success := 0;
        ROLLBACK;
END;
/

CREATE OR REPLACE PROCEDURE get_all_meetings (
    p_meetings_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_meetings_cursor FOR
        SELECT
            m.meeting_id AS id,
            m.subject AS title,
            TO_CHAR(m.scheduled_date, 'YYYY-MM-DD') AS date_str,
            TO_CHAR(m.scheduled_date, 'HH24:MI') AS time_str,
            (SELECT COUNT(*) FROM meeting_participants mp WHERE mp.meeting_id = m.meeting_id) AS attendees,
            m.meeting_type AS type,
            m.subject AS location,
            m.minutes_of_meeting AS mom
        FROM
            meetings m
        ORDER BY m.scheduled_date DESC;
END;
/

-- New procedures for Developer Assignment
CREATE OR REPLACE PROCEDURE get_available_developers (
    p_developers_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_developers_cursor FOR
        SELECT
            user_id AS id,
            name AS name,
            email AS email
        FROM
            users
        WHERE
            role = 'developer'
            AND is_active = 1;
END;
/

CREATE OR REPLACE PROCEDURE assign_dev_to_proj_tasks (
    p_project_id IN NUMBER,
    p_developer_id IN NUMBER,
    p_success OUT NUMBER
)
AS
BEGIN
    UPDATE tasks
    SET
        locked_by = p_developer_id
    WHERE
        proposal_id = p_project_id
        AND locked_by IS NULL;

    p_success := 1;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        p_success := 0;
        ROLLBACK;
END;
/

-- New procedure for Milestone (Task) Creation
CREATE OR REPLACE PROCEDURE create_task (
    p_proposal_id IN NUMBER,
    p_title IN VARCHAR2,
    p_description IN CLOB,
    p_due_date IN DATE,
    p_priority IN VARCHAR2,
    p_task_id OUT NUMBER
)
AS
BEGIN
    INSERT INTO tasks (proposal_id, title, description, status, due_date, priority)
    VALUES (p_proposal_id, p_title, p_description, 'todo', p_due_date, p_priority)
    RETURNING task_id INTO p_task_id;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/