-- WARNING: Storing plain text passwords is a security risk and should not be done in a real application.
-- This is for proof-of-concept purposes only.

------------------------------ Users --------------------------------------

INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE)
VALUES ('admin@example.com', 'admin User', 'dbo', 'admin', 1);

INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE)
VALUES ('pm@example.com', 'PM User', 'dbo', 'pm', 1);

INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE)
VALUES ('client@example.com', 'Client User', 'dbo', 'client', 1);

INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE)
VALUES ('developer1@example.com', 'Developer User 1', 'dbo', 'developer', 1);

INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE)
VALUES ('developer2@example.com', 'Developer User 2', 'dbo', 'developer', 1);

INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE)
VALUES ('developer3@example.com', 'Developer User 3', 'dbo', 'developer', 1);

INSERT INTO USERS (EMAIL, NAME, PASSWORD, ROLE, IS_ACTIVE)
VALUES ('sales@example.com', 'Sales User', 'dbo', 'sales', 1);

COMMIT;

------------------------------ Clients --------------------------------------

INSERT INTO CLIENTS (USER_ID, COMPANY_NAME, INDUSTRY, TIMEZONE)
VALUES (
    (SELECT user_id FROM USERS WHERE email = 'client@example.com'),
    'Company 1',
    'Technology',
    'UTC'
);
COMMIT;

------------------------------ Contacts --------------------------------------
INSERT INTO CONTACTS (USER_ID, CLIENT_ID, FULL_NAME, EMAIL, PHONE, CONTACT_TYPE)
VALUES (
    (SELECT user_id FROM USERS WHERE email = 'client@example.com'),
    (SELECT client_id FROM CLIENTS WHERE user_id = (SELECT user_id FROM USERS WHERE email = 'client@example.com')),
    'John Doe',
    'johndoe@company1.com',
    '1234567890',
    'primary'
);
COMMIT;

------------------------------ Teams --------------------------------------

INSERT INTO TEAMS (TEAM_NAME, CREATED_AT) 
VALUES ('Development Team A', SYSDATE);
COMMIT;

INSERT INTO TEAMS (TEAM_NAME, CREATED_AT) 
VALUES ('Development Team B', SYSDATE);
COMMIT;

------------------------------ Team Members --------------------------------------

-- Add Developer 1 to Team A
INSERT INTO TEAM_MEMBERS (TEAM_ID, USER_ID, ALLOCATION_PERCENTAGE, ASSIGNED_AT)
VALUES (
    (SELECT team_id FROM TEAMS WHERE team_name = 'Development Team A'),
    (SELECT user_id FROM USERS WHERE email = 'developer1@example.com'),
    80,
    SYSDATE
);
COMMIT;

-- Add Developer 2 to Team A
INSERT INTO TEAM_MEMBERS (TEAM_ID, USER_ID, ALLOCATION_PERCENTAGE, ASSIGNED_AT)
VALUES (
    (SELECT team_id FROM TEAMS WHERE team_name = 'Development Team A'),
    (SELECT user_id FROM USERS WHERE email = 'developer2@example.com'),
    60,
    SYSDATE
);
COMMIT;

-- Add Developer 3 to Team B
INSERT INTO TEAM_MEMBERS (TEAM_ID, USER_ID, ALLOCATION_PERCENTAGE, ASSIGNED_AT)
VALUES (
    (SELECT team_id FROM TEAMS WHERE team_name = 'Development Team B'),
    (SELECT user_id FROM USERS WHERE email = 'developer3@example.com'),
    70, 
    SYSDATE
);
COMMIT;

------------------------------ Proposals --------------------------------------

-- Proposal 1: ACTIVE with ongoing tasks
INSERT INTO PROPOSALS (
    CLIENT_ID,
    PM_USER_ID,
    TITLE,
    DESCRIPTION,
    STATUS,
    VALUE,
    EXPECTED_CLOSE
) VALUES (
    (SELECT c.client_id 
     FROM clients c JOIN users u ON c.user_id = u.user_id
     WHERE u.email = 'client@example.com'),
    (SELECT u.user_id FROM users u WHERE u.email = 'pm@example.com'),
    'Project A: Website',
    'Website development project',
    'active',
    25000,
    SYSDATE + 30
);
COMMIT;

-- Proposal 2: ACTIVE but DELAYED
INSERT INTO PROPOSALS (
    CLIENT_ID,
    PM_USER_ID,
    TITLE,
    DESCRIPTION,
    STATUS,
    VALUE,
    EXPECTED_CLOSE
) VALUES (
    (SELECT c.client_id 
     FROM clients c JOIN users u ON c.user_id = u.user_id
     WHERE u.email = 'client@example.com'),
    (SELECT u.user_id FROM users u WHERE u.email = 'pm@example.com'),
    'Project B: Mobile App',
    'Mobile application development',
    'active',
    50000,
    SYSDATE - 5
);
COMMIT;

-- Proposal 3: COMPLETED
INSERT INTO PROPOSALS (
    CLIENT_ID,
    PM_USER_ID,
    TITLE,
    DESCRIPTION,
    STATUS,
    VALUE,
    EXPECTED_CLOSE,
    ACTUAL_CLOSE
) VALUES (
    (SELECT c.client_id 
     FROM clients c JOIN users u ON c.user_id = u.user_id
     WHERE u.email = 'client@example.com'),
    (SELECT u.user_id FROM users u WHERE u.email = 'pm@example.com'),
    'Project C: E-commerce',
    'E-commerce platform',
    'completed',
    100000,
    SYSDATE - 30,
    SYSDATE - 25
);
COMMIT;

-- Proposal 4: SUBMITTED
INSERT INTO PROPOSALS (
    CLIENT_ID,
    PM_USER_ID,
    TITLE,
    DESCRIPTION,
    STATUS,
    VALUE,
    EXPECTED_CLOSE
) VALUES (
    (SELECT c.client_id 
     FROM clients c JOIN users u ON c.user_id = u.user_id
     WHERE u.email = 'client@example.com'),
    (SELECT u.user_id FROM users u WHERE u.email = 'pm@example.com'),
    'Project D: CRM System',
    'Customer relationship management',
    'submitted',
    75000,
    SYSDATE + 60
);
COMMIT;

------------------------------ Tasks --------------------------------------

-- Tasks for Proposal 1 (Active, on schedule)
INSERT INTO TASKS (PROPOSAL_ID, TEAM_ID, LOCKED_BY, TITLE, STATUS, DUE_DATE, COMPLETED_DATE)
SELECT 
    p.proposal_id,
    (SELECT team_id FROM TEAMS WHERE team_name = 'Development Team A'),
    (SELECT user_id FROM USERS WHERE email = 'developer1@example.com'),
    'Design',
    'done',
    SYSDATE - 10,
    SYSDATE - 9
FROM PROPOSALS p
WHERE p.title = 'Project A: Website';
COMMIT;

INSERT INTO TASKS (PROPOSAL_ID, TEAM_ID, LOCKED_BY, TITLE, STATUS, DUE_DATE)
SELECT 
    p.proposal_id,
    (SELECT team_id FROM TEAMS WHERE team_name = 'Development Team A'),
    (SELECT user_id FROM USERS WHERE email = 'developer1@example.com'),
    'Frontend',
    'in_progress',
    SYSDATE + 20
FROM PROPOSALS p
WHERE p.title = 'Project A: Website';
COMMIT;

INSERT INTO TASKS (PROPOSAL_ID, TEAM_ID, LOCKED_BY, TITLE, STATUS, DUE_DATE)
SELECT 
    p.proposal_id,
    (SELECT team_id FROM TEAMS WHERE team_name = 'Development Team A'),
    (SELECT user_id FROM USERS WHERE email = 'developer2@example.com'),
    'Backend',
    'todo',
    SYSDATE + 25
FROM PROPOSALS p
WHERE p.title = 'Project A: Website';
COMMIT;

-- Tasks for Proposal 2 (Active, DELAYED - has overdue task)
INSERT INTO TASKS (PROPOSAL_ID, TEAM_ID, LOCKED_BY, TITLE, STATUS, DUE_DATE, COMPLETED_DATE)
SELECT 
    p.proposal_id,
    (SELECT team_id FROM TEAMS WHERE team_name = 'Development Team A'),
    (SELECT user_id FROM USERS WHERE email = 'developer1@example.com'),
    'Requirements',
    'done',
    SYSDATE - 20,
    SYSDATE - 18
FROM PROPOSALS p
WHERE p.title = 'Project B: Mobile App';
COMMIT;

INSERT INTO TASKS (PROPOSAL_ID, TEAM_ID, LOCKED_BY, TITLE, STATUS, DUE_DATE)
SELECT 
    p.proposal_id,
    (SELECT team_id FROM TEAMS WHERE team_name = 'Development Team A'),
    (SELECT user_id FROM USERS WHERE email = 'developer2@example.com'),
    'Design Mockups',
    'todo',
    SYSDATE - 5
FROM PROPOSALS p
WHERE p.title = 'Project B: Mobile App';
COMMIT;

INSERT INTO TASKS (PROPOSAL_ID, TEAM_ID, LOCKED_BY, TITLE, STATUS, DUE_DATE)
SELECT 
    p.proposal_id,
    (SELECT team_id FROM TEAMS WHERE team_name = 'Development Team B'),
    (SELECT user_id FROM USERS WHERE email = 'developer3@example.com'),
    'API Integration',
    'todo',
    SYSDATE + 15
FROM PROPOSALS p
WHERE p.title = 'Project B: Mobile App';
COMMIT;

-- Tasks for Proposal 3 (Completed - all tasks done)
INSERT INTO TASKS (PROPOSAL_ID, TEAM_ID, LOCKED_BY, TITLE, STATUS, DUE_DATE, COMPLETED_DATE)
SELECT 
    p.proposal_id,
    (SELECT team_id FROM TEAMS WHERE team_name = 'Development Team A'),
    (SELECT user_id FROM USERS WHERE email = 'developer1@example.com'),
    'Planning',
    'done',
    SYSDATE - 85,
    SYSDATE - 80
FROM PROPOSALS p
WHERE p.title = 'Project C: E-commerce';
COMMIT;

INSERT INTO TASKS (PROPOSAL_ID, TEAM_ID, LOCKED_BY, TITLE, STATUS, DUE_DATE, COMPLETED_DATE)
SELECT 
    p.proposal_id,
    (SELECT team_id FROM TEAMS WHERE team_name = 'Development Team A'),
    (SELECT user_id FROM USERS WHERE email = 'developer2@example.com'),
    'Development',
    'done',
    SYSDATE - 50,
    SYSDATE - 45
FROM PROPOSALS p
WHERE p.title = 'Project C: E-commerce';
COMMIT;

INSERT INTO TASKS (PROPOSAL_ID, TEAM_ID, LOCKED_BY, TITLE, STATUS, DUE_DATE, COMPLETED_DATE)
SELECT 
    p.proposal_id,
    (SELECT team_id FROM TEAMS WHERE team_name = 'Development Team A'),
    (SELECT user_id FROM USERS WHERE email = 'developer1@example.com'),
    'Testing',
    'done',
    SYSDATE - 35,
    SYSDATE - 30
FROM PROPOSALS p
WHERE p.title = 'Project C: E-commerce';
COMMIT;

------------------------------ Meetings --------------------------------------
INSERT INTO MEETINGS (PROPOSAL_ID, MEETING_TYPE, SCHEDULED_DATE, SUBJECT, STATUS)
SELECT proposal_id, 'kickoff', SYSDATE + 3, 'Project A Kickoff', 'scheduled'
FROM proposals WHERE title = 'Project A: Website';
COMMIT;

INSERT INTO MEETINGS (PROPOSAL_ID, MEETING_TYPE, SCHEDULED_DATE, SUBJECT, STATUS)
SELECT proposal_id, 'sprint_planning', SYSDATE + 1, 'Project B Planning', 'scheduled'
FROM proposals WHERE title = 'Project B: Mobile App';
COMMIT;

--------------------------------- Meeting Participants --------------------------------------
INSERT INTO MEETING_PARTICIPANTS (MEETING_ID, USER_ID, ATTENDANCE)
SELECT m.meeting_id, u.user_id, 'invited'
FROM MEETINGS m
JOIN USERS u ON u.role IN ('pm', 'developer1', 'developer2')
WHERE m.subject LIKE 'Project A Kickoff';
COMMIT;

--------------------------------- Documents --------------------------------------
INSERT INTO DOCUMENTS (MEETING_ID, FILE_NAME, FILE_PATH, DOC_TYPE, UPLOADED_BY)
SELECT m.meeting_id, 'ProjectA_Kickoff_MoM.pdf', '/docs/ProjectA_Kickoff_MoM.pdf', 'mom', u.user_id
FROM MEETINGS m
JOIN USERS u ON u.email = 'pm@example.com'
WHERE m.subject LIKE 'Project A Kickoff';
COMMIT;

--------------------------------- Feedback --------------------------------------
INSERT INTO FEEDBACK (PROPOSAL_ID, RATING, COMMENTS, FEEDBACK_DATE)
SELECT p.proposal_id, 5, 'Excellent work', SYSDATE
FROM PROPOSALS p
WHERE p.title = 'Project C: E-commerce';
COMMIT;

------------------------------ Invoices --------------------------------------
INSERT INTO INVOICES (CLIENT_ID, PROPOSAL_ID, AMOUNT, ISSUE_DATE, DUE_DATE, STATUS)
SELECT c.client_id, p.proposal_id, p.value, SYSDATE, SYSDATE + 30, 'pending'
FROM CLIENTS c
JOIN PROPOSALS p ON p.client_id = c.client_id
WHERE p.status = 'completed';
COMMIT;

------------------------------- Leads --------------------------------------
INSERT INTO LEADS (SALES_USER_ID, COMPANY_NAME, CONTACT_PERSON, EMAIL, PHONE, STATUS, ESTIMATED_VALUE, SOURCE)
VALUES (
    (SELECT user_id FROM USERS WHERE email = 'sales@example.com'),
    'Company 2',
    'Jane Smith',
    'jane@company2.com',
    '0987654321',
    'new',
    20000,
    'LinkedIn'
);
COMMIT;
