CS 341 Database Systems
Fall 2025 page. 1 Abeera Tariq/Maria Rahim
Course Project
Project Overview
In this course project, you will embark on a journey to design and implement an Online Transaction Processing (OLTP) system for a practical business scenario. Your task is to create an end-to-end application, complete with a relational database, that allows users to interact with and manipulate data according to the business rules. You will demonstrate your understanding of CRUD (Create, Read, Update, Delete) operations, as well as the use of stored procedures and triggers in your application. This project accounts for 20% of your final course grade.
Project Requirements
1.
Business Scenario and Rules
•
Identify and select a real-world domain of your choice.
•
Before defining the scenario, you are required to approach at least one real-world user and conduct a short conversation/interview to understand how processes operate in practice.
•
Analyse the existing applications or systems in the chosen domain (minimum 2–3 applications) to analyze their features, strengths, and limitations.
•
Based on both the interview(s) and analysis, provide a concise description of the chosen business scenario, outlining the industry, purpose, and significance of the system.
2.
Data Modeling
•
Identify at least 6-8 entities relevant to your business scenario.
•
Define the attributes and relationships for each entity, including participation and cardinality constraints. Present your Entity-Relationship (ER) model in either Chen's or Crow's Foot notation.
3.
Relational Database Schema
•
Create a relational schema for your database (normalized up to 3NF), representing the structure of tables and their relationships.
•
Provide the Data Definition Language (DDL) script to create the database tables, including any constraints.
•
Explain any triggers, stored procedures, or views created as part of your database design.
4.
Application Development
•
Choose an appropriate application development framework (e.g., React.js, Android, Flutter, etc.).
•
Understand the connectivity requirements for the chosen framework with Oracle database. If the team wishes to use any other database system besides Oracle, the team will require approval from the instructor via email. Note: The database must be relational (SQL).
•
Create a flow diagram that illustrates how users will navigate through your application.
•
Include wireframes or sketches of your application's user interface.
5.
SQL Queries and Functionality
•
Document page-by-page navigation within your application.
•
Describe all SQL queries used in your code, their purpose, and include code snippets or screenshots of these queries in your report.
CS 341 Database Systems
Fall 2025 page. 2 Abeera Tariq/Maria Rahim
Team Formation Rules
•
Maximum 3 members are allowed. In the case of groups with greater than 3 members, all members will receive a zer
•
You may form groups with students from other section with the same instructor.
•
All work must be equally divided between all members as there are marks for individual contribution.
Submission Requirements
Submit the following components:
1.
SQL script to create your database.
2.
All code files required to run your application, saved as a single ZIP file.
3.
A comprehensive report document.
4.
A 2–3-minute video demonstrating the user flow of your application.
Submission Deadline: 7th December, 2025 (no extensions possible)
Presentations: Last week of classes
Report Format
1.
Title Page
•
Course name, Project title, Team Member Names, and ERPs.
2.
Business Scenario
•
Description of the chosen business scenario.
•
Summary of interview(s) and application analysis
3.
Business Rules
•
Explanation of the core business rules and use cases.
4.
Entities, Attributes, and Relationships
•
Detailed description of entities, attributes, and relationships including multiplicity constraints.
•
ER diagram (neatly hand-drawn or using any software or online tool – in Crow’s foot or Chen’s).
5.
Relational Schema
•
A visual representation of your database schema (using DBDesigner)
•
Show and validate normalization steps up to 3rd Normal Form (3NF)
•
DDL script screenshots or text snippets
i.
Explain the constraints applied to your tables.
ii.
Explain any triggers, stored procedures, and views that you have created.
iii.
Show the insertion of some data that you add to test your application.
6.
Application Flow
•
Flow diagram showing how users interact with your application.
•
Wireframes or sketches of your application's UI.
7.
Page-by-Page Navigation and SQL Queries
•
Detailed documentation of each screen in your application and the corresponding SQL queries. Explain the purpose of each SQL query and how it contributes to functionality of your application.
8.
Work Contribution
•
Clear explanation of how tasks were divided among team members.




Database Systems – Project Brainstorming Activity (Graded)
Business Scenario/Project Name: B2B CRM for software houses
Group Members Names, ERP, Section:
Muhammad Usman 29257, DB-2
Anis 29017 DB-1
Hadiya Muneeb, 28424, DB-2
Framework: Node.js  , React.js

RDBMS: Oracle
Use Cases: 
User Login & Authentication:
 Authenticate users, verify their roles, and redirect them to role-specific dashboards.


Client Management:
 Manage client company details, view linked proposals and projects, and handle client relationships.


Contact Management:
 Add, update, and manage individual client contacts, assigning primary contacts per client.


Proposal Management:
 Allow sales reps and clients to create, view, and track proposals with pricing and status updates.


Project Management:
 Create and manage client-linked projects with assigned teams, milestones, and progress tracking.


Team Management:
 Manage team member details, project assignments, and workloads across projects.


Meeting Management:
 Schedule and record meetings linked to clients or projects


Dashboard & Reports:(implied you need to query for this)
 Display key performance metrics and generate reports on sales, clients, and project progress.


Client Self-Service Portal :
 Clients can create proposals, view their own proposals, quote prices, and make payments upon project completion.


Business Rules:

User & Access Rules
Each user must have access to dashboards according to their role-based permissions. Only Admins can create, modify, or delete user accounts. All users must authenticate with valid credentials before accessing the system.
Contact Rules
Every user must have valid contact information, including a contact ID and designation. The designation applies not only to the client’s role but also to the user’s role within the software house, such as Developer, Designer, or Project Manager. Each client must have both a primary and secondary contact assigned.

Client Rules
A valid client record requires only a valid user_id with appropriate permissions, not necessarily a proposal. Each client entry represents the entire company through its designated user_id. Clients may be marked as active or inactive based on their current business engagement.
Active/Inactive Rules
Active clients are those with one or more active proposals. Active users, particularly developers, are individuals currently employed or working within the company. Active teams are teams assigned to ongoing projects; they become inactive once their respective projects are completed. Each developer may belong to multiple teams, and new teams can be created for each proposal as needed.
Proposal Management Rules
Clients may create and submit multiple proposals. A team will only be assigned once the proposal status is accepted. Proposal progress and stages can be tracked through the dashboard’s stage fields, allowing users to monitor development and updates.
Milestone Rules
Each milestone must belong to a single project with a unique name and valid deadline. Only assigned team members can update milestone statuses, and these updates determine the overall project progress.
Team Management Rules
Every team member must have a unique email address and a defined role, such as Developer, Tester, or Designer. Team members may participate in multiple projects simultaneously. Only Admins and Project Managers can assign or remove members from projects. Active project members cannot be deleted while assigned to ongoing projects.
Meeting Management Rules
Every meeting must be linked to either a client or a project. Meetings must be scheduled for a future date and time, and notes or summaries can only be added after the meeting has occurred. All users may create meetings related to their assigned clients or projects.
Reporting & Dashboard Rules
Dashboards display data relevant to each user’s role, such as Sales Representatives viewing their own leads and Project Managers viewing their managed projects. Only Admins, Sales Representatives, and Project Managers are authorized to generate system reports.
Data Integrity Rules
All records must comply with valid data formats for dates, emails, and phone numbers. Monetary values such as budgets and costs must be non-negative, and status fields must adhere strictly to predefined options. Referential integrity must be maintained at all times to prevent orphaned or inconsistent records.
Trigger Requirements
When certain statuses change, such as Lead to Client or Proposal to Project, the system automatically creates or updates the corresponding linked records. When all milestones in a project are marked as completed, the system updates the project’s progress and marks the project itself as completed.
Stored Procedure Requirements
Stored procedures must include the ability to calculate total revenue from all accepted proposals, list all overdue tasks for a given team member, and generate a client activity report showing the most recent interaction date


Initial ERD:

Note rough erd for now we haven’t normalized it yet or made any bridge tables

Wireframes: (Initial sketches of your application pages and functionality)

INTERVIEW:

Section 1: Overall Process & Pain Points

1.	Can you walk us through the typical lifecycle of a project, from the first client inquiry to final delivery and payment?

•	The project lifecycle starts before the project is formally won. Initially, there’s a business development phase where we receive an inquiry from a client, review a high-level scope, and prepare a commercial proposal based on rough estimates. 
•	Once the proposal is approved and the project is secured, execution begins.

•	Execution starts with a project kick-off meeting, where we agree on ground rules such as communication channels, meeting frequency, and project tools (for example, whether the client prefers email or WhatsApp). After that, we move into requirement gathering and SRS (Software Requirement Specification) preparation.
•	If requirements are clear, we document them with wireframes and mockups for client approval. 
•	Once the SRS is approved, development proceeds in sprints following Agile Scrum practices.


2.	What are the biggest challenges or inefficiencies your team faces with your current project management and client communication tools?

The hardest part is understanding the requirements and writing a good quality SRS. We often face missing or unclear information, and clients frequently change their requirements. These changes result in deviations from the initial planning and estimates. 

3.	Where do most delays or miscommunications occur in your process?

Miscommunication usually occurs during requirement definition. Sometimes, clients are unavailable due to time zone differences or different working days, which leads to delays.

4. If you could magically fix one thing about how you manage clients and projects, what would it be?

I’d improve communication and the frequency of updates - how quickly and accurately clients are updated on progress.


Section 2: Client & Proposal Management

1.	How do clients currently submit new project requests or proposals? (e.g., email,
forms, meetings)
Clients typically write emails ranging from one-liners to documents, depending on the type of client.

2.	What information is absolutely critical to capture in a new project proposal?

Understanding the client based on his business and target customers is critical before preparing any proposal.

3.	Our idea: We’re considering a Client Self-Service Portal where clients can create
proposals, view their status, and make payments. What is your initial reaction to
this?
•	Probe: What features would make this portal truly useful for your clients?
•	What potential pitfalls should we avoid?

It would be beneficial, but it depends on the user experience. Not all clients would be comfortable filling out a detailed online form, especially smaller businesses. Larger or more technical clients with IT departments would likely prefer it.

4.	How do you handle pricing and quoting? Is it fixed, hourly, or based on milestones?

I don’t have much experience in this area, but it depends on company policy. Generally, we estimate the number of hours needed for the project, add some contingency, and multiply by an hourly rate. The rate depends on factors such as client location, size, and prior relationship.

Section 3: Project Execution & Team Management

1.	How are teams typically assembled for a new project? What factors decide who
works on what?
+
2.	How do you track project progress? Is it based on task completion, milestone
completion, or something else?

Usually in software houses, we maintain a Resource/Team Utilization Sheet that tracks the use of resources for the next two weeks. The work is assigned based on the project’s technical requirements and resource availability.

Do team members work on multiple projects at once?
Yes, resources are often shared across projects unless it’s a full outsourcing project where a developer is dedicated 100% to one client.

Does context switching between projects cause problems?
Yes, it can cause some difficulties. However, experienced team members adapt quickly.

3.	Regarding milestones: Who is responsible for updating their status? How do you
ensure this is done consistently and accurately?

We track progress tasks based on sprints, commonly using Trello boards.

4.	“When all milestones are complete, the project is marked as done.”
In practice, is it really that automatic? What other steps (e.g., client sign-off, final
payment, deployment) are needed to officially close a project? Would this help?
It could help, but we’d still need a manual verification checklist and client sign-off before officially closing the project.

Section 4: Data, Reporting, and the Dashboard
1.	Looking at your dashboard right now, what are the 3–5 most important numbers or charts you look at every day?

•	My assigned tasks and due dates.
•	Number of tasks completed (weekly or monthly summary).
•	Project progress or completion percentage.
As a Project Manager, I’d want:
•	High-level status of each project.
•	Task completion rates and blockers.
As a Client, I’d prefer a simpler view - basic progress and completion status, without technical details.

The client could benefit from integrated scheduling, but most clients already rely on email and calendar tools for scheduling.

2.	What kind of reports do you or upper management need to generate regularly? (e.g., revenue per client, team workload, project profitability)

They focus on project status, show stoppers/blockers, and delays- especially identifying root causes. During daily stand-up meetings, the Scrum Master records blockers and is responsible for removing them. If he cannot do it, then he will inform the higher management.

3.	If you could ask the system one complex question about your business, what would it be? (e.g., “Which type of projects are most profitable?” or “Which clients have the most scope creep?”)
----

Section 5: User Roles and Permissions

1.	What different roles exist in your company regarding client and project interaction?
(e.g., Sales, Project Manager, Developer, Admin, Client)

•	Senior Project Manager
•	Project Coordinator
•	Tech Lead
•	Developers (Frontend/Backend)
•	Quality Assurance Engineers
•	Designers (UI/UX or Graphic)

What each role does:
•	Project Manager: Oversees multiple projects.
•	Project Coordinator: Assists the PM, usually handling one or two projects.
•	Tech Lead: Resolves technical issues and designs the solution architecture.
•	Developers: Implement the solution.
•	QA Engineers: Handle testing and quality checks.
•	Designers: Manage UI, UX, and visual elements.

2.	Can you give an example of what a Developer should not be able to see or do that a Project Manager can? (e.g., view financials, delete a project) 
+
3.	Should a client, through the portal, be able to see the internal team members
assigned to their project?

•	Developers: All project details except financial/commercial data.
•	Project Managers: Full access.
•	Clients: Access to assigned team members, tasks, and progress - but not financials.

Section 6: Technical & Functional Nuances

1.	How often do you need to reactivate an old client or reuse a team? Is “archiving” a better term than “deleting”
Clients are never truly inactive for the business development team, which keeps in touch for new opportunities. For the project team they can be inactive for some time.

2.	For contact management: Is having a primary and secondary contact for each client company sufficient, or do you often need to manage a larger list of stakeholders?
Yes, sometimes even tertiary contacts.
3.	Regarding meetings: What key information from a client meeting needs to be logged in the system to be useful later?

Always record Minutes of Meeting (MoM), including action items and who is responsible for them. The MoM should be shared with the client, clearly listing their expected actions. And yes, audit logs (like “last updated by” and “last updated on”) should be maintained.

Section 7: Closing Questions

1.	Is there anything we haven’t asked about that is a critical part of how you manage
client relationships and projects that we should know?

Customer feedback is very important. There should be a formal feedback form or exit interview after project completion, with five simple questions. A clutch uses some tools. Online platform for capturing reviews.

The project closure phase is also overlooked because the client doesn’t consider it an important step. Clients sometimes stop responding after delivery, leaving the project open-ended.

At project closures, the team should note down all the lessons that they learnt from this project and archive them for future projects.


















































