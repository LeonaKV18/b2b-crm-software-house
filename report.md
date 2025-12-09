\documentclass[11pt,a4paper]{article}

\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{geometry}
\usepackage{setspace}
\usepackage{titlesec}
\usepackage{graphicx}
\usepackage{float}
\usepackage{hyperref}
\usepackage{xcolor}
\usepackage{booktabs}
\usepackage{array}
\usepackage{enumitem}
\usepackage{fancyhdr}
\usepackage{caption}
\usepackage{subcaption}
\usepackage{multicol}
\usepackage{listings}
\usepackage{tikz}
\usepackage{pgfplots}
\usepackage{amssymb}
\usepackage{amsmath}
\usepackage{tcolorbox}
\usepackage{mdframed}
\usepackage{microtype}

% ----------------------------------------------------
% PAGE SETUP
% ----------------------------------------------------
\geometry{margin=1in}
\onehalfspacing

% ----------------------------------------------------
% HEADER / FOOTER
% ----------------------------------------------------
\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{Database Systems – OLTP Project}
\fancyhead[R]{B2B CRM for Software Houses}
\fancyfoot[C]{\thepage}

% ----------------------------------------------------
% COLORS
% ----------------------------------------------------
\definecolor{primary}{HTML}{1A73E8}
\definecolor{darktext}{HTML}{202124}
\definecolor{softgray}{HTML}{F3F3F3}
\definecolor{codebg}{HTML}{FAFAFA}

% ----------------------------------------------------
% CODE LISTINGS
% ----------------------------------------------------
\lstdefinestyle{codestyle}{
  backgroundcolor=\color{codebg},
  basicstyle=\ttfamily\small,
  keywordstyle=\color{primary}\bfseries,
  commentstyle=\color{gray},
  stringstyle=\color{orange},
  numbers=left,
  numberstyle=\tiny\color{gray},
  stepnumber=1,
  tabsize=2,
  breaklines=true,
  frame=single
}

% ----------------------------------------------------
% SECTION NUMBERING 
% ----------------------------------------------------
\titleformat{\section}
  {\large\bfseries\color{primary}}
  {\thesection}{1em}{}[\color{primary}\titlerule]

\titleformat{\subsection}
  {\normalsize\bfseries\color{darktext}}
  {\thesubsection}{1em}{}


% ----------------------------------------------------
% TITLE PAGE
% ----------------------------------------------------
\begin{document}

\begin{titlepage}
    \centering
    \vspace*{2cm}

    {\Huge \textbf{B2B CRM for Software Houses}}\\[0.4cm]
    {\Large \textbf{OLTP Database Systems Project Report}}\\[1cm]

    {\Large \textbf{Course: CS 341 – Database Systems}}\\[0.5cm]
    {\Large Fall 2025}\\[1.5cm]

    % ---- Author Blocks ----
    {\large
    \begin{tabular}{lll}
        \textbf{Name} & \textbf{Email} & \textbf{Section} \\
        \midrule
        Anis Imran & a.imran.29017@khi.iba.edu.pk & DB-1 \\
        Hadiya Muneeb & h.muneeb.28424@khi.iba.edu.pk & DB-2 \\
        Muhammad Usman & m.usman.29257@khi.iba.edu.pk & DB-2. \\
    \end{tabular}
    }

    \vfill
    {\large \today}
\end{titlepage}

\tableofcontents
\newpage

% ----------------------------------------------------
% 1. Business Scenario
% ----------------------------------------------------
\section{Business Scenario}

\subsection{Project Description}
The \textbf{B2B CRM for Software Houses} is an Online Transaction Processing (OLTP) system designed to streamline the operations of a software development company. It provides a centralized platform for managing the entire client lifecycle, from initial lead to project completion and beyond. The system caters to different user roles within the organization, including administrators, project managers, sales representatives, developers, and clients, each with a tailored dashboard and permissions.

The core functionalities of the system include:
\begin{itemize}
    \item \textbf{Client \& Contact Management:} Manage client company details, view linked proposals and projects, and handle individual client contacts.
    \item \textbf{Proposal \& Quote Management:} Allow sales representatives and clients to create, view, and track proposals with pricing and status updates.
    \item \textbf{Project Management:} Create and manage client-linked projects with assigned teams, milestones, and progress tracking.
    \item \textbf{Team Management:} Manage team member details, project assignments, and workloads across projects.
    \item \textbf{Meeting Management:} Schedule and record meetings linked to clients or projects, with minutes and action items.
    \item \textbf{Client Self-Service Portal:} A portal for clients to create proposals, view project progress, access invoices, and communicate with the team.
    \item \textbf{Dashboards \& Reporting:} Role-based dashboards display key performance indicators (KPIs) and generate reports on sales, clients, and project progress.
\end{itemize}

\subsection{Interview Findings}
An interview was conducted with a project manager to understand real-world challenges in software project management. Key insights include:
\begin{itemize}
    \item \textbf{Requirement Gathering is Critical:} The most significant challenge is defining clear and complete requirements. Clients often change their minds, leading to scope creep and planning deviations. A good quality Software Requirement Specification (SRS) is crucial.
    \item \textbf{Communication is Key:} Miscommunication, especially during requirement definition, is a major source of delays. A client portal could improve communication, but its success depends on user experience, as not all clients are tech-savvy.
    \item \textbf{Project Tracking:} Progress is typically tracked via sprints and task completion on boards like Trello. A dashboard showing assigned tasks, due dates, and completion rates is highly valuable.
    \item \textbf{Project Closure:} This phase is often overlooked. Formal closure, including client sign-off, feedback collection, and documenting lessons learned, is essential.
    \item \textbf{User Roles:} Different roles (PM, Developer, Client) require different views and permissions. For instance, developers should not see financial data.
\end{itemize}

\subsection{Competitive Analysis}
\textit{Note: This section is pending further analysis. The initial plan is to analyze the features, strengths, and limitations of the following platforms.}
\begin{itemize}
    \item HubSpot CRM
    \item Zoho CRM
    \item Monday.com
\end{itemize}

% ----------------------------------------------------
% 2. Business Rules
% ----------------------------------------------------
\section{Business Rules}

\subsection{User \& Access Rules}
Each user must have access to dashboards according to their role-based permissions. Only Admins can create, modify, or delete user accounts. All users must authenticate with valid credentials before accessing the system.

\subsection{Client Rules}
A valid client record requires a valid \texttt{user\_id} with appropriate permissions. Each client entry represents the entire company. Clients may be marked as active or inactive based on their current business engagement. Active clients are those with one or more active proposals.

\subsection{Proposal Rules}
Clients may create and submit multiple proposals. A team will be assigned only once the proposal status is \texttt{accepted}. Proposal progress and stages can be tracked through the dashboard.

\subsection{Milestone Rules}
Each milestone must belong to a single project with a unique name and a valid deadline. Only assigned team members can update milestone statuses.

\subsection{Team Rules}
Every team member must have a unique email address and a defined role. Team members may participate in multiple projects simultaneously. Only Admins and Project Managers can assign or remove members from projects.

\subsection{Triggers}
\textit{(As per \texttt{project.md})}
\begin{itemize}
    \item When certain statuses change, such as Lead to Client or Proposal to Project, the system automatically creates or updates the corresponding linked records.
    \item When all milestones in a project are marked as completed, the system updates the project’s progress and marks the project itself as completed.
\end{itemize}
\textit{Note: The implementation of these triggers is pending. The \texttt{SQL/triggers.sql} file is currently empty.}

\subsection{Stored Procedures}
\textit{(As per \texttt{project.md})}
The system will use stored procedures to perform complex database operations, such as:
\begin{itemize}
    \item Calculating total revenue from all accepted proposals.
    \item Listing all overdue tasks for a given team member.
    \item Generating a client activity report showing the most recent interaction date.
\end{itemize}
Several procedures have been implemented (see Section 6).

% ----------------------------------------------------
% 3. ERD + Entities
% ----------------------------------------------------
\section{Entity–Relationship Model}

\subsection{ERD}
An initial Entity-Relationship Diagram has been created using the Mermaid diagramming syntax. This diagram outlines the main entities, their attributes, and the relationships between them.

\textit{Note: The Mermaid code for the ERD is available in the project's \texttt{Documents} folder. It is recommended to use a Mermaid editor to generate a visual diagram from this code and insert it here as \texttt{erd.png}.}

\begin{tcolorbox}[colback=codebg,colframe=gray!50,title=Mermaid ERD Snippet]
\begin{verbatim}
erDiagram
    users ||--|| contacts : "has"
    users ||--o{ tasks : "locks"
    
    clients ||--o{ proposals : "submits"
    
    proposals ||--o{ tasks : "has"
    tasks ||--o| teams : "assigned to"
    
    ... (rest of the diagram in file)
\end{verbatim}
\end{tcolorbox}


\subsection{Process Flow Diagram}
\begin{figure}[H]
    \centering
    \includegraphics[width=0.95\textwidth]{images/process-flow.png}
    \caption{System Process Flow Diagram}
\end{figure}
\textit{Note: Placeholder for the process flow diagram.}

% ----------------------------------------------------
% 4. Relational Schema
% ----------------------------------------------------
\section{Relational Schema (3NF)}

\subsection{Normalization Summary}
The relational schema is designed based on the ERD. The process of normalization up to the 3rd Normal Form (3NF) will be validated and documented here.
\textit{Note: This section is pending a detailed normalization walk-through.}

\subsection{Final Schema Diagram (Image)}
\begin{figure}[H]
\centering
\includegraphics[width=0.95\textwidth]{images/schema.png}
\caption{3NF Relational Schema}
\end{figure}
\textit{Note: Placeholder for the final schema diagram.}

\subsection{DDL Scripts}
The following SQL Data Definition Language (DDL) script from \texttt{SQL/table.sql} is used to create the database tables. It includes table definitions, primary keys, foreign keys, and other constraints.

\begin{lstlisting}[style=codestyle, language=SQL, caption={Users Table}]
CREATE TABLE users (
    user_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
    role VARCHAR2(20) NOT NULL CHECK (role IN ('admin', 'pm', 'client', 'developer', 'sales')),
    email VARCHAR2(255) NOT NULL UNIQUE,
    name VARCHAR2(255) NOT NULL,
    password VARCHAR2(255) NOT NULL,
    is_active NUMBER(1,0) DEFAULT 1 NOT NULL CHECK (is_active IN (0, 1))
);
\end{lstlisting}

\begin{lstlisting}[style=codestyle, language=SQL, caption={Proposals Table}]
CREATE TABLE proposals (
    proposal_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
    client_id NUMBER NOT NULL,
    pm_user_id NUMBER,
    title VARCHAR2(255) NOT NULL,
    description CLOB,
    requirements CLOB,
    comments CLOB,
    estimated_hours NUMBER,
    actual_hours NUMBER,
    value NUMBER,
    status VARCHAR2(50) CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'active', 'completed')),
    srs_approved NUMBER(1,0) DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_close DATE,
    actual_close DATE,
    CONSTRAINT fk_proposals_client
        FOREIGN KEY (client_id)
        REFERENCES clients(client_id),
    CONSTRAINT fk_proposals_pm_user
        FOREIGN KEY (pm_user_id)
        REFERENCES users(user_id)
);
\end{lstlisting}
\textit{Note: The full DDL with all tables is available in the \texttt{SQL/table.sql} file.}

% ----------------------------------------------------
% 5. Application Flow
% ----------------------------------------------------
\section{Application Flow}

\subsection{Navigation Diagram}
\begin{figure}[H]
    \centering
    \includegraphics[width=0.9\textwidth]{images/navigation.png}
    \caption{Application Navigation Flow}
\end{figure}
\textit{Note: Placeholder for the application navigation diagram.}

\subsection{Wireframes}
\begin{figure}[H]
\centering
\includegraphics[width=0.9\textwidth]{images/dashboard-wireframe.png}
\caption{Dashboard Wireframe}
\end{figure}
\textit{Note: Placeholder for the wireframes.}

% ----------------------------------------------------
% 6. SQL Queries + Screens
% ----------------------------------------------------
\section{SQL Queries + Screens}

This section demonstrates how application screens are powered by SQL queries, often encapsulated within stored procedures.

\subsection{Client List Page}
The main client list page displays a summary of all clients. This data is fetched by calling the \texttt{get\_all\_clients} stored procedure.

\textbf{Stored Procedure}
\begin{lstlisting}[style=codestyle, language=SQL]
CREATE OR REPLACE PROCEDURE get_all_clients (
    p_clients_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_clients_cursor FOR
        SELECT
            c.client_id AS "id",
            c.company_name AS "name",
            con.full_name AS "contact",
            'Active' as "status", -- Dummy data
            con.email AS "email"
        FROM
            clients c
        LEFT JOIN
            contacts con ON c.client_id = con.client_id AND con.contact_type = 'primary';
END;
/
\end{lstlisting}

% ----------------------------------------------------
% 7. Code Snippets
% ----------------------------------------------------
\section{Code Snippets}

\subsection{React (TypeScript) - Card Component}
The UI is built with reusable React components. The following is a snippet from the generic \texttt{Card} component used throughout the application to display information consistently.

\begin{lstlisting}[style=codestyle, language=TypeScript]
import * as React from 'react'
import { cn } from '@/lib/utils'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Card }
\end{lstlisting}

\subsection{Node.js (Next.js API Route)}
The backend logic is handled by Next.js API routes that run on Node.js. This snippet shows the API endpoint for fetching clients, which executes the \texttt{get\_all\_clients} stored procedure.

\begin{lstlisting}[style=codestyle, language=TypeScript]
import { executeQuery } from "@/lib/oracle";
import { NextRequest, NextResponse } from "next/server";
import * as oracledb from 'oracledb';

export async function GET(req: NextRequest) {
  try {
    const bindVars = {
      p_clients_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };

    const result = await executeQuery<{
      p_clients_cursor: any[];
    }>(`BEGIN get_all_clients(:p_clients_cursor); END;`, bindVars);

    if (result && result.p_clients_cursor) {
      return NextResponse.json(result.p_clients_cursor);
    } else {
      return NextResponse.json({ error: "No clients found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
\end{lstlisting}

% ----------------------------------------------------
% 8. Work Contribution
% ----------------------------------------------------
\section{Work Contribution}
\begin{itemize}
    \item Anis Imran – \textit{Contribution details to be added.}
    \item Hadiya Muneeb – \textit{Contribution details to be added.}
    \item Muhammad Usman – \textit{Contribution details to be added.}
\end{itemize}

% ----------------------------------------------------
\end{document}
