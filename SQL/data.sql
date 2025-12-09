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
-- EXTENDED DUMMY DATA FOR STRESS TESTING

-- 1. USERS (Developers)
-- Creating 10 Developers
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('dev1@example.com', 'Alice Dev', 'dbo', 'developer', 1);
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('dev2@example.com', 'Bob Coder', 'dbo', 'developer', 1);
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('dev3@example.com', 'Charlie Script', 'dbo', 'developer', 1);
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('dev4@example.com', 'Diana Bugfix', 'dbo', 'developer', 1);
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('dev5@example.com', 'Evan Stack', 'dbo', 'developer', 1);
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('dev6@example.com', 'Fiona Loop', 'dbo', 'developer', 1);
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('dev7@example.com', 'George Git', 'dbo', 'developer', 1);
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('dev8@example.com', 'Hannah Hash', 'dbo', 'developer', 1);
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('dev9@example.com', 'Ian Index', 'dbo', 'developer', 1);
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('dev10@example.com', 'Julia Java', 'dbo', 'developer', 1);

-- 2. USERS (PMs)
-- Creating 3 more PMs
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('pm3@example.com', 'Kevin Manager', 'dbo', 'pm', 1);
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('pm4@example.com', 'Laura Lead', 'dbo', 'pm', 1);
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('pm5@example.com', 'Mike Master', 'dbo', 'pm', 1);

-- 3. CLIENTS
-- Creating 5 more Clients (Users + Client Entries)
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('client4@example.com', 'Nancy Corp', 'dbo', 'client', 1);
INSERT INTO CLIENTS (USER_ID, COMPANY_NAME, INDUSTRY, TIMEZONE) VALUES ((SELECT user_id FROM users WHERE email='client4@example.com'), 'Nebula Nets', 'IT', 'UTC-5');

INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('client5@example.com', 'Oliver Org', 'dbo', 'client', 1);
INSERT INTO CLIENTS (USER_ID, COMPANY_NAME, INDUSTRY, TIMEZONE) VALUES ((SELECT user_id FROM users WHERE email='client5@example.com'), 'Omega Ops', 'Logistics', 'UTC+0');

INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('client6@example.com', 'Peter Inc', 'dbo', 'client', 1);
INSERT INTO CLIENTS (USER_ID, COMPANY_NAME, INDUSTRY, TIMEZONE) VALUES ((SELECT user_id FROM users WHERE email='client6@example.com'), 'Prime Parts', 'Manufacturing', 'UTC+8');

INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('client7@example.com', 'Quinn Co', 'dbo', 'client', 1);
INSERT INTO CLIENTS (USER_ID, COMPANY_NAME, INDUSTRY, TIMEZONE) VALUES ((SELECT user_id FROM users WHERE email='client7@example.com'), 'Quantum Quests', 'Research', 'UTC-8');

INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('client8@example.com', 'Rachel Ltd', 'dbo', 'client', 1);
INSERT INTO CLIENTS (USER_ID, COMPANY_NAME, INDUSTRY, TIMEZONE) VALUES ((SELECT user_id FROM users WHERE email='client8@example.com'), 'Radiant Rays', 'Energy', 'UTC+2');

-- 4. PROPOSALS (Bulk)
-- Generate 20 proposals in various states
-- PM User One (pm@example.com) gets 5 projects (Max capacity)
-- PM User Two (pm2@example.com) gets 3 projects
-- PM User Three (pm3@example.com) gets 2 projects
-- Others unassigned or rejected

-- PM 1 (pm@example.com) Projects
INSERT INTO PROPOSALS (CLIENT_ID, PM_USER_ID, TITLE, DESCRIPTION, VALUE, STATUS, CREATED_AT, EXPECTED_CLOSE)
VALUES ((SELECT client_id FROM clients WHERE company_name='Alpha Corp'), (SELECT user_id FROM users WHERE email='pm@example.com'), 'Alpha Web Portal', 'Full stack web portal.', 50000, 'active', SYSDATE-60, SYSDATE+30);

INSERT INTO PROPOSALS (CLIENT_ID, PM_USER_ID, TITLE, DESCRIPTION, VALUE, STATUS, CREATED_AT, EXPECTED_CLOSE)
VALUES ((SELECT client_id FROM clients WHERE company_name='Beta Solutions'), (SELECT user_id FROM users WHERE email='pm@example.com'), 'Beta Analytics', 'Data analytics tool.', 75000, 'active', SYSDATE-45, SYSDATE+45);

INSERT INTO PROPOSALS (CLIENT_ID, PM_USER_ID, TITLE, DESCRIPTION, VALUE, STATUS, CREATED_AT, EXPECTED_CLOSE)
VALUES ((SELECT client_id FROM clients WHERE company_name='Gamma Innovations'), (SELECT user_id FROM users WHERE email='pm@example.com'), 'Gamma CRM', 'Custom CRM.', 120000, 'in_progress', SYSDATE-30, SYSDATE+60);

INSERT INTO PROPOSALS (CLIENT_ID, PM_USER_ID, TITLE, DESCRIPTION, VALUE, STATUS, CREATED_AT, EXPECTED_CLOSE)
VALUES ((SELECT client_id FROM clients WHERE company_name='Nebula Nets'), (SELECT user_id FROM users WHERE email='pm@example.com'), 'Nebula Network Sec', 'Security overhaul.', 90000, 'active', SYSDATE-15, SYSDATE+90);

INSERT INTO PROPOSALS (CLIENT_ID, PM_USER_ID, TITLE, DESCRIPTION, VALUE, STATUS, CREATED_AT, EXPECTED_CLOSE)
VALUES ((SELECT client_id FROM clients WHERE company_name='Omega Ops'), (SELECT user_id FROM users WHERE email='pm@example.com'), 'Omega Logistics Track', 'Tracking system.', 65000, 'completed', SYSDATE-100, SYSDATE-10);

-- PM 2 (pm2@example.com) Projects
INSERT INTO PROPOSALS (CLIENT_ID, PM_USER_ID, TITLE, DESCRIPTION, VALUE, STATUS, CREATED_AT, EXPECTED_CLOSE)
VALUES ((SELECT client_id FROM clients WHERE company_name='Prime Parts'), (SELECT user_id FROM users WHERE email='pm2@example.com'), 'Prime Inventory', 'Inventory management.', 40000, 'active', SYSDATE-20, SYSDATE+40);

INSERT INTO PROPOSALS (CLIENT_ID, PM_USER_ID, TITLE, DESCRIPTION, VALUE, STATUS, CREATED_AT, EXPECTED_CLOSE)
VALUES ((SELECT client_id FROM clients WHERE company_name='Quantum Quests'), (SELECT user_id FROM users WHERE email='pm2@example.com'), 'Quantum Sim', 'Simulation engine.', 200000, 'in_progress', SYSDATE-10, SYSDATE+120);

INSERT INTO PROPOSALS (CLIENT_ID, PM_USER_ID, TITLE, DESCRIPTION, VALUE, STATUS, CREATED_AT, EXPECTED_CLOSE)
VALUES ((SELECT client_id FROM clients WHERE company_name='Radiant Rays'), (SELECT user_id FROM users WHERE email='pm2@example.com'), 'Radiant Solar Control', 'Solar panel control software.', 150000, 'submitted', SYSDATE-5, SYSDATE+100); 
-- Note: Status submitted but assigned to PM? Usually PM assigned at approval. Let's say 'submitted' waiting for admin approval.

-- 5. TASKS (Milestones & Subtasks)
-- Generate tasks for 'Alpha Web Portal' (PM 1)
-- Milestone 1
INSERT INTO TASKS (PROPOSAL_ID, TITLE, DESCRIPTION, STATUS, DUE_DATE, PRIORITY)
VALUES ((SELECT proposal_id FROM proposals WHERE title='Alpha Web Portal'), 'Alpha Phase 1: Design', 'Design Phase', 'done', SYSDATE-30, 'High');

-- Milestone 2
INSERT INTO TASKS (PROPOSAL_ID, TITLE, DESCRIPTION, STATUS, DUE_DATE, PRIORITY)
VALUES ((SELECT proposal_id FROM proposals WHERE title='Alpha Web Portal'), 'Alpha Phase 2: Backend', 'Backend Dev', 'in_progress', SYSDATE+15, 'High');

-- Subtasks for Milestone 2
INSERT INTO TASKS (PROPOSAL_ID, PARENT_TASK_ID, TITLE, DESCRIPTION, STATUS, DUE_DATE, PRIORITY, LOCKED_BY)
VALUES ((SELECT proposal_id FROM proposals WHERE title='Alpha Web Portal'), 
        (SELECT task_id FROM tasks WHERE title='Alpha Phase 2: Backend'), 
        'Setup DB', 'Oracle setup', 'done', SYSDATE-5, 'High', (SELECT user_id FROM users WHERE email='dev1@example.com'));

INSERT INTO TASKS (PROPOSAL_ID, PARENT_TASK_ID, TITLE, DESCRIPTION, STATUS, DUE_DATE, PRIORITY, LOCKED_BY)
VALUES ((SELECT proposal_id FROM proposals WHERE title='Alpha Web Portal'), 
        (SELECT task_id FROM tasks WHERE title='Alpha Phase 2: Backend'), 
        'API Endpoints', 'Create REST API', 'in_progress', SYSDATE+5, 'High', (SELECT user_id FROM users WHERE email='dev1@example.com'));

INSERT INTO TASKS (PROPOSAL_ID, PARENT_TASK_ID, TITLE, DESCRIPTION, STATUS, DUE_DATE, PRIORITY, LOCKED_BY)
VALUES ((SELECT proposal_id FROM proposals WHERE title='Alpha Web Portal'), 
        (SELECT task_id FROM tasks WHERE title='Alpha Phase 2: Backend'), 
        'Auth Module', 'JWT Auth', 'todo', SYSDATE+10, 'Medium', NULL);

-- Milestone 3
INSERT INTO TASKS (PROPOSAL_ID, TITLE, DESCRIPTION, STATUS, DUE_DATE, PRIORITY)
VALUES ((SELECT proposal_id FROM proposals WHERE title='Alpha Web Portal'), 'Alpha Phase 3: Frontend', 'React Frontend', 'todo', SYSDATE+45, 'Medium');


-- 6. MEETINGS
INSERT INTO MEETINGS (PROPOSAL_ID, MEETING_TYPE, SCHEDULED_START_DATE, SCHEDULED_END_DATE, SUBJECT, STATUS)
VALUES (
    (SELECT proposal_id FROM proposals WHERE title='Alpha Web Portal'), 
    'scrum', 
    SYSDATE + INTERVAL '1' DAY + INTERVAL '9' HOUR, 
    SYSDATE + INTERVAL '1' DAY + INTERVAL '10' HOUR, 
    'Daily Standup - Tomorrow', 
    'scheduled'
);

INSERT INTO MEETING_PARTICIPANTS (MEETING_ID, USER_ID, ATTENDANCE)
VALUES ((SELECT meeting_id FROM meetings WHERE subject='Daily Standup - Tomorrow'), (SELECT user_id FROM users WHERE email='pm@example.com'), 'invited');

INSERT INTO MEETING_PARTICIPANTS (MEETING_ID, USER_ID, ATTENDANCE)
VALUES ((SELECT meeting_id FROM meetings WHERE subject='Daily Standup - Tomorrow'), (SELECT user_id FROM users WHERE email='dev1@example.com'), 'invited');

-- Add an ongoing meeting (current time is between start and end)
INSERT INTO MEETINGS (PROPOSAL_ID, MEETING_TYPE, SCHEDULED_START_DATE, SCHEDULED_END_DATE, SUBJECT, STATUS)
VALUES (
    (SELECT proposal_id FROM proposals WHERE title='Beta Analytics'), 
    'review', 
    SYSDATE - INTERVAL '30' MINUTE, 
    SYSDATE + INTERVAL '30' MINUTE, 
    'Beta Analytics Review (Ongoing)', 
    'ongoing'
);

INSERT INTO MEETING_PARTICIPANTS (MEETING_ID, USER_ID, ATTENDANCE)
VALUES ((SELECT meeting_id FROM meetings WHERE subject='Beta Analytics Review (Ongoing)'), (SELECT user_id FROM users WHERE email='pm@example.com'), 'invited');

INSERT INTO MEETING_PARTICIPANTS (MEETING_ID, USER_ID, ATTENDANCE)
VALUES ((SELECT meeting_id FROM meetings WHERE subject='Beta Analytics Review (Ongoing)'), (SELECT user_id FROM users WHERE email='client@example.com'), 'invited');

-- Add a completed meeting (end time is in the past)
INSERT INTO MEETINGS (PROPOSAL_ID, MEETING_TYPE, SCHEDULED_START_DATE, SCHEDULED_END_DATE, SUBJECT, STATUS, MINUTES_OF_MEETING)
VALUES (
    (SELECT proposal_id FROM proposals WHERE title='Gamma CRM'), 
    'kickoff', 
    SYSDATE - INTERVAL '2' DAY - INTERVAL '10' HOUR, 
    SYSDATE - INTERVAL '2' DAY - INTERVAL '9' HOUR, 
    'Gamma CRM Kickoff (Completed)', 
    'completed', 
    'Discussed project scope and initial requirements. Action items assigned.'
);

INSERT INTO MEETING_PARTICIPANTS (MEETING_ID, USER_ID, ATTENDANCE)
VALUES ((SELECT meeting_id FROM meetings WHERE subject='Gamma CRM Kickoff (Completed)'), (SELECT user_id FROM users WHERE email='pm@example.com'), 'attended');

INSERT INTO MEETING_PARTICIPANTS (MEETING_ID, USER_ID, ATTENDANCE)
VALUES ((SELECT meeting_id FROM meetings WHERE subject='Gamma CRM Kickoff (Completed)'), (SELECT user_id FROM users WHERE email='client3@example.com'), 'attended');

-- Add a scheduled meeting for a client
INSERT INTO MEETINGS (PROPOSAL_ID, MEETING_TYPE, SCHEDULED_START_DATE, SCHEDULED_END_DATE, SUBJECT, STATUS)
VALUES (
    (SELECT proposal_id FROM proposals WHERE title='Website Redesign Project'), 
    'client_sync', 
    SYSDATE + INTERVAL '3' DAY + INTERVAL '14' HOUR, 
    SYSDATE + INTERVAL '3' DAY + INTERVAL '15' HOUR, 
    'Client Sync - Website Redesign', 
    'scheduled'
);

INSERT INTO MEETING_PARTICIPANTS (MEETING_ID, USER_ID, ATTENDANCE)
VALUES ((SELECT meeting_id FROM meetings WHERE subject='Client Sync - Website Redesign'), (SELECT user_id FROM users WHERE email='pm@example.com'), 'invited');

INSERT INTO MEETING_PARTICIPANTS (MEETING_ID, USER_ID, ATTENDANCE)
VALUES ((SELECT meeting_id FROM meetings WHERE subject='Client Sync - Website Redesign'), (SELECT user_id FROM users WHERE email='client@example.com'), 'invited');

COMMIT;
