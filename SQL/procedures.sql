CREATE OR REPLACE PROCEDURE verify_user (
    p_email IN VARCHAR2,
    p_password IN VARCHAR2,
    p_user_id OUT NUMBER,
    p_role OUT VARCHAR2,
    p_name OUT VARCHAR2,
    p_is_valid OUT NUMBER
)
AS
BEGIN
    SELECT user_id, role, name INTO p_user_id, p_role, p_name
    FROM users
    WHERE email = p_email AND password = p_password AND is_active = 1;

    p_is_valid := 1;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_is_valid := 0;
    WHEN OTHERS THEN
        p_is_valid := 0;
END;
/

CREATE OR REPLACE PROCEDURE get_all_clients (
    p_clients_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_clients_cursor FOR
        SELECT
            c.client_id AS "id",
            u.name AS "name",
            c.company_name AS "company",
            NVL(con.full_name, u.name) AS "contact",
            CASE WHEN u.is_active = 1 THEN 'Active' ELSE 'Inactive' END AS "status",
            NVL(con.email, u.email) AS "email",
            con.phone AS "phone",
            (SELECT COUNT(*) FROM proposals WHERE client_id = c.client_id) AS "projects",
            TO_CHAR(c.last_interaction, 'YYYY-MM-DD') AS "lastInteraction"
        FROM
            clients c
        JOIN
            users u ON c.user_id = u.user_id
        LEFT JOIN
            contacts con ON c.client_id = con.client_id AND con.contact_type = 'primary';
END;
/

CREATE OR REPLACE PROCEDURE get_all_projects (
    p_projects_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_projects_cursor FOR
        SELECT
            p.proposal_id AS "id",
            p.title AS "name",
            c.company_name AS "client",
            -- Calculate progress: (Completed Top Level Tasks / Total Top Level Tasks) * 100
            NVL(ROUND(
                (SELECT COUNT(*) FROM tasks t WHERE t.proposal_id = p.proposal_id AND t.parent_task_id IS NULL AND t.status = 'done') / 
                NULLIF((SELECT COUNT(*) FROM tasks t WHERE t.proposal_id = p.proposal_id AND t.parent_task_id IS NULL), 0)
            * 100), 0) AS "progress",
            TO_CHAR(p.expected_close, 'YYYY-MM-DD') AS "deadline",
            (SELECT COUNT(DISTINCT t.locked_by) FROM tasks t WHERE t.proposal_id = p.proposal_id AND t.locked_by IS NOT NULL) AS "team",
            p.status AS "status"
        FROM
            proposals p
        JOIN
            clients c ON p.client_id = c.client_id
        WHERE
            p.status IN ('active', 'completed');
END;
/

CREATE OR REPLACE PROCEDURE get_all_proposals (
    p_proposals_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_proposals_cursor FOR
        SELECT
            p.proposal_id AS "id",
            c.company_name AS "client",
            p.title AS "title",
            p.description AS "description",
            p.status AS "status",
            p.value AS "value",
            u.name AS "createdBy",
            TO_CHAR(p.created_at, 'YYYY-MM-DD') AS "date",
            p.admin_comments AS "adminComments",
            p.pm_user_id AS "pmId"
        FROM
            proposals p
        JOIN
            clients c ON p.client_id = c.client_id
        LEFT JOIN
            users u ON p.pm_user_id = u.user_id;
END;
/

CREATE OR REPLACE PROCEDURE get_all_team_members (
    p_team_members_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_team_members_cursor FOR
        SELECT
            u.user_id AS id,
            u.name AS name,
            u.role AS role,
            u.email AS email,
            (SELECT COUNT(DISTINCT t.proposal_id) FROM tasks t WHERE t.locked_by = u.user_id) AS projects,
            -- Utilization: (Tasks In Progress / 3.0) * 100 for Developers
            -- For PMs: (Active Projects / 5.0) * 100
            CASE 
                WHEN u.role = 'developer' THEN
                    ROUND(((SELECT COUNT(DISTINCT t.proposal_id) FROM tasks t JOIN proposals p ON t.proposal_id = p.proposal_id WHERE t.locked_by = u.user_id AND p.status IN ('active', 'in_progress')) / 3.0) * 100)
                WHEN u.role = 'pm' THEN
                    ROUND(((SELECT COUNT(*) FROM proposals p WHERE p.pm_user_id = u.user_id AND p.status IN ('active', 'in_progress')) / 5.0) * 100)
                ELSE 0
            END AS workload,
            CASE WHEN u.is_active = 1 THEN 'Active' ELSE 'Inactive' END AS status
        FROM
            users u
        WHERE
            u.role IN ('pm', 'developer');
END;
/

CREATE OR REPLACE PROCEDURE get_client_dashboard_stats (
    p_user_id IN NUMBER,
    p_proposals_count OUT NUMBER,
    p_active_projects_count OUT NUMBER,
    p_completed_projects_count OUT NUMBER,
    p_total_spent OUT NUMBER
)
AS
    v_client_id NUMBER;
BEGIN
    SELECT client_id INTO v_client_id FROM clients WHERE user_id = p_user_id;

    SELECT COUNT(*) INTO p_proposals_count FROM proposals WHERE client_id = v_client_id;
    SELECT COUNT(*) INTO p_active_projects_count FROM proposals WHERE client_id = v_client_id AND status = 'active';
    SELECT COUNT(*) INTO p_completed_projects_count FROM proposals WHERE client_id = v_client_id AND status = 'completed';
    SELECT NVL(SUM(value), 0) INTO p_total_spent FROM proposals WHERE client_id = v_client_id AND status = 'completed';

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_proposals_count := 0;
        p_active_projects_count := 0;
        p_completed_projects_count := 0;
        p_total_spent := 0;
    WHEN OTHERS THEN
        RAISE;
END;
/

CREATE OR REPLACE PROCEDURE get_client_projects (
    p_user_id IN NUMBER,
    p_projects_cursor OUT SYS_REFCURSOR
)
AS
    v_client_id NUMBER;
BEGIN
    BEGIN
        SELECT client_id INTO v_client_id FROM clients WHERE user_id = p_user_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            v_client_id := NULL;
    END;

    IF v_client_id IS NOT NULL THEN
        OPEN p_projects_cursor FOR
            SELECT
                p.proposal_id AS "id",
                p.title AS "name",
                -- Progress calculation
                NVL(ROUND(
                (SELECT COUNT(*) FROM tasks t WHERE t.proposal_id = p.proposal_id AND t.parent_task_id IS NULL AND t.status = 'done') / 
                NULLIF((SELECT COUNT(*) FROM tasks t WHERE t.proposal_id = p.proposal_id AND t.parent_task_id IS NULL), 0)
                * 100), 0) AS "progress",
                p.status AS "status",
                TO_CHAR(p.expected_close, 'YYYY-MM-DD') AS "deadline"
            FROM
                proposals p
            WHERE
                p.client_id = v_client_id;
    ELSE
        OPEN p_projects_cursor FOR
            SELECT NULL AS "id", NULL AS "name", NULL AS "progress", NULL AS "status", NULL AS "deadline"
            FROM dual
            WHERE 1 = 0;
    END IF;
END;
/

CREATE OR REPLACE PROCEDURE get_client_proposals (
    p_user_id IN NUMBER,
    p_proposals_cursor OUT SYS_REFCURSOR
)
AS
    v_client_id NUMBER;
BEGIN
    BEGIN
        SELECT client_id INTO v_client_id FROM clients WHERE user_id = p_user_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            v_client_id := NULL;
    END;

    IF v_client_id IS NOT NULL THEN
        OPEN p_proposals_cursor FOR
            SELECT
                p.proposal_id AS "id",
                p.title AS "title",
                p.value AS "amount",
                p.status AS "status",
                TO_CHAR(p.created_at, 'YYYY-MM-DD') AS "date"
            FROM
                proposals p
            WHERE
                p.client_id = v_client_id;
    ELSE
        OPEN p_proposals_cursor FOR
            SELECT NULL AS "id", NULL AS "title", NULL AS "amount", NULL AS "status", NULL AS "date"
            FROM dual
            WHERE 1 = 0;
    END IF;
END;
/

CREATE OR REPLACE PROCEDURE create_client_proposal (
    p_user_id IN NUMBER,
    p_title IN VARCHAR2,
    p_description IN CLOB,
    p_value IN NUMBER,
    p_expected_close IN DATE,
    p_functional_req IN CLOB,
    p_non_functional_req IN CLOB,
    p_client_comments IN CLOB,
    p_proposal_id OUT NUMBER
)
AS
    v_client_id NUMBER;
BEGIN
    SELECT client_id INTO v_client_id FROM clients WHERE user_id = p_user_id;

    INSERT INTO proposals (
        client_id, title, description, value, status, created_at, 
        expected_close, functional_requirements, non_functional_requirements, client_comments
    )
    VALUES (
        v_client_id, p_title, p_description, p_value, 'submitted', SYSDATE, 
        p_expected_close, p_functional_req, p_non_functional_req, p_client_comments
    )
    RETURNING proposal_id INTO p_proposal_id;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

CREATE OR REPLACE PROCEDURE get_developer_meetings (
    p_user_id IN NUMBER,
    p_meetings_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    -- Update meeting status to ongoing if scheduled time has passed
    UPDATE meetings
    SET status = 'ongoing'
    WHERE status = 'scheduled' 
      AND scheduled_start_date <= SYSDATE 
      AND scheduled_end_date >= SYSDATE;
      
    -- Update meeting status to completed if scheduled end time has passed
    UPDATE meetings
    SET status = 'completed'
    WHERE status IN ('scheduled', 'ongoing')
      AND scheduled_end_date < SYSDATE;
      
    COMMIT;

    OPEN p_meetings_cursor FOR
        SELECT
            m.meeting_id AS "id",
            m.subject AS "title",
            TO_CHAR(m.scheduled_start_date, 'YYYY-MM-DD') AS "date",
            TO_CHAR(m.scheduled_start_date, 'HH:MI AM') AS "startTime",
            TO_CHAR(m.scheduled_end_date, 'HH:MI AM') AS "endTime",
            m.status AS "status",
            p.title AS "project"
        FROM
            meetings m
        JOIN
            meeting_participants mp ON m.meeting_id = mp.meeting_id
        LEFT JOIN
            proposals p ON m.proposal_id = p.proposal_id
        WHERE
            mp.user_id = p_user_id
        ORDER BY
            m.scheduled_start_date ASC;
END;
/

CREATE OR REPLACE PROCEDURE get_developer_milestones (
    p_user_id IN NUMBER,
    p_milestones_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_milestones_cursor FOR
        SELECT
            t.task_id AS "id",
            t.title AS "name",
            p.title AS "project",
            t.status AS "status",
            TO_CHAR(t.due_date, 'YYYY-MM-DD') AS "dueDate",
            t.priority AS "priority"
        FROM
            tasks t
        JOIN
            proposals p ON t.proposal_id = p.proposal_id
        WHERE
            t.locked_by = p_user_id
            AND t.parent_task_id IS NULL -- Show only milestones
        ORDER BY
            t.due_date ASC;
END;
/

CREATE OR REPLACE PROCEDURE get_client_invoices (
    p_user_id IN NUMBER,
    p_invoices_cursor OUT SYS_REFCURSOR
)
AS
    v_client_id NUMBER;
BEGIN
    BEGIN
        SELECT client_id INTO v_client_id FROM clients WHERE user_id = p_user_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            v_client_id := NULL;
    END;

    IF v_client_id IS NOT NULL THEN
        OPEN p_invoices_cursor FOR
            SELECT
                i.invoice_id AS "id",
                NVL(p.title, 'N/A') AS "project",
                i.amount AS "amount",
                TO_CHAR(i.issue_date, 'YYYY-MM-DD') AS "date",
                i.status AS "status"
            FROM
                invoices i
            LEFT JOIN
                proposals p ON i.proposal_id = p.proposal_id
            WHERE
                i.client_id = v_client_id;
    ELSE
        OPEN p_invoices_cursor FOR
            SELECT NULL AS "id", NULL AS "project", NULL AS "amount", NULL AS "status", NULL AS "date"
            FROM dual
            WHERE 1 = 0;
    END IF;
END;
/

CREATE OR REPLACE PROCEDURE get_developer_tasks (
    p_user_id IN NUMBER,
    p_tasks_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_tasks_cursor FOR
        SELECT
            t.task_id AS id,
            t.title AS title,
            p.title AS project,
            TO_CHAR(t.due_date, 'YYYY-MM-DD') AS due,
            t.status AS status,
            t.priority AS priority,
            pt.title AS milestone
        FROM
            tasks t
        JOIN
            proposals p ON t.proposal_id = p.proposal_id
        LEFT JOIN
            tasks pt ON t.parent_task_id = pt.task_id
        WHERE
            t.locked_by = p_user_id
            AND t.parent_task_id IS NOT NULL -- Subtasks only
        ORDER BY
            p.title, pt.due_date, t.due_date;
END;
/

CREATE OR REPLACE PROCEDURE get_pm_dashboard_stats (
    p_user_id IN NUMBER,
    p_active_projects_count OUT NUMBER,
    p_delayed_projects_count OUT NUMBER,
    p_on_schedule_projects_count OUT NUMBER,
    p_team_utilization OUT NUMBER,
    p_completed_projects_count OUT NUMBER,
    p_milestones_on_time OUT NUMBER,
    p_milestones_delayed OUT NUMBER,
    p_dev_utilization_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    -- Active Projects
    SELECT COUNT(*)
    INTO p_active_projects_count
    FROM proposals
    WHERE pm_user_id = p_user_id
    AND status IN ('active', 'in_progress');

    -- Delayed Projects
    SELECT COUNT(*)
    INTO p_delayed_projects_count
    FROM proposals
    WHERE pm_user_id = p_user_id
    AND status IN ('active', 'in_progress')
    AND expected_close < SYSDATE;

    -- On Schedule Projects
    SELECT COUNT(*)
    INTO p_on_schedule_projects_count
    FROM proposals
    WHERE pm_user_id = p_user_id
    AND status IN ('active', 'in_progress')
    AND expected_close >= SYSDATE;

    -- Completed Projects
    SELECT COUNT(*)
    INTO p_completed_projects_count
    FROM proposals
    WHERE pm_user_id = p_user_id
    AND status = 'completed';

    -- Milestones Delayed
    SELECT COUNT(*)
    INTO p_milestones_delayed
    FROM tasks t
    JOIN proposals p ON t.proposal_id = p.proposal_id
    WHERE p.pm_user_id = p_user_id
    AND t.parent_task_id IS NULL
    AND t.status != 'done'
    AND t.due_date < SYSDATE;

    -- Milestones On Time
    SELECT COUNT(*)
    INTO p_milestones_on_time
    FROM tasks t
    JOIN proposals p ON t.proposal_id = p.proposal_id
    WHERE p.pm_user_id = p_user_id
    AND t.parent_task_id IS NULL
    AND (t.status = 'done' OR t.due_date >= SYSDATE);

    -- PM Team Utilization: (PM's Active Projects / 5.0) * 100
    SELECT NVL(ROUND((p_active_projects_count / 5.0) * 100), 0)
    INTO p_team_utilization
    FROM DUAL;

    -- Individual Developer Utilization
    OPEN p_dev_utilization_cursor FOR
        SELECT
            u.user_id AS id,
            u.name AS name,
            -- Developer utilization: (Active Projects / 3.0) * 100
            NVL(ROUND((COUNT(DISTINCT t.proposal_id) / 3.0) * 100), 0) AS utilization
        FROM
            users u
        JOIN
            tasks t ON u.user_id = t.locked_by
        JOIN
            proposals p ON t.proposal_id = p.proposal_id
        WHERE
            p.pm_user_id = p_user_id
            AND u.role = 'developer'
            AND p.status IN ('active', 'in_progress')
        GROUP BY
            u.user_id, u.name
        ORDER BY
            u.name;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_active_projects_count := 0;
        p_delayed_projects_count := 0;
        p_on_schedule_projects_count := 0;
        p_team_utilization := 0;
        p_completed_projects_count := 0;
        p_milestones_on_time := 0;
        p_milestones_delayed := 0;
        -- p_dev_utilization_cursor will be empty
    WHEN OTHERS THEN
        p_active_projects_count := 0;
        p_delayed_projects_count := 0;
        p_on_schedule_projects_count := 0;
        p_team_utilization := 0;
        p_completed_projects_count := 0;
        p_milestones_on_time := 0;
        p_milestones_delayed := 0;
        -- p_dev_utilization_cursor will be empty
        RAISE;
END;
/

CREATE OR REPLACE PROCEDURE get_pm_projects (
    p_user_id IN NUMBER,
    p_projects_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_projects_cursor FOR
        SELECT
            p.proposal_id AS id,
            p.title AS name,
            c.company_name AS client,
            -- Progress calculation
            NVL(ROUND(
                (SELECT COUNT(*) FROM tasks t WHERE t.proposal_id = p.proposal_id AND t.parent_task_id IS NULL AND t.status = 'done') / 
                NULLIF((SELECT COUNT(*) FROM tasks t WHERE t.proposal_id = p.proposal_id AND t.parent_task_id IS NULL), 0)
            * 100), 0) AS progress,
            TO_CHAR(p.expected_close, 'YYYY-MM-DD') AS deadline,
            (SELECT COUNT(DISTINCT t.locked_by) 
             FROM tasks t 
             WHERE t.proposal_id = p.proposal_id AND t.locked_by IS NOT NULL) AS team,
            p.status AS status
        FROM
            proposals p
        JOIN
            clients c ON p.client_id = c.client_id
        WHERE
            p.pm_user_id = p_user_id;
END;
/

CREATE OR REPLACE PROCEDURE get_pm_milestones (
    p_user_id IN NUMBER,
    p_milestones_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_milestones_cursor FOR
        SELECT
            t.task_id AS id,
            t.title AS name,
            pr.title AS project,
            t.status AS status,
            TO_CHAR(t.due_date, 'YYYY-MM-DD') AS dueDate,
            NVL(u.name, 'Unassigned') AS owner,
            (SELECT COUNT(*) FROM tasks sub WHERE sub.parent_task_id = t.task_id) as subtask_count,
            (SELECT COUNT(*) FROM tasks sub WHERE sub.parent_task_id = t.task_id AND sub.status = 'done') as subtask_completed
        FROM
            tasks t
        JOIN
            proposals pr ON t.proposal_id = pr.proposal_id
        LEFT JOIN
            users u ON t.locked_by = u.user_id
        WHERE
            pr.pm_user_id = p_user_id
            AND t.parent_task_id IS NULL;
END;
/

CREATE OR REPLACE PROCEDURE get_pm_team (
    p_user_id IN NUMBER,
    p_team_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_team_cursor FOR
        SELECT DISTINCT
            u.user_id AS id,
            u.name AS name,
            u.role AS role,
            -- Developer utilization: (Active Projects / 3.0) * 100
            NVL(ROUND((COUNT(DISTINCT t.proposal_id) / 3.0) * 100), 0) AS workload
        FROM
            users u
        JOIN
            tasks t ON t.locked_by = u.user_id
        JOIN
            proposals p ON t.proposal_id = p.proposal_id
        WHERE
            p.pm_user_id = p_user_id
            AND u.role = 'developer'
            AND p.status IN ('active', 'in_progress')
        GROUP BY
            u.user_id, u.name, u.role
        ORDER BY u.name;
END;
/

CREATE OR REPLACE PROCEDURE get_admin_dashboard_stats (
    p_total_clients OUT NUMBER,
    p_active_projects OUT NUMBER,
    p_pending_proposals OUT NUMBER,
    p_active_users OUT NUMBER
)
AS
BEGIN
    SELECT COUNT(*) INTO p_total_clients FROM clients;
    SELECT COUNT(*) INTO p_active_projects FROM proposals WHERE status IN ('active', 'in_progress');
    SELECT COUNT(*) INTO p_pending_proposals FROM proposals WHERE status IN ('submitted', 'draft');
    SELECT COUNT(*) INTO p_active_users FROM users WHERE is_active = 1;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_total_clients := 0;
        p_active_projects := 0;
        p_pending_proposals := 0;
        p_active_users := 0;
    WHEN OTHERS THEN
        RAISE;
END;
/

CREATE OR REPLACE PROCEDURE get_project_details (
    p_project_id IN NUMBER,
    p_project_details_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_project_details_cursor FOR
        SELECT
            p.proposal_id AS id,
            p.title AS name,
            c.company_name AS client,
            p.description AS description,
            p.status AS status,
            NVL(ROUND(
                (SELECT COUNT(*) FROM tasks t WHERE t.proposal_id = p.proposal_id AND t.parent_task_id IS NULL AND t.status = 'done') / 
                NULLIF((SELECT COUNT(*) FROM tasks t WHERE t.proposal_id = p.proposal_id AND t.parent_task_id IS NULL), 0)
            * 100), 0) AS progress,
            TO_CHAR(p.expected_close, 'YYYY-MM-DD') AS deadline,
            p.value AS budget,
            NVL(p.actual_hours * 50, 0) AS spent
        FROM
            proposals p
        JOIN
            clients c ON p.client_id = c.client_id
        WHERE
            p.proposal_id = p_project_id;
END;
/

CREATE OR REPLACE PROCEDURE get_project_team_members (
    p_project_id IN NUMBER,
    p_team_members_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_team_members_cursor FOR
        SELECT DISTINCT
            u.user_id AS id,
            u.name AS name,
            u.role AS role
        FROM
            users u
        WHERE
            u.user_id IN (
                SELECT t.locked_by
                FROM tasks t
                WHERE t.proposal_id = p_project_id
                AND t.locked_by IS NOT NULL
            );
END;
/

CREATE OR REPLACE PROCEDURE get_project_milestones (
    p_project_id IN NUMBER,
    p_milestones_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_milestones_cursor FOR
        SELECT
            t.task_id AS id,
            t.title AS name,
            t.status AS status,
            TO_CHAR(t.due_date, 'YYYY-MM-DD') AS dueDate,
            NVL(u.name, 'Unassigned') AS owner
        FROM
            tasks t
        LEFT JOIN
            users u ON t.locked_by = u.user_id
        WHERE
            t.proposal_id = p_project_id
            AND t.parent_task_id IS NULL;
END;
/

CREATE OR REPLACE PROCEDURE get_admin_revenue_data (
    p_revenue_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_revenue_cursor FOR
        SELECT
            TO_CHAR(actual_close, 'Mon') AS month,
            SUM(value) AS revenue
        FROM
            proposals
        WHERE
            status = 'completed' AND actual_close IS NOT NULL
        GROUP BY
            TO_CHAR(actual_close, 'Mon'), TO_CHAR(actual_close, 'MM')
        ORDER BY
            TO_CHAR(actual_close, 'MM');
END;
/

CREATE OR REPLACE PROCEDURE get_admin_conversion_data (
    p_proposals_count OUT NUMBER,
    p_approved_count OUT NUMBER,
    p_rejected_count OUT NUMBER
)
AS
BEGIN
    SELECT COUNT(*) INTO p_proposals_count FROM proposals;
    SELECT COUNT(*) INTO p_approved_count FROM proposals WHERE status = 'approved';
    SELECT COUNT(*) INTO p_rejected_count FROM proposals WHERE status = 'rejected';
END;
/

CREATE OR REPLACE PROCEDURE get_admin_project_status (
    p_on_track_count OUT NUMBER,
    p_not_on_time_count OUT NUMBER
)
AS
BEGIN
    -- On Track:
    -- Active/In Progress projects where deadline is in future or today
    -- Completed projects where actual_close <= expected_close
    SELECT COUNT(*)
    INTO p_on_track_count
    FROM proposals
    WHERE status IN ('active', 'in_progress', 'completed')
    AND (
        (status IN ('active', 'in_progress') AND expected_close >= TRUNC(SYSDATE))
        OR
        (status = 'completed' AND actual_close <= expected_close)
    );

    -- Not On Time:
    -- Active/In Progress projects where deadline is past
    -- Completed projects where actual_close > expected_close
    SELECT COUNT(*)
    INTO p_not_on_time_count
    FROM proposals
    WHERE status IN ('active', 'in_progress', 'completed')
    AND (
        (status IN ('active', 'in_progress') AND expected_close < TRUNC(SYSDATE))
        OR
        (status = 'completed' AND actual_close > expected_close)
    );
END;
/

CREATE OR REPLACE PROCEDURE get_admin_summary_metrics (
    p_total_revenue OUT NUMBER,
    p_active_clients OUT NUMBER,
    p_conversion_rate OUT NUMBER,
    p_team_utilization OUT NUMBER
)
AS
BEGIN
    SELECT NVL(SUM(value), 0) INTO p_total_revenue FROM proposals WHERE status = 'completed';
    SELECT COUNT(*) INTO p_active_clients FROM clients;
    p_conversion_rate := 0;
    
    -- Global Team Utilization: Avg dev utilization
    SELECT NVL(ROUND(AVG(dev_utilization), 0), 0)
    INTO p_team_utilization
    FROM (
        SELECT 
            (COUNT(DISTINCT t.proposal_id) / 3.0) * 100 AS dev_utilization
        FROM tasks t
        JOIN proposals p ON t.proposal_id = p.proposal_id
        WHERE t.locked_by IS NOT NULL
        AND p.status IN ('active', 'in_progress')
        GROUP BY t.locked_by
    );

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_total_revenue := 0;
        p_active_clients := 0;
        p_conversion_rate := 0;
        p_team_utilization := 0;
    WHEN OTHERS THEN
        RAISE;
END;
/

CREATE OR REPLACE PROCEDURE create_client (
    p_name IN VARCHAR2,
    p_company IN VARCHAR2,
    p_contact_name IN VARCHAR2,
    p_email IN VARCHAR2,
    p_phone IN VARCHAR2,
    p_password IN VARCHAR2,
    p_status IN VARCHAR2,
    p_client_id OUT NUMBER,
    p_success OUT NUMBER,
    p_message OUT VARCHAR2
)
AS
    v_user_id NUMBER;
    v_exists NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_exists FROM users WHERE email = p_email;

    IF v_exists > 0 THEN
        p_success := 0;
        p_message := 'User with this email already exists.';
        p_client_id := NULL;
        RETURN;
    END IF;

    INSERT INTO users (role, email, name, password, is_active)
    VALUES ('client', p_email, p_name, p_password, 1)
    RETURNING user_id INTO v_user_id;

    INSERT INTO clients (user_id, company_name)
    VALUES (v_user_id, p_company)
    RETURNING client_id INTO p_client_id;

    INSERT INTO contacts (user_id, client_id, full_name, email, phone, contact_type)
    VALUES (v_user_id, p_client_id, p_contact_name, p_email, p_phone, 'primary');

    p_success := 1;
    p_message := 'Client account created successfully.';
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_success := 0;
        p_message := 'Database error: ' || SQLERRM;
        p_client_id := NULL;
END;
/

CREATE OR REPLACE PROCEDURE create_project (
    p_client_id IN NUMBER,
    p_title IN VARCHAR2,
    p_description IN CLOB,
    p_value IN NUMBER,
    p_deadline IN DATE,
    p_status IN VARCHAR2,
    p_proposal_id OUT NUMBER
)
AS
BEGIN
    INSERT INTO proposals (client_id, title, description, value, expected_close, status, created_at)
    VALUES (p_client_id, p_title, p_description, p_value, p_deadline, p_status, SYSDATE)
    RETURNING proposal_id INTO p_proposal_id;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

CREATE OR REPLACE PROCEDURE get_pm_meetings (
    p_user_id IN NUMBER,
    p_meetings_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    -- Update meeting status to ongoing if scheduled time has passed
    UPDATE meetings
    SET status = 'ongoing'
    WHERE status = 'scheduled' 
      AND scheduled_start_date <= SYSDATE
      AND scheduled_end_date >= SYSDATE;

    -- Update meeting status to completed if scheduled end time has passed
    UPDATE meetings
    SET status = 'completed'
    WHERE status IN ('scheduled', 'ongoing')
      AND scheduled_end_date < SYSDATE;

    COMMIT;

    OPEN p_meetings_cursor FOR
        SELECT
            m.meeting_id AS "id",
            m.subject AS "title",
            TO_CHAR(m.scheduled_start_date, 'YYYY-MM-DD') AS "date",
            TO_CHAR(m.scheduled_start_date, 'HH:MI AM') AS "startTime",
            TO_CHAR(m.scheduled_end_date, 'HH:MI AM') AS "endTime",
            (SELECT COUNT(*) FROM meeting_participants mp WHERE mp.meeting_id = m.meeting_id) AS "attendees",
             m.status AS "status",
             p.title AS "project",
             m.minutes_of_meeting AS "mom"
        FROM
            meetings m
        JOIN
            proposals p ON m.proposal_id = p.proposal_id
        WHERE
            p.pm_user_id = p_user_id
        ORDER BY m.scheduled_start_date DESC;
END;
/

CREATE OR REPLACE PROCEDURE get_available_pms (
    p_pms_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_pms_cursor FOR
        SELECT
            u.user_id AS "id",
            u.name AS "name",
            (SELECT COUNT(*) 
             FROM proposals p 
             WHERE p.pm_user_id = u.user_id 
             AND p.status IN ('active', 'in_progress', 'approved')) AS "activeProjects"
        FROM
            users u
        WHERE
            u.role = 'pm'
            AND u.is_active = 1;
END;
/

CREATE OR REPLACE PROCEDURE assign_pm_to_proposal (
    p_proposal_id IN NUMBER,
    p_pm_user_id IN NUMBER,
    p_success OUT NUMBER,
    p_message OUT VARCHAR2
)
AS
    v_active_projects NUMBER;
BEGIN
    SELECT COUNT(*) 
    INTO v_active_projects 
    FROM proposals 
    WHERE pm_user_id = p_pm_user_id 
    AND status IN ('active', 'in_progress', 'approved');

    IF v_active_projects >= 5 THEN
        p_success := 0;
        p_message := 'Project Manager is already assigned to 5 or more active projects.';
    ELSE
        UPDATE proposals
        SET pm_user_id = p_pm_user_id
        WHERE proposal_id = p_proposal_id;
        
        p_success := 1;
        p_message := 'Project Manager assigned successfully.';
        COMMIT;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        p_success := 0;
        p_message := 'Database error: ' || SQLERRM;
        ROLLBACK;
END;
/

CREATE OR REPLACE PROCEDURE approve_proposal (
    p_proposal_id IN NUMBER,
    p_comment IN CLOB,
    p_success OUT NUMBER
)
AS
    v_pm_id NUMBER;
BEGIN
    SELECT pm_user_id INTO v_pm_id FROM proposals WHERE proposal_id = p_proposal_id;

    IF v_pm_id IS NULL THEN
        p_success := 0;
        RETURN;
    END IF;

    UPDATE proposals
    SET status = 'active',
        admin_comments = p_comment
    WHERE proposal_id = p_proposal_id;
    
    p_success := 1;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        p_success := 0;
        ROLLBACK;
END;
/

CREATE OR REPLACE PROCEDURE reject_proposal (
    p_proposal_id IN NUMBER,
    p_comment IN CLOB,
    p_success OUT NUMBER
)
AS
BEGIN
    UPDATE proposals
    SET status = 'rejected',
        admin_comments = p_comment
    WHERE proposal_id = p_proposal_id;
    
    p_success := 1;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        p_success := 0;
        ROLLBACK;
END;
/

CREATE OR REPLACE PROCEDURE create_employee (
    p_email IN VARCHAR2,
    p_name IN VARCHAR2,
    p_password IN VARCHAR2,
    p_role IN VARCHAR2,
    p_success OUT NUMBER,
    p_message OUT VARCHAR2
)
AS
    v_exists NUMBER;
BEGIN
    IF p_role NOT IN ('pm', 'developer') THEN
        p_success := 0;
        p_message := 'Invalid role. Only "pm" or "developer" roles can be added as employees.';
        RETURN;
    END IF;

    SELECT COUNT(*) INTO v_exists FROM users WHERE email = p_email;
    
    IF v_exists > 0 THEN
        p_success := 0;
        p_message := 'User with this email already exists.';
    ELSE
        INSERT INTO users (email, name, password, role, is_active)
        VALUES (p_email, p_name, p_password, p_role, 1);
        
        p_success := 1;
        p_message := 'Employee created successfully.';
        COMMIT;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        p_success := 0;
        p_message := 'Database error: ' || SQLERRM;
        ROLLBACK;
END;
/

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
    p_scheduled_start_date IN DATE,
    p_scheduled_end_date IN DATE,
    p_include_client IN NUMBER, -- 1 to include, 0 to exclude
    p_meeting_id OUT NUMBER
)
AS
    v_pm_user_id NUMBER;
    v_client_user_id NUMBER;
    v_client_id NUMBER;
BEGIN
    INSERT INTO meetings (proposal_id, subject, scheduled_start_date, scheduled_end_date, status)
    VALUES (p_proposal_id, p_subject, p_scheduled_start_date, p_scheduled_end_date, 'scheduled')
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
    -- Update meeting status to ongoing if scheduled start time has passed but end time has not
    UPDATE meetings
    SET status = 'ongoing'
    WHERE status = 'scheduled'
      AND scheduled_start_date <= SYSDATE
      AND scheduled_end_date >= SYSDATE;

    -- Update meeting status to completed if scheduled end time has passed
    UPDATE meetings
    SET status = 'completed'
    WHERE status IN ('scheduled', 'ongoing')
      AND scheduled_end_date < SYSDATE;
    
    COMMIT;

    OPEN p_meetings_cursor FOR
        SELECT
            m.meeting_id AS id,
            m.subject AS title,
            TO_CHAR(m.scheduled_start_date, 'YYYY-MM-DD') AS date_str,
            TO_CHAR(m.scheduled_start_date, 'HH24:MI') AS start_time_str,
            TO_CHAR(m.scheduled_end_date, 'HH24:MI') AS end_time_str,
            (SELECT COUNT(*) FROM meeting_participants mp WHERE mp.meeting_id = m.meeting_id) AS attendees,
            m.status AS status,
            p.title AS project,
            m.minutes_of_meeting AS mom
        FROM
            meetings m
        LEFT JOIN
            proposals p ON m.proposal_id = p.proposal_id
        ORDER BY m.scheduled_start_date DESC;
END;
/

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
    v_active_proj_count NUMBER;
BEGIN
    -- Check developer project limit (3)
    SELECT COUNT(DISTINCT t.proposal_id)
    INTO v_active_proj_count
    FROM tasks t
    JOIN proposals p ON t.proposal_id = p.proposal_id
    WHERE t.locked_by = p_developer_id
    AND p.status IN ('active', 'in_progress');

    IF v_active_proj_count >= 3 THEN
        -- Check if developer is ALREADY on this project (re-assignment is fine)
        SELECT COUNT(*) INTO v_active_proj_count 
        FROM tasks 
        WHERE proposal_id = p_project_id AND locked_by = p_developer_id;
        
        IF v_active_proj_count = 0 THEN
             p_success := 0; -- Developer limit reached
             RETURN;
        END IF;
    END IF;

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
                    SELECT t.locked_by
                    FROM tasks t
                    WHERE t.proposal_id = p_project_id
                    AND t.locked_by IS NOT NULL
                )
            );
END;
/

CREATE OR REPLACE PROCEDURE create_pm_meeting (
    p_proposal_id IN NUMBER,
    p_creator_id IN NUMBER, 
    p_subject IN VARCHAR2,
    p_scheduled_start_date IN DATE,
    p_scheduled_end_date IN DATE,
    p_developer_ids IN VARCHAR2, 
    p_include_client IN NUMBER, 
    p_meeting_id OUT NUMBER
)
AS
    v_client_user_id NUMBER;
    v_client_id NUMBER;
    v_dev_id NUMBER;
    v_pos NUMBER;
    v_list VARCHAR2(32767) := p_developer_ids || ',';
BEGIN
    INSERT INTO meetings (proposal_id, subject, scheduled_start_date, scheduled_end_date, status)
    VALUES (p_proposal_id, p_subject, p_scheduled_start_date, p_scheduled_end_date, 'scheduled')
    RETURNING meeting_id INTO p_meeting_id;

    INSERT INTO meeting_participants (meeting_id, user_id, attendance)
    VALUES (p_meeting_id, p_creator_id, 'invited');

    IF p_developer_ids IS NOT NULL AND LENGTH(p_developer_ids) > 0 THEN
        LOOP
            v_pos := INSTR(v_list, ',');
            EXIT WHEN v_pos = 0;
            
            BEGIN
                v_dev_id := TO_NUMBER(SUBSTR(v_list, 1, v_pos - 1));
                
                INSERT INTO meeting_participants (meeting_id, user_id, attendance)
                SELECT p_meeting_id, v_dev_id, 'invited' FROM DUAL
                WHERE NOT EXISTS (
                    SELECT 1 FROM meeting_participants WHERE meeting_id = p_meeting_id AND user_id = v_dev_id
                );
            EXCEPTION
                WHEN OTHERS THEN NULL;
            END;

            v_list := SUBSTR(v_list, v_pos + 1);
        END LOOP;
    END IF;

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

CREATE OR REPLACE PROCEDURE get_developer_projects (
    p_user_id IN NUMBER,
    p_projects_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_projects_cursor FOR
        SELECT DISTINCT
            p.proposal_id AS "id",
            p.title AS "name",
            c.company_name AS "client",
            p.status AS "status",
            (
                SELECT title 
                FROM (
                    SELECT title 
                    FROM tasks 
                    WHERE proposal_id = p.proposal_id 
                    AND parent_task_id IS NULL 
                    AND status IN ('in_progress', 'todo') 
                    ORDER BY CASE status WHEN 'in_progress' THEN 1 ELSE 2 END, due_date ASC
                ) 
                WHERE ROWNUM = 1
            ) AS "currentMilestone"
        FROM
            proposals p
        JOIN
            clients c ON p.client_id = c.client_id
        LEFT JOIN
            tasks t ON p.proposal_id = t.proposal_id
        WHERE
            t.locked_by = p_user_id
            AND p.status IN ('active', 'in_progress');
END;
/

CREATE OR REPLACE PROCEDURE create_subtask (
    p_parent_task_id IN NUMBER,
    p_title IN VARCHAR2,
    p_description IN CLOB,
    p_due_date IN DATE,
    p_priority IN VARCHAR2,
    p_subtask_id OUT NUMBER
)
AS
    v_proposal_id NUMBER;
BEGIN
    SELECT proposal_id INTO v_proposal_id FROM tasks WHERE task_id = p_parent_task_id;

    INSERT INTO tasks (proposal_id, parent_task_id, title, description, status, due_date, priority)
    VALUES (v_proposal_id, p_parent_task_id, p_title, p_description, 'todo', p_due_date, p_priority)
    RETURNING task_id INTO p_subtask_id;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

CREATE OR REPLACE PROCEDURE get_subtasks (
    p_parent_task_id IN NUMBER,
    p_subtasks_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_subtasks_cursor FOR
        SELECT
            task_id AS id,
            title AS title,
            status AS status,
            TO_CHAR(due_date, 'YYYY-MM-DD') AS dueDate,
            priority AS priority
        FROM
            tasks
        WHERE
            parent_task_id = p_parent_task_id
        ORDER BY
            due_date ASC;
END;
/

-- Procedure for Developer to lock (claim) a task
CREATE OR REPLACE PROCEDURE lock_task (
    p_task_id IN NUMBER,
    p_user_id IN NUMBER,
    p_success OUT NUMBER,
    p_message OUT VARCHAR2
)
AS
    v_proposal_id NUMBER;
    v_current_locked_by NUMBER;
    v_active_proj_count NUMBER;
    v_is_already_on_project NUMBER;
BEGIN
    -- Get task details
    SELECT proposal_id, locked_by INTO v_proposal_id, v_current_locked_by
    FROM tasks WHERE task_id = p_task_id;

    IF v_current_locked_by IS NOT NULL THEN
        p_success := 0;
        p_message := 'Task is already locked by another developer.';
        RETURN;
    END IF;

    -- Check 3-Project Limit
    -- 1. Check if dev is already on this project
    SELECT COUNT(*) INTO v_is_already_on_project
    FROM tasks 
    WHERE proposal_id = v_proposal_id AND locked_by = p_user_id;

    IF v_is_already_on_project = 0 THEN
        -- 2. If new project, check if they are at capacity
        SELECT COUNT(DISTINCT t.proposal_id)
        INTO v_active_proj_count
        FROM tasks t
        JOIN proposals p ON t.proposal_id = p.proposal_id
        WHERE t.locked_by = p_user_id
        AND p.status IN ('active', 'in_progress');

        IF v_active_proj_count >= 3 THEN
            p_success := 0;
            p_message := 'You cannot work on more than 3 active projects.';
            RETURN;
        END IF;
    END IF;

    -- Lock the task
    UPDATE tasks
    SET locked_by = p_user_id, status = 'in_progress'
    WHERE task_id = p_task_id;

    p_success := 1;
    p_message := 'Task locked successfully.';
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        p_success := 0;
        p_message := 'Database error: ' || SQLERRM;
        ROLLBACK;
END;
/

-- Procedure for Client to rework a proposal
CREATE OR REPLACE PROCEDURE rework_proposal (
    p_proposal_id IN NUMBER,
    p_title IN VARCHAR2,
    p_description IN CLOB,
    p_value IN NUMBER,
    p_expected_close IN DATE,
    p_success OUT NUMBER
)
AS
BEGIN
    UPDATE proposals
    SET title = p_title,
        description = p_description,
        value = p_value,
        expected_close = p_expected_close,
        status = 'submitted', -- Reset status to submitted for review
        admin_comments = NULL -- Clear previous rejection comments
    WHERE proposal_id = p_proposal_id;

    p_success := 1;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        p_success := 0;
        ROLLBACK;
END;
/

-- Procedure for PM to mark task as undone/reviewed
CREATE OR REPLACE PROCEDURE review_task (
    p_task_id IN NUMBER,
    p_status IN VARCHAR2, -- 'todo', 'in_progress', 'done'
    p_success OUT NUMBER
)
AS
BEGIN
    UPDATE tasks
    SET status = p_status
    WHERE task_id = p_task_id;

    p_success := 1;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        p_success := 0;
        ROLLBACK;
END;
/

-- Procedure for PM to complete project and generate invoice
CREATE OR REPLACE PROCEDURE complete_project (
    p_proposal_id IN NUMBER,
    p_success OUT NUMBER
)
AS
    v_client_id NUMBER;
    v_amount NUMBER;
BEGIN
    SELECT client_id, value INTO v_client_id, v_amount
    FROM proposals
    WHERE proposal_id = p_proposal_id;

    -- Update Project Status
    UPDATE proposals
    SET status = 'completed',
        actual_close = SYSDATE
    WHERE proposal_id = p_proposal_id;

    -- Generate Invoice
    INSERT INTO invoices (client_id, proposal_id, amount, issue_date, due_date, status)
    VALUES (v_client_id, p_proposal_id, v_amount, SYSDATE, SYSDATE + 30, 'pending');

    p_success := 1;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        p_success := 0;
        ROLLBACK;
END;
/

-- Procedure to mark an invoice as paid
CREATE OR REPLACE PROCEDURE mark_invoice_paid (
    p_invoice_id IN NUMBER,
    p_success OUT NUMBER
)
AS
BEGIN
    UPDATE invoices
    SET status = 'paid'
    WHERE invoice_id = p_invoice_id;

    p_success := 1;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        p_success := 0;
        ROLLBACK;
END;
/

-- Procedure to update a user's active status
CREATE OR REPLACE PROCEDURE update_user_status (
    p_user_id IN NUMBER,
    p_is_active IN NUMBER, -- 1 for active, 0 for inactive
    p_success OUT NUMBER
)
AS
    v_role VARCHAR2(20);
    v_workload_count NUMBER;
BEGIN
    IF p_is_active = 0 THEN
        -- Check role
        SELECT role INTO v_role FROM users WHERE user_id = p_user_id;

        IF v_role = 'developer' THEN
            -- Check developer workload
            SELECT COUNT(DISTINCT t.proposal_id)
            INTO v_workload_count
            FROM tasks t
            JOIN proposals p ON t.proposal_id = p.proposal_id
            WHERE t.locked_by = p_user_id
            AND p.status IN ('active', 'in_progress');
        ELSIF v_role = 'pm' THEN
             -- Check PM workload
            SELECT COUNT(*)
            INTO v_workload_count
            FROM proposals
            WHERE pm_user_id = p_user_id
            AND status IN ('active', 'in_progress');
        END IF;

        IF v_workload_count > 0 THEN
             p_success := 0; -- Indicating failure due to workload
             RETURN;
        END IF;
    END IF;

    UPDATE users
    SET is_active = p_is_active
    WHERE user_id = p_user_id;

    p_success := 1;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        p_success := 0;
        ROLLBACK;
END;
/
