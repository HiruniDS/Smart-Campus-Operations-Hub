# Smart Campus Operations Hub

## 📌 Project Overview
Smart Campus Operations Hub is a full-stack web application designed to manage university facilities, bookings, and incident handling in a centralized platform.

---

## 🛠️ Technology Stack
### Backend
- Java Spring Boot (REST API)
- Spring Security (OAuth2)
- JPA / Hibernate
- MySQL / PostgreSQL

### Frontend
- React.js
- Axios
- Tailwind CSS / Bootstrap

### DevOps
- GitHub
- GitHub Actions (CI/CD)

---

## 🔑 Core Modules
### Facilities & Assets
- Manage rooms, labs, and equipment
- Search and filter resources

### Booking Management
- Request bookings
- Approval workflow (PENDING → APPROVED/REJECTED)
- Conflict detection

### Incident & Maintenance
- Create incident tickets
- Upload up to 3 image attachments
- Assign technicians
- Update ticket status:
  - OPEN → IN_PROGRESS → RESOLVED → CLOSED
- Add comments and resolution notes

### Notifications
- Booking updates
- Ticket status changes
- Comment alerts

### Authentication & Authorization
- Google OAuth 2.0 login
- Role-based access (USER, ADMIN, TECHNICIAN)

---

## ⚙️ Setup Instructions

### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 🔗 Sample API Endpoints
| Method | Endpoint | Description |
|--------|----------|------------|
| POST   | /api/tickets | Create ticket |
| GET    | /api/tickets | Get all tickets |
| PUT    | /api/tickets/{id} | Update ticket |
| DELETE | /api/tickets/{id} | Delete ticket |

---

## 🧪 Testing
- Postman collections can be used
- Includes validation and error handling

---

## 📸 Features Demonstration
- Ticket creation
- Image upload (max 3 files)
- Status updates
- Technician assignment

---

## 📂 Project Structure
backend/
frontend/
docs/

---

## 📜 Notes
- Follows RESTful API design
- Uses layered architecture
- Implements validation and security

---

## 📄 License
This project is for academic purposes only.
