-- Trigger/Job to deactivate clients who haven't sent a proposal in 6 months.
-- Since standard triggers fire on data events (Insert/Update/Delete) and not time,
-- the correct approach is a Scheduled Job that runs daily.

-- 1. Create the procedure to perform the check and update.
CREATE OR REPLACE PROCEDURE deactivate_dormant_clients AS
BEGIN
    UPDATE users u
    SET u.is_active = 0
    WHERE u.user_id IN (
        SELECT c.user_id
        FROM clients c
        JOIN proposals p ON c.client_id = p.client_id
        GROUP BY c.user_id
        HAVING MAX(p.created_at) < ADD_MONTHS(SYSDATE, -6)
    )
    AND u.role = 'client'
    AND u.is_active = 1;

    COMMIT;
END;
/

-- 2. Create a scheduled job to run this procedure daily.
-- Note: This requires the CREATE JOB privilege.
BEGIN
    -- Drop the job if it already exists to avoid errors on re-run
    BEGIN
        DBMS_SCHEDULER.drop_job(job_name => 'DEACTIVATE_DORMANT_CLIENTS_JOB');
    EXCEPTION
        WHEN OTHERS THEN NULL; -- Ignore if job doesn't exist
    END;

    DBMS_SCHEDULER.create_job (
        job_name        => 'DEACTIVATE_DORMANT_CLIENTS_JOB',
        job_type        => 'STORED_PROCEDURE',
        job_action      => 'deactivate_dormant_clients',
        start_date      => SYSDATE,
        repeat_interval => 'FREQ=DAILY; BYHOUR=0; BYMINUTE=0; BYSECOND=0', -- Run every midnight
        enabled         => TRUE,
        comments        => 'Daily job to deactivate clients with no proposals in the last 6 months.'
    );
END;
/

-- Trigger to automatically update completed_date when a task is marked as done
CREATE OR REPLACE TRIGGER trg_task_completion
BEFORE UPDATE ON tasks
FOR EACH ROW
BEGIN
    IF :NEW.status = 'done' AND :OLD.status != 'done' THEN
        :NEW.completed_date := SYSDATE;
    ELSIF :NEW.status != 'done' THEN
        :NEW.completed_date := NULL;
    END IF;
END;
/

-- Trigger to prevent creating tasks for closed/completed proposals
CREATE OR REPLACE TRIGGER trg_prevent_tasks_on_closed_proposal
BEFORE INSERT ON tasks
FOR EACH ROW
DECLARE
    v_proposal_status VARCHAR2(50);
BEGIN
    SELECT status INTO v_proposal_status
    FROM proposals
    WHERE proposal_id = :NEW.proposal_id;

    IF v_proposal_status IN ('completed', 'rejected', 'cancelled') THEN
        RAISE_APPLICATION_ERROR(-20001, 'Cannot add tasks to a closed or rejected proposal.');
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        -- Should be handled by FK constraint, but safe to ignore here
        NULL;
END;
/
