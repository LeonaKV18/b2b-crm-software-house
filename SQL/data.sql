-- WARNING: Storing plain text passwords is a security risk and should not be done in a real application.
-- This is for proof-of-concept purposes only.

-- Existing Users
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE)
VALUES ('admin@example.com', 'Admin User', 'dbo', 'admin', 1);

INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE)
VALUES ('pm@example.com', 'PM User One', 'dbo', 'pm', 1);

INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE)
VALUES ('client@example.com', 'Client User One', 'dbo', 'client', 1);

INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE)
VALUES ('developer@example.com', 'Developer User', 'dbo', 'developer', 1);

-- New PM User
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE)
VALUES ('pm2@example.com', 'PM User Two', 'dbo', 'pm', 1);

-- New Client Users
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE)
VALUES ('client2@example.com', 'Client User Two', 'dbo', 'client', 1);

INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE)
VALUES ('client3@example.com', 'Client User Three', 'dbo', 'client', 1);


-- Clients linked to the client users
-- Assuming user_id for client@example.com is 3, client2@example.com is 6, client3@example.com is 7
INSERT INTO CLIENTS (USER_ID, COMPANY_NAME, INDUSTRY, TIMEZONE)
VALUES (3, 'Alpha Corp', 'Technology', 'UTC-5');

INSERT INTO CLIENTS (USER_ID, COMPANY_NAME, INDUSTRY, TIMEZONE)
VALUES (6, 'Beta Solutions', 'Consulting', 'UTC-8');

INSERT INTO CLIENTS (USER_ID, COMPANY_NAME, INDUSTRY, TIMEZONE)
VALUES (7, 'Gamma Innovations', 'Manufacturing', 'UTC+1');


-- Proposals for testing Admin functionality
-- Assuming:
-- PM User One (user_id=2)
-- PM User Two (user_id=5)
-- Alpha Corp (client_id=1)
-- Beta Solutions (client_id=2)
-- Gamma Innovations (client_id=3)


-- Submitted proposals (ready for Admin action)
INSERT INTO PROPOSALS (CLIENT_ID, PM_USER_ID, TITLE, DESCRIPTION, VALUE, STATUS, SRS_APPROVED, CREATED_AT)
VALUES (1, NULL, 'Website Redesign Project', 'Redesign of corporate website for Alpha Corp.', 15000, 'submitted', 0, SYSDATE);

INSERT INTO PROPOSALS (CLIENT_ID, PM_USER_ID, TITLE, DESCRIPTION, VALUE, STATUS, SRS_APPROVED, CREATED_AT)
VALUES (2, NULL, 'Mobile App Development', 'Development of an iOS and Android mobile application.', 45000, 'submitted', 0, SYSDATE - 7);

INSERT INTO PROPOSALS (CLIENT_ID, PM_USER_ID, TITLE, DESCRIPTION, VALUE, STATUS, SRS_APPROVED, CREATED_AT)
VALUES (3, NULL, 'CRM Integration', 'Integration of new CRM system with existing infrastructure.', 20000, 'submitted', 0, SYSDATE - 14);


-- Approved proposal with comments
INSERT INTO PROPOSALS (CLIENT_ID, PM_USER_ID, TITLE, DESCRIPTION, VALUE, STATUS, SRS_APPROVED, CREATED_AT, ADMIN_COMMENTS)
VALUES (1, NULL, 'E-commerce Platform Upgrade', 'Upgrade existing e-commerce platform to latest version.', 30000, 'approved', 0, SYSDATE - 20, 'Approved with high priority. PM to be assigned soon.');


-- Rejected proposal with comments
INSERT INTO PROPOSALS (CLIENT_ID, PM_USER_ID, TITLE, DESCRIPTION, VALUE, STATUS, SRS_APPROVED, CREATED_AT, ADMIN_COMMENTS)
VALUES (2, NULL, 'Custom Software Solution', 'Build a bespoke software solution for inventory management.', 60000, 'rejected', 0, SYSDATE - 25, 'Rejected due to budget constraints from client side.');


-- Proposals for PM User One (user_id=2) - testing the 5 project limit
-- PM User One has 4 active/approved projects
INSERT INTO PROPOSALS (CLIENT_ID, PM_USER_ID, TITLE, DESCRIPTION, VALUE, STATUS, SRS_APPROVED, CREATED_AT)
VALUES (1, 2, 'Marketing Campaign Management', 'Develop and execute digital marketing campaigns.', 12000, 'active', 1, SYSDATE - 30);

INSERT INTO PROPOSALS (CLIENT_ID, PM_USER_ID, TITLE, DESCRIPTION, VALUE, STATUS, SRS_APPROVED, CREATED_AT)
VALUES (2, 2, 'Data Analytics Dashboard', 'Create an interactive dashboard for sales data.', 25000, 'approved', 1, SYSDATE - 40);

INSERT INTO PROPOSALS (CLIENT_ID, PM_USER_ID, TITLE, DESCRIPTION, VALUE, STATUS, SRS_APPROVED, CREATED_AT)
VALUES (3, 2, 'Cloud Migration Service', 'Migrate on-premise infrastructure to cloud.', 50000, 'in_progress', 1, SYSDATE - 50);

INSERT INTO PROPOSALS (CLIENT_ID, PM_USER_ID, TITLE, DESCRIPTION, VALUE, STATUS, SRS_APPROVED, CREATED_AT)
VALUES (1, 2, 'Security Audit & Compliance', 'Perform a comprehensive security audit.', 18000, 'active', 1, SYSDATE - 60);


-- Proposal for PM User Two (user_id=5) - has only 1 project
INSERT INTO PROPOSALS (CLIENT_ID, PM_USER_ID, TITLE, DESCRIPTION, VALUE, STATUS, SRS_APPROVED, CREATED_AT)
VALUES (2, 5, 'UI/UX Redesign Service', 'Redesign the user interface for an existing application.', 22000, 'approved', 1, SYSDATE - 35);


commit;