-- Users
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('admin@example.com', 'Admin User', 'dbo', 'admin', 1);
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('pm@example.com', 'PM User One', 'dbo', 'pm', 1);
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('client@example.com', 'Client User One', 'dbo', 'client', 1);
INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE) VALUES ('developer@example.com', 'Developer User', 'dbo', 'developer', 1);

-- Clients
-- Fixed: Removed INDUSTRY, TIMEZONE which are not in table.sql schema
INSERT INTO CLIENTS (USER_ID, COMPANY_NAME, LAST_INTERACTION)
SELECT user_id, 'Acme Corp', SYSDATE
FROM USERS WHERE EMAIL = 'client@example.com';

-- Contacts
INSERT INTO CONTACTS (USER_ID, CLIENT_ID, FULL_NAME, EMAIL, PHONE, CONTACT_TYPE)
SELECT u.user_id, c.client_id, 'Client Contact', 'client@example.com', '555-0100', 'primary'
FROM USERS u JOIN CLIENTS c ON u.user_id = c.user_id
WHERE u.EMAIL = 'client@example.com';

-- Proposals (Projects)
INSERT INTO PROPOSALS (CLIENT_ID, PM_USER_ID, TITLE, DESCRIPTION, ESTIMATED_HOURS, ACTUAL_HOURS, VALUE, STATUS, ADMIN_COMMENTS, SRS_APPROVED, CREATED_AT, EXPECTED_CLOSE, ACTUAL_CLOSE)
SELECT c.client_id, pm.user_id, 'Website Redesign', 'Complete redesign of corporate website', 200, 50, 15000, 'in_progress', 'Approved by admin', 1, SYSDATE - 10, SYSDATE + 20, NULL
FROM CLIENTS c
JOIN USERS u ON c.user_id = u.user_id
CROSS JOIN USERS pm
WHERE u.EMAIL = 'client@example.com' AND pm.EMAIL = 'pm@example.com';

-- Milestones (Top-level Tasks)
INSERT INTO TASKS (PROPOSAL_ID, PARENT_TASK_ID, LOCKED_BY, TITLE, DESCRIPTION, STATUS, DUE_DATE, PRIORITY)
SELECT p.proposal_id, NULL, NULL, 'Design Phase', 'Complete UI/UX design', 'done', SYSDATE - 2, 'High'
FROM PROPOSALS p WHERE p.TITLE = 'Website Redesign';

INSERT INTO TASKS (PROPOSAL_ID, PARENT_TASK_ID, LOCKED_BY, TITLE, DESCRIPTION, STATUS, DUE_DATE, PRIORITY)
SELECT p.proposal_id, NULL, NULL, 'Development Phase', 'Frontend and Backend implementation', 'in_progress', SYSDATE + 10, 'High'
FROM PROPOSALS p WHERE p.TITLE = 'Website Redesign';

-- Subtasks (Assigned to Developer)
INSERT INTO TASKS (PROPOSAL_ID, PARENT_TASK_ID, LOCKED_BY, TITLE, DESCRIPTION, STATUS, DUE_DATE, PRIORITY)
SELECT p.proposal_id, t.task_id, dev.user_id, 'Homepage Layout', 'Implement responsive homepage', 'in_progress', SYSDATE + 5, 'Medium'
FROM PROPOSALS p
JOIN TASKS t ON p.proposal_id = t.proposal_id
CROSS JOIN USERS dev
WHERE p.TITLE = 'Website Redesign' AND t.TITLE = 'Development Phase' AND dev.EMAIL = 'developer@example.com';

-- Meetings
INSERT INTO MEETINGS (PROPOSAL_ID, MEETING_TYPE, SCHEDULED_START_DATE, SCHEDULED_END_DATE, SUBJECT, STATUS)
SELECT p.proposal_id, 'Kickoff', SYSDATE - 9, SYSDATE - 9 + (1/24), 'Project Kickoff', 'completed'
FROM PROPOSALS p WHERE p.TITLE = 'Website Redesign';

-- Meeting Participants
-- Fixed: Removed ATTENDANCE column which is not in table.sql schema
INSERT INTO MEETING_PARTICIPANTS (MEETING_ID, USER_ID)
SELECT m.meeting_id, u.user_id
FROM MEETINGS m
CROSS JOIN USERS u
WHERE m.SUBJECT = 'Project Kickoff' AND u.EMAIL IN ('pm@example.com', 'client@example.com', 'developer@example.com');

-- Invoices
INSERT INTO INVOICES (CLIENT_ID, PROPOSAL_ID, AMOUNT, ISSUE_DATE, DUE_DATE, STATUS)
SELECT c.client_id, p.proposal_id, 5000, SYSDATE - 5, SYSDATE + 25, 'pending'
FROM CLIENTS c
JOIN PROPOSALS p ON c.client_id = p.client_id
JOIN USERS u ON c.user_id = u.user_id
WHERE u.EMAIL = 'client@example.com';

COMMIT;
