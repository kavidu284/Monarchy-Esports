# Monarchy Esports Tournament Management Platform

Monarchy Esports is a web-based esports tournament management platform built for organizing Mobile Legends: Bang Bang tournaments. The system includes public tournament pages, team registration, admin tournament management, round-robin groups, bracket matches, winner updates, announcements, gallery, and contact messages.

## Features

### Public Website

* Home page with tournament highlights
* Tournament listing page
* Tournament details page
* Tournament registration form
* Round Robin standings display
* Bracket and match schedule display
* News and announcements
* Gallery page
* Contact form
* Responsive mobile-friendly UI

### Admin Panel

* Admin login and protected routes
* Dashboard statistics
* Create and manage tournaments
* Upload tournament banner images
* View and manage team registrations
* Approve or reject teams
* View registration details with uploaded files
* Create and manage Round Robin groups
* Add teams to groups
* Update standings and points
* Create bracket matches
* Auto-resolve A1, A2, B1, B2 Round Robin seeds
* Set match winners
* Manage announcements/news
* Manage gallery uploads
* View and delete contact messages
* Responsive admin sidebar and layout

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router DOM
* Axios

### Backend

* FastAPI
* MySQL
* Python
* JWT/Admin authentication
* Static file upload support

### Database

* MySQL

## Project Structure

```txt
monarchy-esports/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── dependencies/
│   │   ├── database.py
│   │   └── main.py
│   ├── uploads/
│   └── requirements.txt
│
└── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/monarchy-esports.git
cd monarchy-esports
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on:

```txt
http://localhost:5173
```

## Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend will run on:

```txt
http://127.0.0.1:8000
```

## Backend Requirements

Example `requirements.txt`:

```txt
fastapi
uvicorn
mysql-connector-python
python-multipart
python-jose
passlib
bcrypt
```

## MySQL Database Setup

1. Create a MySQL database:

```sql
CREATE DATABASE monarchy_esports;
```

2.Import the SQL table structure and dummy data if available.

3.Update backend database connection in:

```txt
backend/app/database.py
```

Example:

```python
import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="monarchy_esports"
    )
```

## API Base URL

Frontend API configuration is stored in:

```txt
frontend/src/services/api.js
```

Example:

```js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export default api;
```

## Static Uploads

Uploaded files are stored inside the backend uploads folder.

Backend serves uploads using:

```python
from fastapi.staticfiles import StaticFiles
import os

os.makedirs("uploads", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
```

Example uploaded file path:

```txt
uploads/tournaments/banner.png
```

Frontend displays it as:

```txt
http://127.0.0.1:8000/uploads/tournaments/banner.png
```

## Main Admin Routes

```txt
/admin/login
/admin/dashboard
/admin/tournaments
/admin/tournaments/create
/admin/registrations
/admin/news
/admin/gallery
/admin/messages
```

## Main Public Routes

```txt
/
/about
/tournaments
/tournament/:id
/register/:id
/news
/gallery
/contact
/rules
```

## Tournament Flow

1. Admin creates a tournament.
2. Players register teams.
3. Admin approves teams.
4. Admin creates Round Robin groups.
5. Admin adds approved teams to groups.
6. Admin updates group statistics.
7. System ranks teams using points, BP, and wins.
8. Admin creates bracket matches using seeds such as A1, A2, B1, B2.
9. Match winners are updated.
10. Public tournament page shows schedule, standings, and bracket results.

## Deployment Plan

Recommended deployment setup:

```txt
Frontend: Vercel or Netlify
Backend: Render or Railway
Database: Railway MySQL or Aiven MySQL
Domain: Cloudflare or Namecheap
```

Recommended domain setup:

```txt
www.monarchyesports.com  -> Frontend
api.monarchyesports.com  -> Backend
```

## Build Frontend

```bash
cd frontend
npm run build
```

## Backend Start Command for Hosting

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## Notes

* Do not commit secret keys or database passwords.
* Keep admin credentials private.
* Use environment variables for production database configuration.
* Uploaded files should use persistent storage in production.
* For production image hosting, Cloudinary or S3 can be used later.

## Project Status

The project includes completed public pages, admin management pages, responsive design, tournament creation, registration uploads, Round Robin standings, bracket management, image upload support, and protected admin routes.

## Author

Developed by Kavidu Wijenayaka for Monarchy Esports.
