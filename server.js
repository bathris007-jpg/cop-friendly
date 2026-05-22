const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Initialize SQLite Database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        db.serialize(() => {
            // Create Users table
            db.run(`CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cop_id TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT,
            rank TEXT,
            patrol_status TEXT
        )`, (err) => {
            if (err) console.error("Error creating Users table:", err.message);
        });

        // Create Complaints table
        db.run(`CREATE TABLE IF NOT EXISTS Complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            district TEXT NOT NULL,
            incident_type TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT DEFAULT 'open',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            filed_by_cop_id INTEGER,
            FOREIGN KEY(filed_by_cop_id) REFERENCES Users(id)
        )`, (err) => {
            if (err) console.error("Error creating Complaints table:", err.message);
        });

        // Create Feedback table
        db.run(`CREATE TABLE IF NOT EXISTS Feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            station TEXT NOT NULL,
            rating INTEGER NOT NULL,
            comments TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error("Error creating Feedback table:", err.message);
        });

        // Create Suspects table
        db.run(`CREATE TABLE IF NOT EXISTS Suspects (
            suspect_id INTEGER PRIMARY KEY AUTOINCREMENT,
            aadhaar_id TEXT UNIQUE NOT NULL,
            reason TEXT NOT NULL,
            risk_level TEXT NOT NULL
        )`, (err) => {
            if (err) console.error("Error creating Suspects table:", err.message);
        });

        // Create Audit_Logs table
        db.run(`CREATE TABLE IF NOT EXISTS Audit_Logs (
            log_id INTEGER PRIMARY KEY AUTOINCREMENT,
            cop_id INTEGER,
            action TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(cop_id) REFERENCES Users(id)
        )`, (err) => {
            if (err) console.error("Error creating Audit_Logs table:", err.message);
        });

        // Create Dispatches table
        db.run(`CREATE TABLE IF NOT EXISTS Dispatches (
            dispatch_id INTEGER PRIMARY KEY AUTOINCREMENT,
            dispatch_type TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            assigned_cop_id INTEGER,
            dispatch_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(assigned_cop_id) REFERENCES Users(id)
        )`, (err) => {
            if (err) console.error("Error creating Dispatches table:", err.message);
        });

        // Create Lost_Found table
        db.run(`CREATE TABLE IF NOT EXISTS Lost_Found (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_type TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT DEFAULT 'Lost',
            contact_info TEXT NOT NULL,
            reported_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error("Error creating Lost_Found table:", err.message);
        });

        // Create Anonymous_Tips table
        db.run(`CREATE TABLE IF NOT EXISTS Anonymous_Tips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            location TEXT NOT NULL,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error("Error creating Anonymous_Tips table:", err.message);
        });

        // Create Traffic_Fines table
        db.run(`CREATE TABLE IF NOT EXISTS Traffic_Fines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicle_no TEXT UNIQUE NOT NULL,
            owner_name TEXT NOT NULL,
            fine_amount INTEGER NOT NULL,
            reason TEXT NOT NULL,
            status TEXT DEFAULT 'Unpaid'
        )`, (err) => {
            if (err) console.error("Error creating Traffic_Fines table:", err.message);
        });

        // Seed an initial user if none exists
        db.get("SELECT * FROM Users WHERE cop_id = 'COP-123'", (err, row) => {
            if (!row) {
                db.run("INSERT INTO Users (cop_id, password, name, rank, patrol_status) VALUES ('COP-123', 'admin123', 'S. Kumar', 'Inspector', 'On Patrol')", (err) => {
                    if (err) console.error("Error seeding user:", err.message);
                    else {
                        console.log("Seeded default user: COP-123 / admin123");
                        // Seed extra tables
                        db.run("INSERT OR IGNORE INTO Suspects (aadhaar_id, reason, risk_level) VALUES ('AAD-9988', 'Pending Warrant', 'High')");
                        db.run("INSERT INTO Audit_Logs (cop_id, action) VALUES (1, 'System Initialization')");
                        db.run("INSERT INTO Dispatches (dispatch_type, status, assigned_cop_id) VALUES ('Deploy Armed Unit', 'dispatched', 1)");
                        
                        // Seed Traffic Fines
                        db.run("INSERT OR IGNORE INTO Traffic_Fines (vehicle_no, owner_name, fine_amount, reason) VALUES ('TN-01-AB-1234', 'Ramesh K.', 500, 'Signal Jump')");
                        db.run("INSERT OR IGNORE INTO Traffic_Fines (vehicle_no, owner_name, fine_amount, reason) VALUES ('TN-22-XY-9988', 'Priya S.', 1000, 'Over speeding')");
                    }
                });
            }
        });
    });
    }
});

// --- API Endpoints ---

// Register API
app.post('/api/register', (req, res) => {
    const { cop_id, password } = req.body;
    
    if (!cop_id || !password) {
        return res.status(400).json({ error: "Missing credentials" });
    }

    db.run("INSERT INTO Users (cop_id, password) VALUES (?, ?)", [cop_id, password], function(err) {
        if (err) {
            return res.status(400).json({ error: "ID already exists or database error" });
        }
        res.json({ success: true, message: "Registration successful" });
    });
});

// Login API
app.post('/api/login', (req, res) => {
    const { cop_id, password } = req.body;
    
    if (!cop_id || !password) {
        return res.status(400).json({ error: "Missing credentials" });
    }

    // In a real app, passwords should be hashed. Here we use plaintext for simplicity.
    db.get("SELECT * FROM Users WHERE cop_id = ? AND password = ?", [cop_id, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        if (row) {
            res.json({ success: true, message: "Login successful", user: { id: row.id, cop_id: row.cop_id } });
        } else {
            res.status(401).json({ success: false, error: "Invalid credentials" });
        }
    });
});

// Submit Complaint API
app.post('/api/complaints', (req, res) => {
    const { fullName, district, incidentType, description } = req.body;
    
    if (!fullName || !district || !incidentType || !description) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = `INSERT INTO Complaints (full_name, district, incident_type, description) VALUES (?, ?, ?, ?)`;
    db.run(sql, [fullName, district, incidentType, description], function(err) {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true, message: "Complaint filed successfully", complaintId: this.lastID });
    });
});

// Get Complaints API (for potential use in dashboard)
app.get('/api/complaints', (req, res) => {
    db.all("SELECT * FROM Complaints ORDER BY created_at DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true, complaints: rows });
    });
});

// Close Complaint Case API
app.put('/api/complaints/:id/close', (req, res) => {
    const { id } = req.params;
    db.run("UPDATE Complaints SET status = 'closed' WHERE id = ?", [id], function(err) {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true, message: "Case closed successfully" });
    });
});

// Submit Feedback API
app.post('/api/feedback', (req, res) => {
    const { name, station, rating, comments } = req.body;
    
    if (!name || !station || !rating || !comments) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = `INSERT INTO Feedback (name, station, rating, comments) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, station, rating, comments], function(err) {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true, message: "Feedback submitted successfully!" });
    });
});

// Get Feedback API
app.get('/api/feedback', (req, res) => {
    db.all("SELECT * FROM Feedback ORDER BY created_at DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true, feedback: rows });
    });
});

// Submit Lost & Found API
app.post('/api/lost_found', (req, res) => {
    const { item_type, description, status, contact_info } = req.body;
    
    if (!item_type || !description || !contact_info) {
        return res.status(400).json({ error: "Item type, description, and contact info are required" });
    }

    const sql = `INSERT INTO Lost_Found (item_type, description, status, contact_info) VALUES (?, ?, ?, ?)`;
    db.run(sql, [item_type, description, status || 'Lost', contact_info], function(err) {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true, message: "Report submitted successfully!" });
    });
});

// Get Lost & Found API
app.get('/api/lost_found', (req, res) => {
    db.all("SELECT * FROM Lost_Found ORDER BY reported_at DESC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true, items: rows });
    });
});

// Submit Anonymous Tip API
app.post('/api/tips', (req, res) => {
    const { category, description, location } = req.body;
    
    if (!category || !description || !location) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = `INSERT INTO Anonymous_Tips (category, description, location) VALUES (?, ?, ?)`;
    db.run(sql, [category, description, location], function(err) {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true, message: "Tip submitted anonymously. Thank you." });
    });
});

// Check Traffic Fine API
app.get('/api/traffic/:vehicle', (req, res) => {
    const vehicle_no = req.params.vehicle.toUpperCase();
    
    db.all("SELECT * FROM Traffic_Fines WHERE vehicle_no = ?", [vehicle_no], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ success: true, fines: rows });
    });
});

// Export for Vercel
module.exports = app;

// Start the server (Only run listen if not on Vercel)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}
