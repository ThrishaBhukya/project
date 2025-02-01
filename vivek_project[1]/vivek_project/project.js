const express = require("express");
const mysql = require("mysql2/promise"); 
const app = express();
const path = require("path");
const bodyParser = require('body-parser'); 

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


const dbConfig = {
    host: "localhost",
    user: "root",
    password: "root", 
    database: "mydb999",
};


let pool;
async function connectToDB() {
    pool = mysql.createPool(dbConfig);
    try {
        await pool.getConnection();
        console.log('Connected to MySQL database');
    } catch (err) {
        console.error('Error connecting to MySQL database:', err);
        throw err; 
    }
}

connectToDB().catch(err => {throw err});


app.get("/", async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, "reg2.html"));
    } catch (err) {
        console.error("Error sending reg2.html:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/register", async (req, res) => {
    const { uname, email, pwd, cpwd } = req.body;
    if (pwd !== cpwd) {
        return res.status(400).send("Passwords do not match");
    }
    try {
        const connection = await pool.getConnection();
        const [rows, fields] = await connection.execute("INSERT INTO studentinfo (uname, email, pwd) VALUES (?, ?, ?)", [uname, email, pwd]); //removed cpwd
        connection.release();
        res.redirect("/login.html");
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/auth", async (req, res) => {
    const { uname, pwd } = req.body;
    try {
        const connection = await pool.getConnection();
        const [rows, fields] = await connection.execute("SELECT * FROM studentinfo WHERE email = ? AND pwd = ?", [uname, pwd]);
        connection.release();
        if (rows.length > 0) {
            res.redirect("/dashboard");
        } else {
            res.send("Invalid username or password");
        }
    } catch (err) {
        console.error("Error during authentication:", err);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "dash.html"));
});

app.get("/logout", (req, res) => {
    res.sendFile(path.join(__dirname, "logout.html"));
});

app.get("/messages.html", (req, res) => {
    res.sendFile(path.join(__dirname, "message.html"));
});


app.get("/profile.html", (req, res) => {
    res.sendFile(path.join(__dirname, "profile.html"));
});

app.get("/search.html", (req, res) => {
    res.sendFile(path.join(__dirname, "search.html"));
});

app.get("/settings.html", (req, res) => {
    res.sendFile(path.join(__dirname, "settings.html"));
});


app.get("/search", async (req, res) => {
    const { q } = req.query;
    try {
        const connection = await pool.getConnection();
        const [rows, fields] = await connection.execute("SELECT uname FROM studentinfo WHERE uname LIKE ?", [`%${q}%`]);
        connection.release();
        res.json(rows.map(row => row.uname));
    } catch (err) {
        console.error("Error searching users:", err);
        res.status(500).send("Internal Server Error");
    }
});


app.listen(8050, () => {
    console.log("Server is running on http://localhost:8050");
});