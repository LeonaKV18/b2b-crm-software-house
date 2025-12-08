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

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- Oracle Database (Locally installed or accessible)
- SQL Developer (Optional, for database management)

### Database Setup

1.  Open your terminal or command prompt.
2.  Connect to SQLPlus as SYSDBA:
    ```bash
    sqlplus / as sysdba
    ```
3.  Execute the following commands to create the user and grant permissions:
    ```sql
    ALTER SESSION SET CONTAINER = ORCLPDB;
    SHOW CON_NAME;
    CREATE USER project IDENTIFIED BY dbo;
    GRANT UNLIMITED TABLESPACE TO project;
    GRANT CONNECT, RESOURCE, DBA TO project;
    ```

### SQL Developer Connection

When setting up a connection in Oracle SQL Developer, use the following details:

- **Username:** project
- **Password:** dbo
- **Hostname:** localhost (or your server IP)
- **Port:** 1521
- **Service Name:** ORCLPDB

### Application Setup

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    - Create a `.env.local` file in the `client` directory (if it doesn't exist).
    - Ensure it contains the following credentials:
      ```env
      ORACLE_USER=project
      ORACLE_PASSWORD=dbo
      ORACLE_CONNECTION_STRING=localhost:1521/ORCLPDB
      ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.