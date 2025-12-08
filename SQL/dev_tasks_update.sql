-- Procedure to get ALL tasks for a project (for Developer view)
CREATE OR REPLACE PROCEDURE get_all_project_tasks (
    p_project_id IN NUMBER,
    p_tasks_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_tasks_cursor FOR
        SELECT
            t.task_id AS id,
            t.parent_task_id AS parentId,
            t.title AS title,
            t.description AS description,
            t.status AS status,
            TO_CHAR(t.due_date, 'YYYY-MM-DD') AS dueDate,
            t.priority AS priority,
            t.locked_by AS lockedBy,
            u.name AS ownerName
        FROM
            tasks t
        LEFT JOIN
            users u ON t.locked_by = u.user_id
        WHERE
            t.proposal_id = p_project_id
        ORDER BY
            t.due_date ASC;
END;
/
