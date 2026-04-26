<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CLI Auth Project

This project is organized into a frontend (React/Vite) and a backend (Express).

## Project Structure

- `frontend/`: React application built with Vite.
- `backend/`: Express server with TypeScript.

## Run Locally

**Prerequisites:** Node.js

1.  **Install dependencies** (from the root directory):
    ```bash
    npm install
    ```

2.  **Run the application**:
    - To run both frontend and backend:
      ```bash
      npm run dev
      ```
    - To run only frontend:
      ```bash
      npm run dev:frontend
      ```
    - To run only backend:
      ```bash
      npm run dev:backend
      ```

3.  **Environment Variables**:
    - Update `.env` files in each directory as needed (see `.env.example` in `frontend/`).

## Test Credentials

You can use the following pre-seeded accounts to test local login:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@smartcampus.edu` | `password` |
| **Technician** | `tech@smartcampus.edu` | `password` |
| **User** | `user@smartcampus.edu` | `password` |

Alternatively, use the **Create Profile** link on the login page to register a new account with your choice of role.
