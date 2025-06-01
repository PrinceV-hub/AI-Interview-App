# AI Interview App

A web application for practicing technical interviews with AI-generated questions and mock feedback.

---

## 🚀 Setup

### 🔧 Backend:

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start the backend server
node server.js
```

> Runs on port **5000**.

---

### 🎨 Frontend:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the frontend server
npm start
```

> Runs on port **3000**.

---

### 🧠 Train Model:

```bash
# Inside backend
node model/train.js
```

---

## ⚠️ Notes

- Replace `https://<your-codespace-name>-5000.app.github.dev` in `LoginPage.jsx` and `InterviewPage.jsx` with your **Codespaces backend URL**.
- Webcam access may not work in Codespaces; test locally.
- `users.json` is insecure — for production, use a proper database.
