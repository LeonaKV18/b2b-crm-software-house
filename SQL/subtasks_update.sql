-- 1. Add parent_task_id to tasks table to support subtasks
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE tasks ADD parent_task_id NUMBER';
    EXECUTE IMMEDIATE 'ALTER TABLE tasks ADD CONSTRAINT fk_tasks_parent FOREIGN KEY (parent_task_id) REFERENCES tasks(task_id) ON DELETE CASCADE';
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore if column already exists
END;
/

-- 2. Procedure to create a subtask
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
    -- Get proposal_id from parent task
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

-- 3. Procedure to get subtasks for a milestone
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

-- 4. Update get_pm_milestones to only show TOP LEVEL tasks (Milestones)
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
            AND t.parent_task_id IS NULL; -- Only top level tasks
END;
/

-- 5. Update project progress calculations to use Task Counts instead of hours
-- Update get_all_projects
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

-- Update get_pm_projects
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
            -- Calculate progress based on tasks
             NVL(ROUND(
                (SELECT COUNT(*) FROM tasks t WHERE t.proposal_id = p.proposal_id AND t.parent_task_id IS NULL AND t.status = 'done') / 
                NULLIF((SELECT COUNT(*) FROM tasks t WHERE t.proposal_id = p.proposal_id AND t.parent_task_id IS NULL), 0)
            * 100), 0) AS progress,
            TO_CHAR(p.expected_close, 'YYYY-MM-DD') AS deadline,
            (SELECT COUNT(DISTINCT tm.user_id)
             FROM tasks t
             JOIN team_members tm ON t.team_id = tm.team_id
             WHERE t.proposal_id = p.proposal_id) AS team,
            p.status AS status
        FROM
            proposals p
        JOIN
            clients c ON p.client_id = c.client_id
        WHERE
            p.pm_user_id = p_user_id;
END;
/

-- Update get_project_details
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
