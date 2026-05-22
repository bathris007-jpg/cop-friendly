# Project Report: Smart Cop-Friendly Policing App (Antigravity Cop Protector)

## 1. Introduction
The **Smart Cop-Friendly Policing App (Heritage-Data-Core)** is a full-stack public safety and database management system designed specifically to assist law enforcement officers in Tamil Nadu. The system provides a highly secure, futuristic dashboard for tracking encrypted records, filing public complaints (FIRs), managing officer duty rosters, and monitoring live crime data.

The project replaces outdated, manual policing tools with a dynamic, centralized "TN Core" interface that visualizes database operations in real-time.

---

## 2. Technology Stack
The application is built using a modern, lightweight, and zero-setup technology stack to ensure stability and ease of deployment:
* **Frontend:** Vanilla HTML5, CSS3 (Custom variables, glassmorphism UI), and JavaScript (ES6+).
* **Backend:** Node.js with the Express.js framework.
* **Database:** SQLite3 (A self-contained, serverless SQL database engine).
* **API Integration:** RESTful APIs using the Fetch API.

---

## 3. System Architecture
The application follows a standard Client-Server Architecture:
1. **Client Interface:** The user interacts with the UI (e.g., Dashboard, File FIR form). Forms prevent default submission and instead serialize the data into JSON format.
2. **REST API (Backend):** An Express server receives the asynchronous `fetch()` requests on designated endpoints (`/api/login`, `/api/complaints`).
3. **Database Layer:** The server processes the requests, executes the corresponding SQL statements against the `database.db` SQLite file, and returns a JSON response back to the client interface.

---

## 4. Key Features
* **Heritage-Data-Core Dashboard:** A comprehensive, high-contrast dashboard featuring live active connection counts, security status visualizations, and access to all core modules.
* **Live Data Stream:** A dedicated module integrated into the sidebar that directly fetches and displays live records from the SQLite database in real-time.
* **FIR / Complaint Filing System:** A secure public-facing portal where citizens or officers can log incident reports. Data is seamlessly transmitted to the backend database.
* **Secure Officer Authentication:** A login gateway requiring an Officer ID and Encryption Key, protecting the TN Core from unauthorized access.
* **Aesthetic Design:** A premium "Quant-Dark" and "Temple-Bronze" color scheme utilizing modern UI principles like glassmorphism and bento-box layouts.

---

## 5. Database Schema
The database is fully normalized and stored locally in `database.db`. It consists of the following primary tables:

### Table: `Users` (Authentication)
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier for the user |
| `cop_id` | TEXT | UNIQUE, NOT NULL | The Officer's ID / Aadhaar ID |
| `password` | TEXT | NOT NULL | The encryption key/password |

### Table: `Complaints` (FIR Entries)
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique Complaint Record ID |
| `full_name` | TEXT | NOT NULL | Name of the complainant |
| `district` | TEXT | NOT NULL | Location of the incident |
| `incident_type` | TEXT | NOT NULL | Category of crime (e.g., Cyber Fraud) |
| `description` | TEXT | NOT NULL | Detailed log of the event |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP| Timestamp of submission |

---

## 6. API Endpoints
* **`POST /api/login`**: Authenticates an officer against the `Users` table.
* **`POST /api/complaints`**: Inserts a new FIR record into the `Complaints` table.
* **`GET /api/complaints`**: Retrieves all records from the `Complaints` table, ordered by the most recent submission.

---

## 7. Conclusion
The implementation of the Express and SQLite backend successfully transformed the static interface into a fully functional, data-driven application. The resulting system effectively demonstrates fundamental DBMS concepts, RESTful API design, and modern frontend architecture tailored for law enforcement and public safety operations.
