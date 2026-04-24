# Smart Campus Operations Hub

Production-quality multi-module backend for a university assignment using:
- **Backend:** Spring Boot 3.5.14, Java 25 (LTS), MongoDB Atlas
- **Frontend:** React (Hooks), Axios, Vite
- **Security:** Role-based HTTP Basic Auth (`USER`, `ADMIN`, `TECHNICIAN`)
- **Modules:** Module C — Incident & Maintenance Ticketing *(booking module stub ready)*

## Folder Structure

```text
Smart Campus Operations Hub/
├── backend/
│   ├── pom.xml
│   ├── src/main/resources/
│   │   └── application.properties
│   └── src/main/java/com/smartcampus/operationshub/
│       ├── SmartCampusOperationsHubApplication.java   ← root entry point
│       ├── booking/
│       │   └── package-info.java                      ← booking module stub
│       └── ticketing/                                 ← Module C
│           ├── SmartCampusTicketingApplication.java   ← legacy marker (no @SpringBootApplication)
│           ├── config/
│           │   └── SecurityConfig.java
│           ├── controller/
│           │   └── TicketController.java
│           ├── dto/
│           │   ├── AssignTechnicianRequest.java
│           │   ├── AttachmentResponse.java
│           │   ├── CommentCreateRequest.java
│           │   ├── CommentResponse.java
│           │   ├── TicketCreateRequest.java
│           │   ├── TicketResponse.java
│           │   ├── TicketUpdateRequest.java
│           │   └── UpdateStatusRequest.java
│           ├── entity/
│           │   ├── Attachment.java
│           │   ├── Comment.java
│           │   ├── Ticket.java
│           │   ├── TicketCategory.java
│           │   ├── TicketPriority.java
│           │   └── TicketStatus.java
│           ├── exception/
│           │   ├── BadRequestException.java
│           │   ├── ForbiddenException.java
│           │   ├── GlobalExceptionHandler.java
│           │   └── ResourceNotFoundException.java
│           ├── repository/
│           │   └── TicketRepository.java
│           └── service/
│               ├── TicketService.java
│               └── impl/TicketServiceImpl.java
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── styles.css
        ├── api/
        │   ├── client.js
        │   └── ticketApi.js
        ├── components/
        │   ├── Navbar.jsx
        │   └── TicketForm.jsx
        ├── context/
        │   └── AuthContext.jsx
        └── pages/
            ├── CreateTicketPage.jsx
            ├── TicketDetailsPage.jsx
            └── TicketListPage.jsx
```

## Backend Features Delivered

- Layered architecture: Controller -> Service -> Repository
- Entities: `Ticket`, `Attachment`, `Comment`
- Relationships:
  - `Ticket` one-to-many `Comment`
  - `Ticket` one-to-many `Attachment`
  - `Comment` many-to-one `Ticket`
  - `Attachment` many-to-one `Ticket`
- DTO pattern for request/response payloads
- Validation via annotations (`@NotBlank`, `@NotNull`, `@Size`)
- Global error handling (`@RestControllerAdvice`)
- Status workflow enforced in service:
  - `OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED`
  - Rejection path from `OPEN/IN_PROGRESS -> REJECTED`
- Attachment upload to local folder (`app.upload.dir=uploads`)
- Max 3 image attachments per ticket enforced
- Role-based endpoint access with Spring Security

## REST API Endpoints

Base URL: `http://localhost:8080/api`

- `POST /tickets` - create ticket
- `GET /tickets` - get tickets (filters: `status`, `priority`)
- `GET /tickets/{id}` - get one ticket
- `PUT /tickets/{id}` - update ticket
- `DELETE /tickets/{id}` - delete ticket
- `POST /tickets/{id}/assign` - assign technician
- `POST /tickets/{id}/status` - update status
- `POST /tickets/{id}/comments` - add comment
- `POST /tickets/{id}/attachments` - upload up to 3 images

## Role Access Rules

- `USER`
  - Create tickets
  - View only own tickets
  - Update/delete only own tickets
  - Add comments/attachments to own tickets
- `ADMIN`
  - View all tickets
  - Assign technicians
  - Update statuses
  - Full CRUD on tickets
- `TECHNICIAN`
  - View only assigned tickets
  - Update status of assigned tickets
  - Add comments/attachments on assigned tickets

## Demo Credentials (HTTP Basic Auth)

- USER: `student1` / `password123`
- ADMIN: `admin1` / `password123`
- TECHNICIAN: `tech1` / `password123`
- TECHNICIAN: `tech2` / `password123`

## Sample API Responses

### 1) Create Ticket - `POST /api/tickets`

Request body:

```json
{
  "title": "Projector not working in Lecture Hall A",
  "description": "The projector flickers and shuts down after 10 minutes.",
  "category": "MAINTENANCE",
  "priority": "HIGH"
}
```

Response (`201 Created`):

```json
{
  "id": 1,
  "title": "Projector not working in Lecture Hall A",
  "description": "The projector flickers and shuts down after 10 minutes.",
  "category": "MAINTENANCE",
  "priority": "HIGH",
  "status": "OPEN",
  "createdBy": "student1",
  "assignedTo": null,
  "createdAt": "2026-04-12T12:30:45",
  "comments": [],
  "attachments": []
}
```

### 2) Assign Technician - `POST /api/tickets/1/assign`

Request:

```json
{
  "technicianUsername": "tech1"
}
```

Response (`200 OK`):

```json
{
  "id": 1,
  "status": "IN_PROGRESS",
  "assignedTo": "tech1"
}
```

### 3) Validation Error Example

Response (`400 Bad Request`):

```json
{
  "timestamp": "2026-04-12T12:35:02.200",
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "title": "Title is required"
  }
}
```

## Frontend Features Delivered

- Create Ticket page with form validation
- Ticket List page with status/priority filters
- Ticket Details page with:
  - assignment (admin only)
  - status updates (admin/technician)
  - comments
  - attachment upload (max 3)
- Axios API layer
- Hook-based state management
- Structured responsive UI

## How to Run

### 1) Start MongoDB

Ensure the MongoDB Atlas connection string in `backend/src/main/resources/application.properties` is correct for your cluster and credentials.

### 2) Run Backend

Requires **Java 25** and **Maven 3.9+**.

```bash
cd backend
mvn spring-boot:run
```

Backend runs at `http://localhost:8080`.

### 3) Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Notes

- Build verified clean with Java 25 and Spring Boot 3.5.14 (`mvn clean test-compile` exits 0).
- Uploaded files are saved in backend local `uploads/` directory.
- The `booking` package (`com.smartcampus.operationshub.booking`) is a ready stub for the next module. Add controllers, services, entities and repositories there — they will be auto-discovered by the root `@SpringBootApplication`.
- Spring Security uses in-memory users for demo purposes. Replace with a persistent `UserDetailsService` for production.
