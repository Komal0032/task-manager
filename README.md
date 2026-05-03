# Team Task Manager

A simple web app to manage tasks, projects, and team members. Built with React, Node.js, and MongoDB.

## Live Website

🔗 **https://task-manager-frontend-a1kj.onrender.com**

## What You Can Do

### For Admin
- Create, edit, delete tasks
- Create projects
- Add or remove team members
- Change member roles (Admin/Member/Viewer)
- See all tasks in the system

### For Members
- See only tasks assigned to you
- Update your task status (Todo → In Progress → Done)
- View your dashboard

## How to Use

### Register
1. Go to the website
2. Click "Register"
3. Fill your name, email, password
4. Select role (Admin or Member)
5. Click Register

### Login
1. Enter your email and password
2. Click Login
3. You'll go to your dashboard

### Create a Task
1. Click "+ New Task" button
2. Fill title, description, assignee, due date
3. Click Create

### Update Task Status
1. Click the status dropdown on any task
2. Change to Todo, In Progress, or Done

### Add Team Member (Admin only)
1. Go to Team section
2. Click "Add Member"
3. Enter name, email, role
4. Member can login with email and default password: member123

### Create Project (Admin only)
1. Go to Projects section
2. Click "Create Project"
3. Enter name and description

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taskpro.com | Admin@123 |
| Member | member@example.com | member123 |

## Tech Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas
- **Deployment:** Render

## Run Locally

### 1. Clone the project
```bash
git clone https://github.com/Komal0032/task-manager.git
cd task-manager
