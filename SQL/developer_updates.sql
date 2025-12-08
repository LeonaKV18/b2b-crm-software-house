-- 1. Procedure to get projects for a developer with current milestone info
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
            team_members tm ON p.proposal_id IN (SELECT proposal_id FROM tasks WHERE team_id = tm.team_id)
        LEFT JOIN
            tasks t ON p.proposal_id = t.proposal_id
        WHERE
            (tm.user_id = p_user_id OR t.locked_by = p_user_id)
            AND p.status IN ('active', 'in_progress');
END;
/

-- 2. Update get_developer_tasks to include milestone (parent task) info
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
            pt.title AS milestone -- Parent task title
        FROM
            tasks t
        JOIN
            proposals p ON t.proposal_id = p.proposal_id
        LEFT JOIN
            tasks pt ON t.parent_task_id = pt.task_id
        WHERE
            t.locked_by = p_user_id
            AND t.parent_task_id IS NOT NULL -- Only show subtasks, assuming developers work on subtasks
        ORDER BY
            p.title, pt.due_date, t.due_date;
END;
/
