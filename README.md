# News Aggregator Application

## Description
This is a News Aggregator backend application built using Node.js and Express.  
It fetches news articles from a third-party News API and provides secure APIs for users to view aggregated news.  
User authentication is implemented using JWT.

---

## Features
- User Signup
- User Login
- JWT-based Authentication
- Fetch news from third-party API
- Search news by keyword
- Filter news by category
- Versioned API structure (v1)
- Environment variable configuration using `.env`

---

## Project Structure
.
├── src
│ ├── config
│ ├── middlewares
│ ├── modelHelpers
│ ├── models
│ ├── routes
│ ├── v1
│ │ ├── controllers
│ │ ├── services
│ │ └── routes.js
│ ├── app.js
│ └── server.js
├── test
├── .env
├── package.json
└── README.md

yaml
Copy code

---

## API Routes

### User Routes
- POST `/users/signup` – Register a new user
- POST `/users/login` – Login user and receive JWT token

### News Routes
- GET `/news` – Fetch aggregated news (JWT protected)

---

## Authentication
- JWT is required to access protected routes
- Pass token in request header:
Authorization: Bearer <JWT_TOKEN>

yaml
Copy code

---

## Environment Variables
Create a `.env` file in the root directory:

PORT=3000
JWT_SECRET=your_jwt_secret
NEWS_API_KEY=your_news_api_key

yaml
Copy code

---

## How to Run
npm install
npm start

nginx
Copy code

Server runs on:
http://localhost:8080

yaml
Copy code

---

## Tech Stack
- Node.js
- Express.js
- JWT
- Third-party News API
- dotenv
