# FinEdge : Transactions Module

## Overview
Member 2 is responsible for the **Transactions Module** — CRUD APIs, validation middleware, service layer with business logic, auto-categorization, filtering, and Jest test coverage.

---

## Project Setup

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### Install & Run
```bash
cd FinEdge
npm install
node src/server.js
```
Server starts at: `http://localhost:3000`

### Run Tests
```bash
npx jest --verbose
```

---

## Files Created by Member 2

| File | Purpose |
|------|---------|
| `src/models/transactionModel.js` | Mongoose schema — type, category, amount, description, date, userId |
| `src/modelHelpers/transactionModelHelper.js` | DB layer — CRUD + filtered queries (date/category/type) |
| `src/v1/services/transactionService.js` | Business logic — ownership checks, auto-categorization, re-categorization on update |
| `src/v1/controllers/transactionController.js` | HTTP request/response handlers for all 5 transaction endpoints |
| `src/middlewares/transactionValidation.js` | Validation middleware — create/update body + ObjectId format |
| `test/transactionCrud.test.js` | Integration tests — 27 tests for all CRUD endpoints |
| `test/transactionService.test.js` | Unit tests — 30 tests for service logic + auto-categorization |
| `test/transactionValidation.test.js` | Unit tests — 23 tests for validation middleware |

### Files Modified
| File | Change |
|------|--------|
| `src/v1/routes.js` | Added 5 transaction routes with JWT auth + validation middleware |
| `package.json` | Updated test script to use Jest |
| `jest.config.js` | Jest configuration for the project |

---

## API Endpoints

**Base URL:** `http://localhost:3000/api/v1`

All transaction endpoints require JWT authentication.
Add this header to every request:
```
Authorization: Bearer <your_jwt_token>
```

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/signup` | Register a new user |
| POST | `/users/login` | Login and get JWT token |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/transactions` | Create a new transaction |
| GET | `/transactions` | Get all transactions (supports filters) |
| GET | `/transactions/:id` | Get a single transaction |
| PATCH | `/transactions/:id` | Update a transaction (partial) |
| DELETE | `/transactions/:id` | Delete a transaction |

### Query Filters for GET /transactions

| Parameter | Type | Example |
|-----------|------|---------|
| `category` | string | `?category=food` |
| `type` | string | `?type=income` or `?type=expense` |
| `startDate` | date | `?startDate=2026-01-01` |
| `endDate` | date | `?endDate=2026-01-31` |

Filters can be combined: `?type=expense&category=food&startDate=2026-01-01`

---

## Auto-Categorization Keywords

When no `category` is provided (or `category: "auto"`), the system auto-assigns a category based on the `description`:

| Category | Keywords |
|----------|----------|
| food | restaurant, pizza, burger, coffee, cafe, lunch, dinner, breakfast, grocery, groceries, food, eat, meal, snack, bakery, swiggy, zomato |
| transport | uber, ola, cab, taxi, bus, train, metro, fuel, petrol, diesel, gas, parking, toll, flight, airline, travel |
| entertainment | movie, netflix, spotify, game, concert, theatre, theater, music, subscription, amazon prime, youtube, disney |
| shopping | amazon, flipkart, myntra, clothes, shoes, electronics, gadget, phone, laptop, mall, shop, purchase, buy |
| bills | electricity, electric, water, internet, wifi, phone bill, mobile bill, recharge, rent, emi, loan, insurance, tax |
| health | hospital, doctor, medicine, pharmacy, medical, gym, fitness, health, clinic, dental, eye |
| education | course, book, tuition, school, college, university, udemy, coursera, tutorial, class, exam, study |
| salary | salary, payroll, wages, stipend, bonus, incentive, commission |
| freelance | freelance, project, contract, consulting, gig, client payment |
| investment | dividend, interest, mutual fund, stock, investment, return, profit, fd, fixed deposit |
| other | (default when no keyword matches) |

---

## Postman Test Cases

### Step 0: Get JWT Token

#### TC-0a: Register User
```
POST http://localhost:3000/api/v1/users/signup
Content-Type: application/json

{
  "name": "Member Two",
  "email": "member2@finedge.com",
  "password": "Test@1234",
  "role": "user",
  "username": "member2"
}
```
✅ Expected: `201 Created` — Response includes `token`

#### TC-0b: Login User
```
POST http://localhost:3000/api/v1/users/login
Content-Type: application/json

{
  "username": "member2",
  "password": "Test@1234"
}
```
✅ Expected: `200 OK` — Response includes `token`

> **Copy the `token` and use it as Bearer Token for all requests below.**

---

### Step 1: POST /transactions — Create

#### TC-1: Create income transaction
```
POST http://localhost:3000/api/v1/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "income",
  "category": "salary",
  "amount": 50000,
  "description": "Monthly salary February",
  "date": "2026-02-01"
}
```
✅ Expected: `201 Created`

#### TC-2: Create expense transaction
```
POST http://localhost:3000/api/v1/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "expense",
  "category": "food",
  "amount": 350,
  "description": "Dinner at restaurant"
}
```
✅ Expected: `201 Created`

#### TC-3: Auto-categorize — Uber (no category)
```
POST http://localhost:3000/api/v1/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "expense",
  "amount": 800,
  "description": "Uber ride to airport"
}
```
✅ Expected: `201 Created` — category auto-set to `"transport"`

#### TC-4: Auto-categorize — Netflix
```
POST http://localhost:3000/api/v1/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "expense",
  "amount": 199,
  "description": "Netflix monthly subscription"
}
```
✅ Expected: `201 Created` — category auto-set to `"entertainment"`

#### TC-5: Auto-categorize — Grocery
```
POST http://localhost:3000/api/v1/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "expense",
  "amount": 1200,
  "description": "Weekly grocery shopping at store"
}
```
✅ Expected: `201 Created` — category auto-set to `"food"`

#### TC-6: Missing type (validation error)
```
POST http://localhost:3000/api/v1/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100
}
```
❌ Expected: `400 Bad Request` — `{"errors":["type is required"]}`

#### TC-7: Missing amount
```
POST http://localhost:3000/api/v1/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "income"
}
```
❌ Expected: `400 Bad Request` — `{"errors":["amount is required"]}`

#### TC-8: Negative amount
```
POST http://localhost:3000/api/v1/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "expense",
  "amount": -50,
  "category": "food"
}
```
❌ Expected: `400 Bad Request` — `{"errors":["amount must be greater than 0"]}`

#### TC-9: Invalid type
```
POST http://localhost:3000/api/v1/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "transfer",
  "amount": 100,
  "category": "other"
}
```
❌ Expected: `400 Bad Request` — `{"errors":["type must be either \"income\" or \"expense\""]}`

#### TC-10: No auth token
```
POST http://localhost:3000/api/v1/transactions
Content-Type: application/json

{
  "type": "income",
  "amount": 1000,
  "category": "salary"
}
```
❌ Expected: `401 Unauthorized` — `{"message":"Unauthorized"}`

---

### Step 2: GET /transactions — Fetch All

#### TC-11: Get all transactions
```
GET http://localhost:3000/api/v1/transactions
Authorization: Bearer <token>
```
✅ Expected: `200 OK` — Array of all transactions

#### TC-12: Filter by category
```
GET http://localhost:3000/api/v1/transactions?category=food
Authorization: Bearer <token>
```
✅ Expected: `200 OK` — Only food transactions

#### TC-13: Filter by type
```
GET http://localhost:3000/api/v1/transactions?type=income
Authorization: Bearer <token>
```
✅ Expected: `200 OK` — Only income transactions

#### TC-14: Filter by date range
```
GET http://localhost:3000/api/v1/transactions?startDate=2026-02-01&endDate=2026-02-28
Authorization: Bearer <token>
```
✅ Expected: `200 OK` — Transactions in Feb 2026

#### TC-15: Combined filters
```
GET http://localhost:3000/api/v1/transactions?type=expense&category=transport
Authorization: Bearer <token>
```
✅ Expected: `200 OK` — Only expense transactions in transport

#### TC-16: Without token
```
GET http://localhost:3000/api/v1/transactions
```
❌ Expected: `401 Unauthorized`

---

### Step 3: GET /transactions/:id — Fetch Single

> Replace `<_id>` with a real transaction `_id` from previous responses.

#### TC-17: Valid transaction ID
```
GET http://localhost:3000/api/v1/transactions/<_id>
Authorization: Bearer <token>
```
✅ Expected: `200 OK` — Single transaction object

#### TC-18: Non-existent ID
```
GET http://localhost:3000/api/v1/transactions/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```
❌ Expected: `404 Not Found` — `{"error":"Transaction not found"}`

#### TC-19: Invalid ID format
```
GET http://localhost:3000/api/v1/transactions/bad-id
Authorization: Bearer <token>
```
❌ Expected: `400 Bad Request` — `{"error":"Invalid transaction ID format"}`

---

### Step 4: PATCH /transactions/:id — Update

#### TC-20: Update amount
```
PATCH http://localhost:3000/api/v1/transactions/<_id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 600
}
```
✅ Expected: `200 OK` — Updated transaction

#### TC-21: Update description (triggers re-categorization)
```
PATCH http://localhost:3000/api/v1/transactions/<_id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Pizza delivery at home"
}
```
✅ Expected: `200 OK` — category auto-changes to `"food"`

#### TC-22: Update type
```
PATCH http://localhost:3000/api/v1/transactions/<_id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "income"
}
```
✅ Expected: `200 OK`

#### TC-23: Empty update body
```
PATCH http://localhost:3000/api/v1/transactions/<_id>
Authorization: Bearer <token>
Content-Type: application/json

{}
```
❌ Expected: `400 Bad Request` — `{"errors":["At least one field must be provided for update"]}`

#### TC-24: Invalid amount in update
```
PATCH http://localhost:3000/api/v1/transactions/<_id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": -10
}
```
❌ Expected: `400 Bad Request`

#### TC-25: Invalid ID format
```
PATCH http://localhost:3000/api/v1/transactions/invalid-id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100
}
```
❌ Expected: `400 Bad Request` — `{"error":"Invalid transaction ID format"}`

---

### Step 5: DELETE /transactions/:id — Delete

#### TC-26: Delete a transaction
```
DELETE http://localhost:3000/api/v1/transactions/<_id>
Authorization: Bearer <token>
```
✅ Expected: `200 OK` — `{"message":"Transaction deleted successfully"}`

#### TC-27: Delete same transaction again
```
DELETE http://localhost:3000/api/v1/transactions/<same_id>
Authorization: Bearer <token>
```
❌ Expected: `404 Not Found` — `{"error":"Transaction not found"}`

#### TC-28: Invalid ID format
```
DELETE http://localhost:3000/api/v1/transactions/not-valid
Authorization: Bearer <token>
```
❌ Expected: `400 Bad Request` — `{"error":"Invalid transaction ID format"}`

#### TC-29: Without auth token
```
DELETE http://localhost:3000/api/v1/transactions/<_id>
```
❌ Expected: `401 Unauthorized`

---

## Test Case Summary

| Group | Test Cases | Count |
|-------|-----------|-------|
| Auth (setup) | TC-0a, TC-0b | 2 |
| POST /transactions | TC-1 to TC-10 | 10 |
| GET /transactions | TC-11 to TC-16 | 6 |
| GET /transactions/:id | TC-17 to TC-19 | 3 |
| PATCH /transactions/:id | TC-20 to TC-25 | 6 |
| DELETE /transactions/:id | TC-26 to TC-29 | 4 |
| **Total** | | **31** |

---

## Jest Test Results (80 tests — all passing)

| Test File | Tests | Description |
|-----------|-------|-------------|
| `test/transactionValidation.test.js` | 23 | Create/Update validation + ObjectId validation |
| `test/transactionService.test.js` | 30 | Auto-categorize (10 categories), CRUD logic, ownership checks |
| `test/transactionCrud.test.js` | 27 | Full API integration with supertest, auth, error codes |

Run tests:
```bash
npx jest --testPathPatterns="transaction" --verbose
```

---

## Transaction Schema

```javascript
{
  userId:      ObjectId (ref: User, required),
  type:        String   (enum: ['income', 'expense'], required),
  category:    String   (required, auto-assigned if not provided),
  amount:      Number   (required, min: 0.01),
  description: String   (optional, default: ''),
  date:        Date     (default: Date.now),
  createdAt:   Date     (auto by Mongoose timestamps),
  updatedAt:   Date     (auto by Mongoose timestamps)
}
```

---

## Bonus Features Implemented

### 1. Auto-Categorization
- 10 categories with keyword-based matching
- Works on create and on update (when description changes)
- Set `category: "auto"` or omit category to trigger

### 2. Transaction Filtering
- Filter by `category`, `type`, `startDate`, `endDate`
- All filters are optional and can be combined
- Case-insensitive category matching
