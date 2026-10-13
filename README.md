# 🎓 Campus Lost & Found Portal
A web-based platform designed to help college students report, browse, and recover lost belongings on campus.

## 📌 About the Project
The Campus Lost & Found Portal provides a common platform where students can report lost items and browse items reported as found. It aims to make recovering lost belongings easier and more organized within a college campus.

## ✨ Features
- 👤 Student account registration
- 🔐 Login and authentication
- 🎒 Report lost or found items
- 🔍 Browse reported items
- 📍 View item descriptions and locations
- 📞 View the owner's contact information
- 🔑 Forgot password functionality

## 🛠️ Tech Stack
**Frontend**
- HTML
- CSS
- JavaScript

**Backend**
- Node.js
- Express.js

**Database**
- SQLite

**Additional Libraries**
- bcryptjs
- express-session

## 📁 Project Structure
```text
Campus-lost-and-found/
├── index.html
├── login.html
├── register.html
├── browse.html
├── report.html
├── forgot-password.html
├── style.css
├── script.js
├── server.js
├── package.json
├── package-lock.json
├── start-portal.bat
├── .gitignore
└── README.md
```

## ⚙️Installation and Setup
**Prerequisites**
-Node.js and npm installed on your computer

-Git installed (optional, for cloning the repository)


## 🖥️Steps to run the project
1.Clone this repository:
```bash
git clone https://github.com/Nupurrrrr/Campus-lost-and-found.git
```
2.Open the project folder:
```bash
cd Campus-lost-and-found
```
3.Install the dependencies:
```bash
npm install
```
4.Configure any required environment variables in a local .env file, if applicable.

5.Start the server using the command configured in package.json.

6.Open the local URL displayed by the server in your browser.

## 🔒 Security Notes
-Do not upload .env files or secret credentials.

-The SQLite database file is excluded from version control.

-Use your own environment variables when configuring the application.

## 🎯 Project Objective
To provide college students with a simple and accessible way to report lost belongings and find items recovered on campus.

## 👩‍💻 Author
Developed as a college Software Engineering project.
