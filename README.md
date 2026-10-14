# 🎓 Campus Lost & Found Portal
A web-based application that helps college students report lost items and find items reported by other students on campus.
The goal of this project is to make the process of reporting and finding lost belongings easier, faster, and more organized within a college campus.

## 📌 Features
- 🔐 **User Registration & Login** – Create an account and log in using a college email address.
- 🎓 **College Email Restriction** – Registration is restricted to college email addresses ending in `@uem.edu.in`.
- 📧 **Email OTP Verification** – Verify your email during registration, if configured.
- 🔑 **Forgot Password** – Password recovery feature.
- 📝 **Report Lost or Found Items** – Submit item details such as name, description, location, date and contact details.
- 🔍 **Browse Items** – View reported items.
- 🔒 **Password Security** – Passwords are hashed before being stored.
- 🗄️ **SQLite Database** – Store user and item information.
- 🚪 **Logout** – Log out of your account.

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

**Libraries & Tools**
- bcryptjs
- express-session
- Nodemailer
- dotenv
- Git & GitHub
- Visual Studio Code

## 📂 Project Structure

```text
campus-loss-and-found/
│
├── index.html
├── login.html
├── register.html
├── forgot-password.html
├── browse.html
├── report.html
├── style.css
├── script.js
├── server.js
├── start-portal.bat
├── package.json
├── package-lock.json
├── .gitignore
├── .env.example
└── README.md
```

> Note: `lostfound.db` and `start-portal.bat` may also exist in the local project folder. The database file should generally not be committed if it contains personal data. The startup script is intended for local development on Windows.

## ⚙️ Prerequisites

Before running the project, install:
- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- A web browser
- Git (optional, for cloning the repository)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Nupurrrrr/Campus-lost-and-found.git
```



### 2. Open the Project Folder

```bash
cd campus-lost-and-found-portal
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root directory.

Add the environment variables required by `server.js`, such as the email service configuration and session secret.

Example:

```env
PORT=3000
SESSION_SECRET=replace_with_a_long_random_secret

BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_smtp_login
BREVO_SMTP_PASS=your_smtp_key
```

Use the exact variable names expected by your `server.js`. Email settings are needed only if email verification or password recovery uses SMTP.

**Important:** Never upload your actual `.env` file, email credentials, SMTP keys, or session secrets to GitHub.

### 5. Start the Application

**Option 1: Windows users**

Double-click the `start-portal.bat` file in the project folder. The server will start and the application will open automatically in your default browser.

**Option 2: Using the Terminal**

Run the following command in the project directory:

```bash
npm start
```

### 6. Open the Application

If the browser does not open automatically, visit:

`http://localhost:3000`

Keep the server terminal running while using the application.

## 🔄 How It Works

1. A student registers using their college email address.
2. The student verifies their email if OTP verification is enabled.
3. The student logs in using their registered email and password.
4. The student can report a lost or found item.
5. Item information is stored in the SQLite database.
6. Other logged-in students can browse reported items.
7. Students can use the available contact information to coordinate the return of belongings.

## 🗄️ Database

The application uses SQLite to store information.

The database may contain tables for:

- **Users** – Stores registered user information.
- **Items** – Stores reported lost and found item details.

Item information include:
- Item name
- Description
- Location
- Date
- Contact information

## 🔐 Security Notes

- Passwords are hashed using `bcryptjs`.
- User sessions are managed using `express-session`.
- College email addresses are restricted by the registration logic.
- SMTP credentials and other secrets should be stored in environment variables.
- Authentication and authorization should be enforced on the server side.

This project is intended as a college learning project and should receive additional security testing before production deployment.

## 🎯 Project Objective

The objective of this project is to provide a simple and accessible platform for college students to report lost belongings and find items that have been reported on campus.
It aims to reduce the difficulty of finding lost items and improve communication among students.

## 🔮 Future Improvements

- Add item images.
- Add advanced search and filters.
- Add an item recovery confirmation feature.
- Improve mobile responsiveness.
- Deploy the application online.
- Add an administrator dashboard.
- Improve security and input validation.

## 👩‍💻 Author

**Nupur**

Developed as a college Software Engineering project.

