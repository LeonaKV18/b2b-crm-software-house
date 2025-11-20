-- WARNING: Storing plain text passwords is a security risk and should not be done in a real application.
-- This is for proof-of-concept purposes only.
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE)
VALUES ('admin@example.com', 'admin User', 'dbo', 'admin', 1);

INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE)
VALUES ('pm@example.com', 'PM User', 'dbo', 'pm', 1);

INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE)
VALUES ('client@example.com', 'Client User', 'dbo', 'client', 1);

INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE)
VALUES ('developer@example.com', 'Developer User', 'dbo', 'developer', 1);

INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE)
VALUES ('sales@example.com', 'Sales User', 'dbo', 'sales', 1);

commit;