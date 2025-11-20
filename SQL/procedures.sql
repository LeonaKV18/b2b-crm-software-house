-- This file will contain all the procedure creation scripts.

CREATE OR REPLACE PROCEDURE verify_user (
    p_email IN VARCHAR2,
    p_password_hash IN VARCHAR2,
    p_user_id OUT NUMBER,
    p_role OUT VARCHAR2,
    p_name OUT VARCHAR2, -- Assuming there is a name column in the users table
    p_is_valid OUT NUMBER
)
AS
BEGIN
    SELECT user_id, role, name INTO p_user_id, p_role, p_name
    FROM users
    WHERE email = p_email AND password_hash = p_password_hash AND is_active = 1;

    p_is_valid := 1; -- User is valid
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_is_valid := 0; -- User is not valid
    WHEN OTHERS THEN
        p_is_valid := 0; -- An error occurred
END;
/