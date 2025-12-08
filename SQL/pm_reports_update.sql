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

    -- Team Utilization: (Tasks In Progress / Total Tasks) * 100
    SELECT NVL(ROUND(
        (SELECT COUNT(*) FROM tasks t JOIN proposals p ON t.proposal_id = p.proposal_id WHERE p.pm_user_id = p_user_id AND t.status = 'in_progress')
        / NULLIF((SELECT COUNT(*) FROM tasks t JOIN proposals p ON t.proposal_id = p.proposal_id WHERE p.pm_user_id = p_user_id), 0)
        * 100), 0)
    INTO p_team_utilization
    FROM DUAL;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_active_projects_count := 0;
        p_delayed_projects_count := 0;
        p_on_schedule_projects_count := 0;
        p_team_utilization := 0;
        p_completed_projects_count := 0;
        p_milestones_on_time := 0;
        p_milestones_delayed := 0;
    WHEN OTHERS THEN
        p_active_projects_count := 0;
        p_delayed_projects_count := 0;
        p_on_schedule_projects_count := 0;
        p_team_utilization := 0;
        p_completed_projects_count := 0;
        p_milestones_on_time := 0;
        p_milestones_delayed := 0;
END;
/