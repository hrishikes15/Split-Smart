# Project Interview Preparation Guide

## 1. Project Overview

- **Name:** Split Smart (Expense Splitting App)
- **Stack:**
  - Backend: Node.js, Express, MongoDB (Mongoose), JWT Auth
  - Frontend: React, TypeScript, Vite, Tailwind CSS
- **Purpose:** Simplifies group expense tracking, splitting, and settlements.

## 2. Key Features

- User authentication (register, login, JWT-based sessions)
- Group creation, management, and deletion
- Adding, editing, and deleting expenses within groups
- Automatic calculation of settlements
- Secure API endpoints with role-based access
- Responsive, modern UI with protected routes

## 3. Backend Walkthrough

### a. Structure

- **Controllers:** Handle HTTP requests, call services
- **Services:** Business logic (e.g., deleting a group and related data)
- **Models:** Mongoose schemas for User, Group, Expense
- **Routes:** Define API endpoints
- **Middleware:** Auth checks, error handling
- **Utils:** Helper functions (e.g., JWT token generation)

### b. Important Points

- **Data Integrity:** When deleting a group, all related expenses and references are also deleted.
- **Authorization:** Only group owners can delete groups; JWT required for protected routes.
- **Validation:** Input validation for all endpoints.
- **Error Handling:** Centralized error middleware for consistent responses.
- **No Transactions:** Fallback logic for MongoDB standalone (no replica set).

### c. Common Interview Questions

- How do you ensure data consistency when deleting a group?
- How is authentication and authorization handled?
- How do you structure controllers vs. services?
- How do you handle errors and validation?
- Why did you avoid Mongoose transactions?
- How do you secure sensitive endpoints?

## 4. Frontend Walkthrough

### a. Structure

- **Pages:** Dashboard, Groups, Expenses, Settlements, Auth
- **Components:** UI elements (buttons, dialogs, cards, etc.)
- **Context:** AuthContext for global user state
- **API Layer:** Axios instance for backend communication

### b. Important Points

- **Protected Routes:** Only authenticated users can access certain pages
- **Conditional Rendering:** Delete button only for group owners
- **Confirmation Modals:** Prevent accidental destructive actions
- **State Management:** Context API for auth, local state for UI
- **Error/Success Feedback:** Toasts or modals for user feedback

### c. Common Interview Questions

- How do you manage authentication state on the frontend?
- How do you protect routes?
- How do you handle API errors?
- How do you ensure only group owners see the delete button?
- How do you structure reusable UI components?

## 5. End-to-End Flow Example

1. User logs in (JWT issued, stored in localStorage/cookie)
2. User creates a group (POST /groups)
3. User adds expenses to the group (POST /expenses)
4. User deletes a group (DELETE /groups/:id)
   - Backend deletes group, related expenses, and user references
   - Frontend updates UI, shows confirmation

## 6. Security & Best Practices

- Use HTTPS in production
- Sanitize all user inputs
- Store secrets in environment variables
- Use CORS properly
- Limit API rate to prevent abuse

## 7. Testing

- Backend: Unit and integration tests for controllers/services
- Frontend: Component and E2E tests
- Manual testing for critical flows (group deletion, settlements)

## 8. Potential Improvements

- Add notifications for group changes
- Archive instead of delete groups
- Add user roles (admin, member)
- Improve error messages and logging

## 9. Questions You Might Be Asked

- Explain the group deletion flow in detail.
- How do you handle race conditions or concurrent requests?
- How would you scale this app for more users?
- What would you change if you had more time?
- How do you handle frontend-backend integration?
- How do you debug issues in production?

## 10. Tips for Interview

- Be ready to whiteboard the group deletion logic.
- Emphasize security and data integrity.
- Show understanding of both backend and frontend flows.
- Mention trade-offs (e.g., no transactions on standalone MongoDB).
- Be honest about limitations and how you’d improve them.

---

**Good luck! Review this document, walk through your code, and practice explaining your design decisions.**
