-- This file will contain all the procedure creation scripts.

CREATE OR REPLACE PROCEDURE verify_user (
    p_email IN VARCHAR2,
    p_password IN VARCHAR2,
    p_user_id OUT NUMBER,
    p_role OUT VARCHAR2,
    p_name OUT VARCHAR2, -- Assuming there is a name column in the users table
    p_is_valid OUT NUMBER
)
AS
BEGIN
    SELECT user_id, role, name INTO p_user_id, p_role, p_name
    FROM users
    WHERE email = p_email AND password = p_password AND is_active = 1;

    p_is_valid := 1; -- User is valid
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_is_valid := 0; -- User is not valid
    WHEN OTHERS THEN
        p_is_valid := 0; -- An error occurred
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
            c.company_name AS "name",
            c.company_name AS "company",
            con.full_name AS "contact",
            'Active' as "status", -- Dummy data
            con.email AS "email",
            con.phone AS "phone",
            (SELECT COUNT(*) FROM proposals WHERE client_id = c.client_id) AS "projects",
            '2 days ago' as "lastInteraction" -- Dummy data
        FROM
            clients c
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
            50 AS "progress", -- Dummy data for now
            TO_CHAR(p.expected_close, 'YYYY-MM-DD') AS "deadline",
            (SELECT COUNT(DISTINCT tm.user_id) FROM team_members tm JOIN tasks t ON tm.team_id = t.team_id WHERE t.proposal_id = p.proposal_id) AS "team",
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
            tm.allocation_percentage AS workload,
            'Active' AS status -- Dummy data for now
        FROM
            users u
        LEFT JOIN -- Use LEFT JOIN to include users without team assignments
            team_members tm ON u.user_id = tm.user_id
        WHERE
            u.role IN ('pm', 'developer'); -- Only show PMs and Developers in team management
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
    -- Get client_id for the given user_id
    SELECT client_id INTO v_client_id FROM clients WHERE user_id = p_user_id;

    -- Total Proposals
    SELECT COUNT(*) INTO p_proposals_count FROM proposals WHERE client_id = v_client_id;

    -- Active Projects (assuming 'active' status in proposals table means active project)
    SELECT COUNT(*) INTO p_active_projects_count FROM proposals WHERE client_id = v_client_id AND status = 'active';

    -- Completed Projects (assuming 'completed' status in proposals table means completed project)
    SELECT COUNT(*) INTO p_completed_projects_count FROM proposals WHERE client_id = v_client_id AND status = 'completed';

    -- Total Spent (sum of value from completed proposals)
    SELECT NVL(SUM(value), 0) INTO p_total_spent FROM proposals WHERE client_id = v_client_id AND status = 'completed';

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_proposals_count := 0;
        p_active_projects_count := 0;
        p_completed_projects_count := 0;
        p_total_spent := 0;
    WHEN OTHERS THEN
        RAISE; -- Re-raise other exceptions
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
        -- Get client_id for the given user_id
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
                50 AS "progress", -- Dummy data for now
                p.status AS "status",
                TO_CHAR(p.expected_close, 'YYYY-MM-DD') AS "deadline"
            FROM
                proposals p
            WHERE
                p.client_id = v_client_id;
    ELSE
        -- Return empty result set if no client found
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
        -- Get client_id for the given user_id
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
        -- Return empty result set if no client found
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
    p_proposal_id OUT NUMBER
)
AS
    v_client_id NUMBER;
BEGIN
    -- Get client_id for the given user_id
    SELECT client_id INTO v_client_id FROM clients WHERE user_id = p_user_id;

    INSERT INTO proposals (client_id, title, description, value, status, created_at)
    VALUES (v_client_id, p_title, p_description, p_value, 'submitted', SYSDATE)
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
    OPEN p_meetings_cursor FOR
        SELECT
            m.meeting_id AS "id",
            m.subject AS "title",
            TO_CHAR(m.scheduled_date, 'YYYY-MM-DD') AS "date",
            TO_CHAR(m.scheduled_date, 'HH:MI AM') AS "time",
            m.meeting_type AS "type",
            m.subject AS "location" -- Using subject/placeholder for location
        FROM
            meetings m
        JOIN
            meeting_participants mp ON m.meeting_id = mp.meeting_id
        WHERE
            mp.user_id = p_user_id;
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
        -- Get client_id for the given user_id
        SELECT client_id INTO v_client_id FROM clients WHERE user_id = p_user_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            v_client_id := NULL;
    END;

    IF v_client_id IS NOT NULL THEN
        OPEN p_invoices_cursor FOR
            SELECT
                i.invoice_id AS "id",
                NVL(p.title, 'N/A') AS "project", -- Use NVL for cases where proposal_id might be null
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
        -- Return empty result set if no client found
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
            t.priority AS priority
        FROM
            tasks t
        JOIN
            proposals p ON t.proposal_id = p.proposal_id
        WHERE
            t.locked_by = p_user_id;
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
    p_milestones_delayed OUT NUMBER
)
AS
BEGIN
    -- Active Projects: proposals with status 'active' or 'in_progress' managed by this PM
    SELECT COUNT(*)
    INTO p_active_projects_count
    FROM proposals
    WHERE pm_user_id = p_user_id
    AND status IN ('active', 'in_progress');

    -- Delayed Projects: active/in-progress proposals with expected_close date in the past
    SELECT COUNT(*)
    INTO p_delayed_projects_count
    FROM proposals
    WHERE pm_user_id = p_user_id
    AND status IN ('active', 'in_progress')
    AND expected_close < SYSDATE;

    -- On Schedule Projects: active/in-progress proposals with expected_close date in the future or today
    SELECT COUNT(*)
    INTO p_on_schedule_projects_count
    FROM proposals
    WHERE pm_user_id = p_user_id
    AND status IN ('active', 'in_progress')
    AND expected_close >= SYSDATE;

    -- Team Utilization (Placeholder)
    -- For now, we'll set a fixed value or a simple dummy calculation.
    -- A more accurate calculation would involve joining with team_members and tasks.
    p_team_utilization := 82; -- Dummy value

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_active_projects_count := 0;
        p_delayed_projects_count := 0;
        p_on_schedule_projects_count := 0;
        p_team_utilization := 0;
    WHEN OTHERS THEN
        RAISE; -- Re-raise other exceptions
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
            NVL(ROUND((p.actual_hours / NULLIF(p.estimated_hours, 0)) * 100), 0) AS progress,
            TO_CHAR(p.expected_close, 'YYYY-MM-DD') AS deadline,
            (SELECT COUNT(DISTINCT tm.user_id)
             FROM tasks t
             JOIN team_members tm ON t.team_id = tm.team_id
             WHERE t.proposal_id = p.proposal_id) AS team,
            p.status AS status -- Add status for filtering/display
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
            NVL(u.name, 'Unassigned') AS owner
        FROM
            tasks t
        JOIN
            proposals pr ON t.proposal_id = pr.proposal_id
        LEFT JOIN
            users u ON t.locked_by = u.user_id
        WHERE
            pr.pm_user_id = p_user_id;
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
            tm.allocation_percentage AS workload
        FROM
            users u
        JOIN
            team_members tm ON u.user_id = tm.user_id
        JOIN
            tasks t ON tm.team_id = t.team_id
        JOIN
            proposals p ON t.proposal_id = p.proposal_id
        WHERE
            p.pm_user_id = p_user_id
            AND u.role IN ('developer', 'admin', 'pm', 'client'); -- Include relevant roles, assuming 'developer' covers the team roles
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
    -- Total Clients
    SELECT COUNT(*) INTO p_total_clients FROM clients;

    -- Active Projects (status 'active' or 'in_progress')
    SELECT COUNT(*) INTO p_active_projects FROM proposals WHERE status IN ('active', 'in_progress');

    -- Pending Proposals (status 'submitted' or 'draft')
    SELECT COUNT(*) INTO p_pending_proposals FROM proposals WHERE status IN ('submitted', 'draft');

    -- Active Users
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
            NVL(ROUND((p.actual_hours / NULLIF(p.estimated_hours, 0)) * 100), 0) AS progress,
            TO_CHAR(p.expected_close, 'YYYY-MM-DD') AS deadline,
            p.value AS budget, -- Assuming 'value' from proposals table as budget
            NVL(p.actual_hours * 50, 0) AS spent -- Dummy calculation: actual_hours * a rate of 50
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
            t.proposal_id = p_project_id;
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
    p_leads_count OUT NUMBER,
    p_proposals_count OUT NUMBER,
    p_approved_count OUT NUMBER
)
AS
BEGIN
    p_leads_count := 0; -- Leads table removed
    SELECT COUNT(*) INTO p_proposals_count FROM proposals;
    SELECT COUNT(*) INTO p_approved_count FROM proposals WHERE status = 'approved';
END;
/

CREATE OR REPLACE PROCEDURE get_admin_project_status (
    p_on_time_count OUT NUMBER,
    p_at_risk_count OUT NUMBER,
    p_delayed_count OUT NUMBER
)
AS
BEGIN
    -- On Time Projects
    SELECT COUNT(*)
    INTO p_on_time_count
    FROM proposals
    WHERE status IN ('active', 'in_progress')
    AND expected_close >= SYSDATE;

    -- At Risk: Projects in progress with deadline within the next 7 days
    SELECT COUNT(*)
    INTO p_at_risk_count
    FROM proposals
    WHERE status IN ('active', 'in_progress')
    AND expected_close >= SYSDATE AND expected_close <= SYSDATE + 7; -- Within next 7 days

    -- Delayed Projects
    SELECT COUNT(*)
    INTO p_delayed_count
    FROM proposals
    WHERE status IN ('active', 'in_progress')
    AND expected_close < SYSDATE;
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
    -- Total Revenue
    SELECT NVL(SUM(value), 0) INTO p_total_revenue FROM proposals WHERE status = 'completed';

    -- Active Clients (count all clients)
    SELECT COUNT(*) INTO p_active_clients FROM clients;

    -- Conversion Rate (Leads table removed)
    p_conversion_rate := 0;

    -- Team Utilization (Average of allocation_percentage from all team_members)
    SELECT NVL(AVG(allocation_percentage), 0) INTO p_team_utilization FROM team_members;

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
    p_client_id OUT NUMBER
)
AS
    v_user_id NUMBER;
BEGIN
    -- 1. Create User
    INSERT INTO users (role, email, name, password, is_active)
    VALUES ('client', p_email, p_name, p_password, 1)
    RETURNING user_id INTO v_user_id;

    -- 2. Create Client
    INSERT INTO clients (user_id, company_name)
    VALUES (v_user_id, p_company)
    RETURNING client_id INTO p_client_id;

    -- 3. Create Primary Contact
    INSERT INTO contacts (user_id, client_id, full_name, email, phone, contact_type)
    VALUES (v_user_id, p_client_id, p_contact_name, p_email, p_phone, 'primary');

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
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
    OPEN p_meetings_cursor FOR
        SELECT
            m.meeting_id AS "id",
            m.subject AS "title",
            TO_CHAR(m.scheduled_date, 'YYYY-MM-DD') AS "date",
            TO_CHAR(m.scheduled_date, 'HH:MI AM') AS "time",
            (SELECT COUNT(*) FROM meeting_participants mp WHERE mp.meeting_id = m.meeting_id) AS "attendees"
        FROM
            meetings m
        JOIN
            proposals p ON m.proposal_id = p.proposal_id
        WHERE
            p.pm_user_id = p_user_id;
END;
/

-- New Procedures for Admin Proposal Management

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
    -- Check active project count for the PM
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
    -- Check if PM is assigned
    SELECT pm_user_id INTO v_pm_id FROM proposals WHERE proposal_id = p_proposal_id;

    IF v_pm_id IS NULL THEN
        p_success := 0; -- Failed because no PM assigned
        RETURN;
    END IF;

    UPDATE proposals
    SET status = 'active', -- Becomes a project
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

-- Procedure to create an employee (pm or developer)
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
    -- Check if role is valid for employee
    IF p_role NOT IN ('pm', 'developer') THEN
        p_success := 0;
        p_message := 'Invalid role. Only "pm" or "developer" roles can be added as employees.';
        RETURN;
    END IF;

    -- Check if email exists
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
