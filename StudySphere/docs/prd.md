Product Requirements Document (PRD)
Project Title: StudySphere
Description:
StudySphere is a centralized academic planning system system designed to help college
students organize coursework, track performance, and manage workload in a way that
reduces stress and improves outcomes. The platform integrates assignment tracking, GPA
monitoring, workload visualization, study session logging, and burnout awareness into a
single, student-focused interface.
Scope:
Based on the Analyst's Level 1 Specification,
StudySphere v1 will include features in six epics:
• Manage Academic Tasks - add assignment, import assignments (canvas), assign task to course/activity, set due date, set priority, estimate time, mark complete, view tasks by course
• Track Academic Performance - enter course grade, calculate course average, set GPA goal, generate weekly GPA update, calculate required grade, display GPA progress
• Plan and Log Study Time - schedule study session, log study time, view study time by course, displau study vs. performance graph
• Analyze Workload - display weekly workload, compare workload across weeks, detect workload spikes, highlight heavy weeks, display ongoing projects, display calendar
• Monitor Burnout - Analyze workload intensirt, detect workload spikes, detect imbalance in time allocation, generate burnout alert, recommend task focus
• Manage User Experience - create account, log in/log out, edit profile, set notifactions preference, set weekly goals, reflect on progress

Technical Architecture
Frontend (Client):
• React (PWAm mobile-first design)
• React Router for navigation
• Deploted via AWS Amplify
Backend (API Layer):
• Express.js Rest API (Node.js)
○ Serves as the single gateway for all data operations 
○ Handles authentication, valifation, and routing
○ Middleware for logging, error handling, and request validation
• All CRUD  operations go through the API - students must not call Supabase directly from the frontend
Database & Authentication:
• Supabase (Postgres0based) for:
○ Data persistence
○ Authentication (email/password, role-based access)
○ Realtime subscriptions (optional for v1)
• API connects to Supabase using Supabase client or pg driver under the hood
Deployment Strategy:
• Frontend: AWS Amplify (continous deployment from GitHub)
• API Layer: Deployed as serverless functions:
○ AWS Lamba (preferred) - Express wrapped with serverless-http
• Database: Managed directly in Supabase cloud instance
Development Tools:
• GitHub for version control and collaboration
• Windsurf for IDE for coding enviroment
• Trello for task management
• Slack for team communication
Key Considerations:
• Seperation of Concerns: Clear distinction between frontend (UI), API (business logic), and DB (Persistence).
• Enviroment Variables: API keys stores in .env (never commited).Environmentstoredcommitted