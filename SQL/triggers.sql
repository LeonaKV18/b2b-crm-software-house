-- Trigger to update last_interaction on new proposal
CREATE OR REPLACE TRIGGER trg_update_interaction_on_proposal
AFTER INSERT ON proposals
FOR EACH ROW
DECLARE
    v_current_interaction TIMESTAMP;
BEGIN
    SELECT last_interaction INTO v_current_interaction
    FROM clients
    WHERE client_id = :new.client_id;

    IF v_current_interaction IS NULL OR :new.created_at > v_current_interaction THEN
        UPDATE clients
        SET last_interaction = :new.created_at
        WHERE client_id = :new.client_id;
    END IF;
END;
/

-- Trigger to update last_interaction on new meeting invitation
CREATE OR REPLACE TRIGGER trg_update_interaction_on_meeting
AFTER INSERT ON meeting_participants
FOR EACH ROW
DECLARE
    v_user_role VARCHAR2(20);
    v_meeting_date TIMESTAMP;
    v_client_id NUMBER;
    v_current_interaction TIMESTAMP;
BEGIN
    -- Check if the participant is a client
    SELECT role INTO v_user_role
    FROM users
    WHERE user_id = :new.user_id;

    IF v_user_role = 'client' THEN
        -- Get the scheduled date of the meeting
        SELECT scheduled_date INTO v_meeting_date
        FROM meetings
        WHERE meeting_id = :new.meeting_id;

        -- Get the client_id associated with the user
        SELECT client_id, last_interaction INTO v_client_id, v_current_interaction
        FROM clients
        WHERE user_id = :new.user_id;
        
        -- Update the last_interaction timestamp if the new meeting is later
        IF v_current_interaction IS NULL OR v_meeting_date > v_current_interaction THEN
            UPDATE clients
            SET last_interaction = v_meeting_date
            WHERE client_id = v_client_id;
        END IF;
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        NULL; -- Ignore if user or client not found
END;
/

-- Trigger to set initial last_interaction on client creation
CREATE OR REPLACE TRIGGER trg_client_init_interaction
BEFORE INSERT ON clients
FOR EACH ROW
BEGIN
    IF :NEW.last_interaction IS NULL THEN
        :NEW.last_interaction := CURRENT_TIMESTAMP;
    END IF;
END;
/