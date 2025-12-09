-- Users
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('admin@example.com', 'Admin User', 'dbo', 'admin', 1);
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('pm@example.com', 'PM User One', 'dbo', 'pm', 1);
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('client@example.com', 'Client User One', 'dbo', 'client', 1);
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('developer@example.com', 'Developer User', 'dbo', 'developer', 1);

commit;