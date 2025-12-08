-- 1. Add columns to proposals table
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE proposals ADD functional_requirements CLOB';
    EXECUTE IMMEDIATE 'ALTER TABLE proposals ADD non_functional_requirements CLOB';
    EXECUTE IMMEDIATE 'ALTER TABLE proposals ADD client_comments CLOB';
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore if columns already exist
END;
/

-- 2. Update create_client_proposal to include new fields
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
    -- Get client_id for the given user_id
    SELECT client_id INTO v_client_id FROM clients WHERE user_id = p_user_id;

    INSERT INTO proposals (
        client_id, 
        title, 
        description, 
        value, 
        status, 
        created_at, 
        expected_close, 
        functional_requirements, 
        non_functional_requirements, 
        client_comments
    )
    VALUES (
        v_client_id, 
        p_title, 
        p_description, 
        p_value, 
        'submitted', 
        SYSDATE, 
        p_expected_close,
        p_functional_req,
        p_non_functional_req,
        p_client_comments
    )
    RETURNING proposal_id INTO p_proposal_id;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/
