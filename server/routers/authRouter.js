import { Router } from "express";
import bcrypt from "bcrypt";
import { sendSignUpEmail, sendLoginEmail } from "../mail/mailer.js";
import connection from "../database/connection.js";

const authRouter = Router();

// Helper to make db.query async-friendly
function query(sql, values) {
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

// SIGNUP
authRouter.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existing = await query("SELECT * FROM users WHERE username = ? OR email = ?", [username, email]);
        if (existing.length > 0) {
            return res.status(400).send({ error: "Username or email already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword]);

        const [user] = await query("SELECT * FROM users WHERE username = ?", [username]);

        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.roles,
        };

        await sendSignUpEmail(user.email, user.username);

        res.send({ message: "Signup successful", user: req.session.user });

    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Something went wrong" });
    }
});

// LOGIN
authRouter.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const [user] = await query("SELECT * FROM users WHERE username = ? OR email = ?", [username, username]);

        if (!user) {
            return res.status(400).send({ error: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).send({ error: "Invalid credentials" });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.roles,
        };

        await sendLoginEmail(user.email, user.username);

        res.send({ message: "Login successful", user: req.session.user });

    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Something went wrong" });
    }
});

// LOGOUT
authRouter.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send({ error: "Logout failed" });
        res.clearCookie("connect.sid");
        res.send({ message: "Logged out successfully" });
    });
});

// Admin check
authRouter.get("/admin-only", (req, res) => {
    if (req.session.user?.role === "admin") {
        return res.send({ message: "Welcome, admin!" });
    } else {
        return res.status(403).send({ error: "Admins only!" });
    }
});

export default authRouter;
