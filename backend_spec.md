# SplitSmart Backend Requirements

## Core idea:
- Users create groups and add shared expenses
- Each expense can be split equally or custom
- System calculates net balances for each user
- System minimizes number of transactions using a greedy algorithm

## Tech stack:
- Node.js
- Express
- MongoDB (Mongoose)

## 1. Folder Structure:
- models
- controllers
- services
- routes
- middleware
- utils

## 2. Data Models:
**User:**
- name
- email (unique)
- password (hashed)

**Group:**
- name
- owner
- members (array of users)

**Expense:**
- groupId
- title
- amount
- paidBy (user)
- splitType (equal, custom_amount, custom_percentage)
- splits [{ user, amount }]
- createdAt
- deletedAt (soft delete)

## 3. Features:

**Authentication:**
- register
- login (JWT)

**Group Management:**
- create group
- add/remove members
- get group details

**Expense Management:**
- add expense
- update expense
- delete expense (soft delete)

## 4. Core Logic:

**Balance Calculation:**
- Net Balance = total paid − total owed
- Positive → user should receive
- Negative → user owes

**Settlement Algorithm:**
- Separate creditors and debtors
- Sort by amount
- Match largest debtor with largest creditor
- Generate minimal transactions
- Continue until all balances are settled

## 5. Edge Cases:
- uneven splits
- floating point issues → use integers (paise/cents)
- zero balance users
- self payments
- invalid split sums

## 6. APIs:
- /auth/register
- /auth/login
- /groups
- /groups/:id
- /groups/:id/expenses
- /groups/:id/balances
- /groups/:id/settlements

## 7. Code Quality:
- clean separation of controller and service logic
- reusable utility functions
- proper error handling
