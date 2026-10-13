require("dotenv").config();

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const session = require("express-session");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 3000;

// =====================================
// BREVO EMAIL SETUP
// =====================================

const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: Number(process.env.BREVO_SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS
    }
});

// =====================================
// MIDDLEWARE
// =====================================

app.use(express.json());

app.use(
    session({
        secret: "campus-lost-found-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 60 * 60 * 1000
        }
    })
);

// =====================================
// DATABASE
// =====================================

const db = new sqlite3.Database("lostfound.db", (err) => {

    if (err) {
        console.log("Database error:", err.message);
    } else {
        console.log("Database connected successfully!");
    }

});

// =====================================
// ITEMS TABLE
// =====================================

db.run(`
    CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        itemName TEXT,
        description TEXT,
        location TEXT,
        date TEXT,
        contact TEXT
    )
`);

// =====================================
// USERS TABLE
// =====================================

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )
`);

// =====================================
// PENDING REGISTRATIONS TABLE
// =====================================

db.run(`
    CREATE TABLE IF NOT EXISTS pending_registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        otp_hash TEXT,
        otp_expires INTEGER,
        attempts INTEGER DEFAULT 0
    )
`);


// =====================================
// PASSWORD RESET TABLE
// =====================================

db.run(`
    CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        otp_hash TEXT,
        otp_expires INTEGER
    )
`);

// =====================================
// LOGIN REQUIRED MIDDLEWARE
// =====================================

function requireLogin(req, res, next) {

    if (!req.session.userId) {

        return res.status(401).json({
            error: "Please login first"
        });

    }

    next();
}

// =====================================
// PROTECTED PAGES
// =====================================

// Browse page
app.get("/browse.html", (req, res, next) => {

    if (!req.session.userId) {
        return res.redirect("/login.html");
    }

    next();

});

// Report page
app.get("/report.html", (req, res, next) => {

    if (!req.session.userId) {
        return res.redirect("/login.html");
    }

    next();

});

// =====================================
// SERVE WEBSITE FILES
// =====================================

app.use(express.static("."));

// =====================================
// TEST EMAIL ROUTE
// =====================================

app.get("/api/test-email", async (req, res) => {

    try {

        await transporter.sendMail({

            from: `"Campus Lost and Found" <${process.env.BREVO_SENDER_EMAIL}>`,

            to: process.env.BREVO_SENDER_EMAIL,

            subject: "Campus Lost and Found - Test Email",

            text: "Brevo email system is working successfully!"

        });

        res.json({
            message: "Test email sent successfully!"
        });

    } catch (error) {

        console.log("Email error:", error);

        res.status(500).json({
            error: "Email could not be sent"
        });

    }

});

// =====================================
// TEST ROUTE
// =====================================

app.get("/test", (req, res) => {

    res.send("Server is working!");

});

// =====================================
// REGISTER - SEND OTP
// =====================================

app.post("/api/register", async (req, res) => {

    const { email, password } = req.body;

    // Check fields
    if (!email || !password) {

        return res.status(400).json({
            error: "Email and password are required"
        });

    }

    // Clean email
    const cleanEmail = email.toLowerCase().trim();

    // Only UEM email allowed
    if (!cleanEmail.endsWith("@uem.edu.in")) {

        return res.status(401).json({
            error: "Only UEM college email is allowed"
        });

    }

    // Password length
    if (password.length < 6) {

        return res.status(400).json({
            error: "Password must be at least 6 characters"
        });

    }


    // Check if account already exists
    db.get(
        "SELECT * FROM users WHERE email = ?",
        [cleanEmail],
        async (err, user) => {

            if (err) {

                console.log("Database error:", err.message);

                return res.status(500).json({
                    error: "Database error"
                });

            }


            // Existing account
            if (user) {

                return res.status(409).json({
                    error: "This email is already registered"
                });

            }


            try {

                // Hash password
                const hashedPassword =
                    await bcrypt.hash(password, 10);


                // Generate 6-digit OTP
                const otp =
                    Math.floor(100000 + Math.random() * 900000).toString();


                // Hash OTP
                const otpHash =
                    await bcrypt.hash(otp, 10);


                // OTP expires after 10 minutes
                const otpExpires =
                    Date.now() + 10 * 60 * 1000;


                // Save pending registration
                db.run(
                    `
                    INSERT OR REPLACE INTO pending_registrations
                    (email, password, otp_hash, otp_expires, attempts)
                    VALUES (?, ?, ?, ?, 0)
                    `,
                    [
                        cleanEmail,
                        hashedPassword,
                        otpHash,
                        otpExpires
                    ],
                    async function (err) {

                        if (err) {

                            console.log(
                                "Pending registration error:",
                                err.message
                            );

                            return res.status(500).json({
                                error: "Could not start registration"
                            });

                        }


                        // Send OTP email
                        try {

                            await transporter.sendMail({

                                from:
                                    `"Campus Lost and Found" <${process.env.BREVO_SENDER_EMAIL}>`,

                                to: cleanEmail,

                                subject:
                                    "Campus Lost and Found - OTP Verification",

                                text:
                                    `Your OTP for Campus Lost and Found registration is ${otp}. This OTP is valid for 10 minutes.`

                            });


                            console.log(
                                "OTP email sent to:",
                                cleanEmail
                            );


                            res.json({

                                message:
                                    "OTP sent successfully"

                            });


                        } catch (emailError) {

                            console.log(
                                "OTP email error:",
                                emailError
                            );


                            // Remove pending registration
                            db.run(
                                "DELETE FROM pending_registrations WHERE email = ?",
                                [cleanEmail]
                            );


                            res.status(500).json({

                                error:
                                    "Could not send OTP email. Please try again."

                            });

                        }

                    }
                );

            } catch (error) {

                console.log(error);

                res.status(500).json({
                    error: "Something went wrong"
                });

            }

        }
    );

});


// =====================================
// VERIFY OTP
// =====================================

app.post("/api/verify-otp", async (req, res) => {

    const { email, otp } = req.body;


    if (!email || !otp) {

        return res.status(400).json({
            error: "Email and OTP are required"
        });

    }


    const cleanEmail = email.toLowerCase().trim();


    db.get(
        "SELECT * FROM pending_registrations WHERE email = ?",
        [cleanEmail],
        async (err, registration) => {

            if (err) {

                console.log(
                    "Database error:",
                    err.message
                );

                return res.status(500).json({
                    error: "Database error"
                });

            }


            // No pending registration
            if (!registration) {

                return res.status(400).json({
                    error: "No pending registration found"
                });

            }


            // Check expiry
            if (Date.now() > registration.otp_expires) {

                db.run(
                    "DELETE FROM pending_registrations WHERE email = ?",
                    [cleanEmail]
                );

                return res.status(400).json({
                    error: "OTP has expired. Please register again."
                });

            }


            try {

                // Compare OTP
                const otpMatch =
                    await bcrypt.compare(
                        otp,
                        registration.otp_hash
                    );


                if (!otpMatch) {

                    return res.status(400).json({
                        error: "Invalid OTP"
                    });

                }


                // Create actual account
                db.run(
                    `
                    INSERT INTO users
                    (email, password)
                    VALUES (?, ?)
                    `,
                    [
                        registration.email,
                        registration.password
                    ],
                    function (err) {

                        if (err) {

                            console.log(
                                "Account creation error:",
                                err.message
                            );

                            return res.status(500).json({
                                error: "Could not create account"
                            });

                        }


                        // Delete pending registration
                        db.run(
                            "DELETE FROM pending_registrations WHERE email = ?",
                            [cleanEmail]
                        );


                        res.json({

                            message:
                                "Account created successfully!",

                            email:
                                cleanEmail

                        });

                    }
                );

            } catch (error) {

                console.log(error);

                res.status(500).json({
                    error: "OTP verification failed"
                });

            }

        }
    );

});


// =====================================
// FORGOT PASSWORD - SEND OTP
// =====================================

app.post("/api/forgot-password", async (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            error: "Email is required"
        });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail.endsWith("@uem.edu.in")) {
        return res.status(400).json({
            error: "Please use your UEM college email"
        });
    }

    // Check if account exists
    db.get(
        "SELECT * FROM users WHERE email = ?",
        [cleanEmail],
        async (err, user) => {

            if (err) {
                console.log("Database error:", err.message);

                return res.status(500).json({
                    error: "Database error"
                });
            }

            if (!user) {
                return res.status(404).json({
                    error: "No account found with this email"
                });
            }

            try {

                // Generate 6-digit OTP
                const otp =
                    Math.floor(
                        100000 + Math.random() * 900000
                    ).toString();

                // Hash OTP before storing it
                const otpHash =
                    await bcrypt.hash(otp, 10);

                // OTP valid for 10 minutes
                const otpExpires =
                    Date.now() + 10 * 60 * 1000;


                // Save OTP
                db.run(
                    `
                    INSERT OR REPLACE INTO password_resets
                    (email, otp_hash, otp_expires)
                    VALUES (?, ?, ?)
                    `,
                    [
                        cleanEmail,
                        otpHash,
                        otpExpires
                    ],
                    async function (err) {

                        if (err) {

                            console.log(
                                "Password reset error:",
                                err.message
                            );

                            return res.status(500).json({
                                error: "Could not generate OTP"
                            });
                        }


                        // Send OTP through Brevo
                        try {

                            await transporter.sendMail({

                                from:
                                    `"Campus Lost and Found" <${process.env.BREVO_SENDER_EMAIL}>`,

                                to: cleanEmail,

                                subject:
                                    "Campus Lost and Found - Password Reset OTP",

                                text:
                                    `Your OTP for resetting your Campus Lost and Found password is ${otp}. This OTP is valid for 10 minutes.`

                            });


                            console.log(
                                "Password reset OTP sent to:",
                                cleanEmail
                            );


                            res.json({
                                message:
                                    "OTP sent successfully"
                            });


                        } catch (emailError) {

                            console.log(
                                "OTP email error:",
                                emailError
                            );


                            // Remove OTP if email failed
                            db.run(
                                "DELETE FROM password_resets WHERE email = ?",
                                [cleanEmail]
                            );


                            res.status(500).json({
                                error:
                                    "Could not send OTP email. Please try again."
                            });

                        }

                    }
                );

            } catch (error) {

                console.log(error);

                res.status(500).json({
                    error: "Something went wrong"
                });

            }

        }
    );

});

// =====================================
// RESET PASSWORD - VERIFY OTP
// =====================================

app.post("/api/reset-password", async (req, res) => {

    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({
            error: "All fields are required"
        });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail.endsWith("@uem.edu.in")) {
        return res.status(400).json({
            error: "Please use your UEM college email"
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            error: "Password must be at least 6 characters"
        });
    }

    db.get(
        "SELECT * FROM password_resets WHERE email = ?",
        [cleanEmail],
        async (err, resetData) => {

            if (err) {
                console.log("Database error:", err.message);

                return res.status(500).json({
                    error: "Database error"
                });
            }

            if (!resetData) {
                return res.status(400).json({
                    error: "No password reset request found"
                });
            }

            // Check OTP expiry
            if (Date.now() > resetData.otp_expires) {

                db.run(
                    "DELETE FROM password_resets WHERE email = ?",
                    [cleanEmail]
                );

                return res.status(400).json({
                    error: "OTP has expired. Please request a new OTP."
                });
            }

            try {

                // Compare entered OTP with hashed OTP
                const otpMatch =
                    await bcrypt.compare(
                        otp,
                        resetData.otp_hash
                    );

                if (!otpMatch) {
                    return res.status(400).json({
                        error: "Invalid OTP"
                    });
                }


                // Hash new password
                const hashedPassword =
                    await bcrypt.hash(
                        newPassword,
                        10
                    );


                // Update existing user's password
                db.run(
                    `
                    UPDATE users
                    SET password = ?
                    WHERE email = ?
                    `,
                    [
                        hashedPassword,
                        cleanEmail
                    ],
                    function (err) {

                        if (err) {

                            console.log(
                                "Password update error:",
                                err.message
                            );

                            return res.status(500).json({
                                error:
                                    "Could not update password"
                            });
                        }


                        if (this.changes === 0) {

                            return res.status(404).json({
                                error:
                                    "Account not found"
                            });
                        }


                        // Delete OTP after successful reset
                        db.run(
                            "DELETE FROM password_resets WHERE email = ?",
                            [cleanEmail]
                        );


                        res.json({
                            message:
                                "Password reset successfully!"
                        });

                    }
                );

            } catch (error) {

                console.log(error);

                res.status(500).json({
                    error:
                        "Password reset failed"
                });

            }

        }
    );

});

// =====================================
// LOGIN
// =====================================

app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    // Check fields
    if (!email || !password) {

        return res.status(400).json({
            error: "Email and password are required"
        });

    }

    // Clean email
    const cleanEmail =
        email.toLowerCase().trim();

    // Only UEM email allowed
    if (!cleanEmail.endsWith("@uem.edu.in")) {

        return res.status(401).json({
            error: "Only UEM college email is allowed"
        });

    }

    // Find user
    db.get(
        "SELECT * FROM users WHERE email = ?",
        [cleanEmail],
        async (err, user) => {

            if (err) {

                console.log(
                    "Database error:",
                    err.message
                );

                return res.status(500).json({
                    error: "Database error"
                });

            }

            // User not found
            if (!user) {

                return res.status(401).json({
                    error: "Email is not registered"
                });

            }

            try {

                // Compare password
                const passwordMatch =
                    await bcrypt.compare(
                        password,
                        user.password
                    );

                // Wrong password
                if (!passwordMatch) {

                    return res.status(401).json({
                        error: "Incorrect password"
                    });

                }

                // Create login session
                req.session.userId =
                    user.id;

                req.session.userEmail =
                    user.email;

                // Login successful
                res.json({

                    message:
                        "Login successful!",

                    email:
                        user.email

                });

            } catch (error) {

                console.log(error);

                res.status(500).json({
                    error: "Login failed"
                });

            }

        }
    );

});

// =====================================
// LOGOUT
// =====================================

app.post("/api/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {

            return res.status(500).json({
                error: "Could not logout"
            });

        }

        res.json({
            message: "Logout successful!"
        });

    });

});

// =====================================
// CHECK LOGIN
// =====================================

app.get("/api/me", (req, res) => {

    if (!req.session.userId) {

        return res.json({
            loggedIn: false
        });

    }

    res.json({

        loggedIn: true,

        email:
            req.session.userEmail

    });

});

// =====================================
// ADD ITEM
// =====================================

app.post("/api/items", requireLogin, (req, res) => {

    const {
        type,
        itemName,
        description,
        location,
        date,
        contact
    } = req.body;

    // Check required fields
    if (
        !type ||
        !itemName ||
        !description ||
        !location ||
        !date ||
        !contact
    ) {

        return res.status(400).json({
            error: "All fields are required"
        });

    }

    const sql = `
        INSERT INTO items
        (type, itemName, description, location, date, contact)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [
            type,
            itemName,
            description,
            location,
            date,
            contact
        ],
        function (err) {

            if (err) {

                console.log(
                    "Database insert error:",
                    err.message
                );

                return res.status(500).json({
                    error: "Could not save item"
                });

            }

            res.json({

                message:
                    "Item reported successfully!",

                id:
                    this.lastID

            });

        }
    );

});

// =====================================
// GET ALL ITEMS
// =====================================

app.get("/api/items", requireLogin, (req, res) => {

    db.all(
        "SELECT * FROM items ORDER BY id DESC",
        [],
        (err, rows) => {

            if (err) {

                console.log(
                    "Database read error:",
                    err.message
                );

                return res.status(500).json({
                    error: "Could not get items"
                });

            }

            res.json(rows);

        }
    );

});

// =====================================
// START SERVER
// =====================================

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});