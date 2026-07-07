const express = require('express');
const mongoose = require('mongoose');
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

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dbms_cop_friendly';
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(MONGODB_URI);
        isConnected = true;
        console.log('Connected to MongoDB.');
        await seedDatabase();
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        throw err;
    }
};

// Ensure database is connected before handling any API requests
app.use(async (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        try {
            await connectDB();
        } catch (err) {
            return res.status(500).json({ error: "DB Connect Error: " + err.message });
        }
    }
    next();
});

// --- Mongoose Schemas & Models ---

const UserSchema = new mongoose.Schema({
    cop_id: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: String,
    rank: String,
    patrol_status: String
});
const User = mongoose.model('User', UserSchema);

const ComplaintSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    district: { type: String, required: true },
    incident_type: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: 'open' },
    created_at: { type: Date, default: Date.now },
    filed_by_cop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
const Complaint = mongoose.model('Complaint', ComplaintSchema);

const FeedbackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    station: { type: String, required: true },
    rating: { type: Number, required: true },
    comments: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});
const Feedback = mongoose.model('Feedback', FeedbackSchema);

const SuspectSchema = new mongoose.Schema({
    aadhaar_id: { type: String, unique: true, required: true },
    reason: { type: String, required: true },
    risk_level: { type: String, required: true }
});
const Suspect = mongoose.model('Suspect', SuspectSchema);

const AuditLogSchema = new mongoose.Schema({
    cop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

const DispatchSchema = new mongoose.Schema({
    dispatch_type: { type: String, required: true },
    status: { type: String, default: 'pending' },
    assigned_cop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dispatch_time: { type: Date, default: Date.now }
});
const Dispatch = mongoose.model('Dispatch', DispatchSchema);

const LostFoundSchema = new mongoose.Schema({
    item_type: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: 'Lost' },
    contact_info: { type: String, required: true },
    reported_at: { type: Date, default: Date.now }
});
const LostFound = mongoose.model('LostFound', LostFoundSchema);

const AnonymousTipSchema = new mongoose.Schema({
    category: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    submitted_at: { type: Date, default: Date.now }
});
const AnonymousTip = mongoose.model('AnonymousTip', AnonymousTipSchema);

const TrafficFineSchema = new mongoose.Schema({
    vehicle_no: { type: String, unique: true, required: true },
    owner_name: { type: String, required: true },
    fine_amount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, default: 'Unpaid' }
});
const TrafficFine = mongoose.model('TrafficFine', TrafficFineSchema);

// --- Database Seeding Function ---
async function seedDatabase() {
    try {
        const adminUser = await User.findOne({ cop_id: 'COP-123' });
        if (!adminUser) {
            const newUser = await User.create({
                cop_id: 'COP-123',
                password: 'admin123',
                name: 'S. Kumar',
                rank: 'Inspector',
                patrol_status: 'On Patrol'
            });
            console.log("Seeded default user: COP-123 / admin123");

            // Seed extra tables
            await Suspect.findOneAndUpdate(
                { aadhaar_id: 'AAD-9988' },
                { reason: 'Pending Warrant', risk_level: 'High' },
                { upsert: true }
            );

            await AuditLog.create({ cop_id: newUser._id, action: 'System Initialization' });
            
            await Dispatch.create({
                dispatch_type: 'Deploy Armed Unit',
                status: 'dispatched',
                assigned_cop_id: newUser._id
            });

            // Seed Traffic Fines
            await TrafficFine.findOneAndUpdate(
                { vehicle_no: 'TN-01-AB-1234' },
                { owner_name: 'Ramesh K.', fine_amount: 500, reason: 'Signal Jump' },
                { upsert: true }
            );
            await TrafficFine.findOneAndUpdate(
                { vehicle_no: 'TN-22-XY-9988' },
                { owner_name: 'Priya S.', fine_amount: 1000, reason: 'Over speeding' },
                { upsert: true }
            );
        }
    } catch (err) {
        console.error("Error seeding database:", err.message);
    }
}

// --- API Endpoints ---

// Register API
app.post('/api/register', async (req, res) => {
    const { cop_id, password } = req.body;
    
    if (!cop_id || !password) {
        return res.status(400).json({ error: "Missing credentials" });
    }

    try {
        const existingUser = await User.findOne({ cop_id });
        if (existingUser) {
            return res.status(400).json({ error: "ID already exists" });
        }
        await User.create({ cop_id, password });
        res.json({ success: true, message: "Registration successful" });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Login API
app.post('/api/login', async (req, res) => {
    const { cop_id, password } = req.body;
    
    if (!cop_id || !password) {
        return res.status(400).json({ error: "Missing credentials" });
    }

    try {
        const user = await User.findOne({ cop_id, password });
        if (user) {
            res.json({ success: true, message: "Login successful", user: { id: user._id, cop_id: user.cop_id } });
        } else {
            res.status(401).json({ success: false, error: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Submit Complaint API
app.post('/api/complaints', async (req, res) => {
    const { fullName, district, incidentType, description } = req.body;
    
    if (!fullName || !district || !incidentType || !description) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const complaint = await Complaint.create({
            full_name: fullName,
            district,
            incident_type: incidentType,
            description
        });
        res.json({ success: true, message: "Complaint filed successfully", complaintId: complaint._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "DB Error: " + err.message });
    }
});

// Get Complaints API (for potential use in dashboard)
app.get('/api/complaints', async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ created_at: -1 }).lean();
        const mappedComplaints = complaints.map(c => ({...c, id: c._id}));
        res.json({ success: true, complaints: mappedComplaints });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Close Complaint Case API
app.put('/api/complaints/:id/close', async (req, res) => {
    const { id } = req.params;
    try {
        await Complaint.findByIdAndUpdate(id, { status: 'closed' });
        res.json({ success: true, message: "Case closed successfully" });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Submit Feedback API
app.post('/api/feedback', async (req, res) => {
    const { name, station, rating, comments } = req.body;
    
    if (!name || !station || !rating || !comments) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        await Feedback.create({ name, station, rating, comments });
        res.json({ success: true, message: "Feedback submitted successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Get Feedback API
app.get('/api/feedback', async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ created_at: -1 }).lean();
        res.json({ success: true, feedback: feedback.map(f => ({...f, id: f._id})) });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Submit Lost & Found API
app.post('/api/lost_found', async (req, res) => {
    const { item_type, description, status, contact_info } = req.body;
    
    if (!item_type || !description || !contact_info) {
        return res.status(400).json({ error: "Item type, description, and contact info are required" });
    }

    try {
        await LostFound.create({
            item_type,
            description,
            status: status || 'Lost',
            contact_info
        });
        res.json({ success: true, message: "Report submitted successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Get Lost & Found API
app.get('/api/lost_found', async (req, res) => {
    try {
        const items = await LostFound.find().sort({ reported_at: -1 }).lean();
        res.json({ success: true, items: items.map(i => ({...i, id: i._id})) });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Submit Anonymous Tip API
app.post('/api/tips', async (req, res) => {
    const { category, description, location } = req.body;
    
    if (!category || !description || !location) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        await AnonymousTip.create({ category, description, location });
        res.json({ success: true, message: "Tip submitted anonymously. Thank you." });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Check Traffic Fine API
app.get('/api/traffic/:vehicle', async (req, res) => {
    const vehicle_no = req.params.vehicle.toUpperCase();
    
    try {
        const fines = await TrafficFine.find({ vehicle_no }).lean();
        res.json({ success: true, fines: fines.map(f => ({...f, id: f._id})) });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Get Suspects API
app.get('/api/suspects', async (req, res) => {
    try {
        const suspects = await Suspect.find().lean();
        res.json({ success: true, suspects });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Get Audit Logs API
app.get('/api/audit-logs', async (req, res) => {
    try {
        const logs = await AuditLog.find().populate('cop_id', 'cop_id').sort({ timestamp: -1 }).limit(20).lean();
        res.json({ success: true, logs });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Get Users API (for Roster)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').lean();
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Get Dispatches API (for Incidents)
app.get('/api/dispatches', async (req, res) => {
    try {
        const dispatches = await Dispatch.find().sort({ dispatch_time: -1 }).limit(20).lean();
        res.json({ success: true, dispatches });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Create Dispatch API
app.post('/api/dispatches', async (req, res) => {
    const { action } = req.body;
    try {
        const dispatch = await Dispatch.create({ dispatch_type: action, status: 'dispatched' });
        res.json({ success: true, dispatch });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Export for Vercel
module.exports = app;

// Start the server (Only run listen if not on Vercel)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}
