const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 5050;
const MONGO_URL = "mongodb://admin:qwerty@localhost:27017";
const DB_NAME = "Rohith-db";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Root route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ✅ Add user route - allows duplicates
app.post("/addUser", async (req, res) => {
    let { date, Necessary, Spended_Amount } = req.body;
    date = date || new Date().toISOString().split("T")[0];

    const client = new MongoClient(MONGO_URL);
    try {
        await client.connect();
        const db = client.db(DB_NAME);

        await db.collection("users").insertOne({
            date,
            Necessary,
            Spended_Amount: parseFloat(Spended_Amount)
        });

        res.send("User registered successfully!");
    } catch (err) {
        console.error("Error inserting user:", err);
        if (!res.headersSent) {
            res.status(500).send("Error registering user.");
        }
    } finally {
        await client.close();
    }
});

// ✅ Get users route
app.get("/getUsers", async (req, res) => {
    const client = new MongoClient(MONGO_URL);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const users = await db.collection("users").find({}).toArray();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching users");
    } finally {
        await client.close();
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
