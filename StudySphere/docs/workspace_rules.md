WORKSPACE_RULES.md
0) Summary (read this first)
• P1 & P2: build and run everything locally (client + Express API). Use SUpabase (cloud) for Postgres + Auth. Push to GitHub daily for backup & instructor visibility. 
• P3: deploy the clinet to AWS Amplify and the AWS Lamba.
-----------------------------------
1) Git & Branching 
• Single branch workflow: main only.
• Commit frequently early/often.
• Tag milestones:
v0.1-proto1, v0.2-proto2, v1.0-proto3
• Remote: push at least once per work session
Commit Message format
[scope]: imperative verb + what changed
------------------------------------
2) Naming Conventions
• Use PascalCase for functions.
• Use Snake_case for file names and folders.
• Use CamelCase for variables.
--------------------------------------
3) Pull Request and Review Process
• Create a pull request for every bug fix.
• Address all feedback before merging.
--------------------------------------
4) Commit Message Guidlines
• Use the format: [scope]: imperative verb + what changed
• Keep messages concise but descriptive
