# B2B CRM for Software Houses

An Online Transaction Processing (OLTP) application designed to manage clients, projects, proposals, teams, and meetings for software development companies. The system demonstrates an end-to-end relational database design with role-based access, CRUD functionality, and automated business workflows using triggers and stored procedures. Built using **Node.js**, **React.js**, and **Oracle RDBMS**.

---

## Overview

This repository contains:

- A fully normalized Oracle database schema (up to 3NF) for client, proposal, project, team, and meeting management.
- DDL scripts to create tables, triggers, views, and stored procedures.
- A Node.js backend for API routing and database connectivity.
- A React.js frontend for user interaction and dynamic dashboards.
- Sample data to facilitate testing and demonstration of core functionalities.

---

## Features & Use Cases

1. **User Login & Authentication**  
   - Authenticate users, verify their roles, and redirect them to role-specific dashboards.

2. **Client Management**  
   - Manage client company details, view linked proposals and projects, and handle client relationships.  

3. **Contact Management**  
   - Add, update, and manage individual client contacts, assigning primary contacts per client.

4. **Proposal Management**  
   - Allow sales reps and clients to create, view, and track proposals with pricing and status updates.

5. **Project Management**  
   - Create and manage client-linked projects with assigned teams, milestones, and progress tracking.

6. **Team Management**  
   - Manage team member details, project assignments, and workloads across projects.

7. **Meeting Management**  
   - Schedule and log meetings associated with clients or projects.

8. **Dashboard & Reports**  
   - Display key performance metrics and generate reports on sales, clients, and project progress via stored procedures.

9. **Client Self-Service Portal**  
   - Enable clients to create and view proposals, check proposal status, quote prices, and make payments.

---

## Goals

  - Design and implement a fully functional B2B CRM system with end-to-end relational database integration, demonstrating normalization and data integrity in a real-world OLTP scenario.  
  - Implement role-based dashboards, access control, and automated business workflows using triggers and stored procedures. 
  - Provide a scalable, maintainable, and user-friendly web application using **Node.js** and **React.js** integrated with **Oracle RDBMS**.
