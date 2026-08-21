# 🤖 Virtual Assistant

A full-stack AI-powered virtual assistant built with **React.js, Node.js, Express.js, MongoDB, and Google Gemini API**.

The application provides a voice-enabled assistant that understands natural-language commands, generates AI responses, performs supported actions, and allows users to personalize their assistant.

## 🌐 Live Demo

- **Frontend:** https://virtual-assistant-rose.vercel.app
- **Backend:** https://virtualassistant-jh8x.onrender.com
- **GitHub:** https://github.com/Aryabardhansinghchauhan/VirtualAssistant

---

## ✨ Features

- 🤖 Google Gemini-powered AI responses
- 🎤 Speech-to-text voice recognition
- 🔊 Text-to-speech assistant responses
- 🔐 User registration and login
- 🍪 JWT authentication with HTTP-only cookies
- 👤 Personalized user experience
- 🧑‍💻 Custom assistant name
- 🖼️ Custom assistant image
- ☁️ Cloudinary image uploads
- 🗄️ MongoDB Atlas database
- 📝 User command/history storage
- 🔎 Google search commands
- ▶️ YouTube search and play commands
- 🕐 Current time
- 📅 Current date
- 📆 Current day
- 🗓️ Current month
- 🧮 Calculator
- 📷 Instagram
- 📘 Facebook
- 🌦️ Weather commands

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- Axios
- React Context API
- CSS
- Web Speech API

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Cookie Parser
- CORS
- Multer
- Cloudinary
- Axios
- Moment.js

### AI

- Google Gemini API

### Deployment

- Vercel — Frontend
- Render — Backend
- MongoDB Atlas — Database
- Cloudinary — Image Storage

---

## 📁 Project Structure

```text
VirtualAssistant/
│
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   └── token.js
│   │
│   ├── controllers/
│   │   ├── auth.controllers.js
│   │   └── user.controllers.js
│   │
│   ├── middlewares/
│   │   ├── isAuth.js
│   │   └── multer.js
│   │
│   ├── models/
│   │   └── user.model.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── user.routes.js
│   │
│   ├── gemini.js
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   │   └── UserContext.jsx
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md



🚀 Getting Started
Prerequisites

Make sure you have installed:

Node.js
npm
MongoDB Atlas account
Google Gemini API key
Cloudinary account



1. Clone the Repository
git clone https://github.com/Aryabardhansinghchauhan/VirtualAssistant.git
cd VirtualAssistant


⚙️ Backend Setup

Go to the backend directory:

cd backend

Install dependencies:

npm install

Create a .env file inside the backend directory:

PORT=5000

MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_URL=your_gemini_api_url
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

Start the backend:

npm start
For development:
npm run dev
Backend will run on:
http://localhost:5000


🎨 Frontend Setup
Open another terminal:

cd frontend
Install dependencies:

npm install
Start the development server:

npm run dev
Frontend will normally run on:
http://localhost:5173


🔗 API Endpoints
Authentication

| Method | Endpoint           | Description         |
| ------ | ------------------ | ------------------- |
| POST   | `/api/auth/signup` | Register a new user |
| POST   | `/api/auth/login`  | Login user          |
| GET    | `/api/auth/logout` | Logout user         |

| Method | Endpoint                   | Description                    |
| ------ | -------------------------- | ------------------------------ |
| GET    | `/api/user/current`        | Get current authenticated user |
| POST   | `/api/user/update`         | Update assistant details       |
| POST   | `/api/user/asktoassistant` | Send command to AI assistant   |


🎤 Voice Assistant Flow
User speaks
     ↓
Speech Recognition
     ↓
Speech converted to text
     ↓
Frontend sends command to Backend
     ↓
Backend authenticates user
     ↓
Backend sends command to Gemini
     ↓
Gemini returns structured response
     ↓
Backend processes response
     ↓
Frontend receives response
     ↓
Text-to-Speech
     ↓
Assistant speaks


🌍 Deployment
Frontend

The frontend is deployed on Vercel:

https://virtual-assistant-rose.vercel.app

Backend

The backend is deployed on Render:

https://virtualassistant-jh8x.onrender.com

Database

MongoDB Atlas is used as the production database.

Image Storage

Cloudinary is used for image storage.



400 Error from /api/user/asktoassistant

The /api/user/asktoassistant endpoint is protected by JWT authentication.

Check that:

The user is logged in.
The authentication cookie exists.
Axios uses withCredentials: true.
Backend CORS allows the frontend.
JWT_SECRET is configured correctly.
The frontend uses the correct backend URL.

Example:
axios.post(
  `${serverUrl}/api/user/asktoassistant`,
  { command },
  {
    withCredentials: true
  }
);

🍪 Production Authentication Cookies

Because the frontend and backend are deployed on different domains, production authentication cookies need cross-site configuration.

Example:
res.cookie("token", token, {
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  secure: true
});
For local development:
res.cookie("token", token, {
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  sameSite: "strict",
  secure: false
});

🔄 Git Workflow

After making changes:

git status

Add changes:

git add .

Commit:

git commit -m "Update project"

Push:

git push origin main

Your deployment services can then build the latest version from GitHub.

👨‍💻 Author
Arya Chauhan

GitHub:

https://github.com/Aryabardhansinghchauhan

Repository:

https://github.com/Aryabardhansinghchauhan/VirtualAssistant


⭐ Support
If you like this project, consider giving the repository a ⭐ on GitHub.
