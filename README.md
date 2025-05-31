
# 🤖 AI Interview App

A web-based AI-powered interview application that allows users to log in with Google or email/phone, select a domain, and give video-based interviews. The app uses the [LinkedIn Skill Assessments Dataset](https://github.com/Ebazhanov/linkedin-skill-assessments-quizzes) for questions and evaluates responses using a TensorFlow.js model.

---

## 🛠️ Setup

### Clone the Repository

```bash
git clone https://github.com/YourUsername/AI-Interview-App.git
cd AI-Interview-App
```

### Install Dependencies

**Frontend:**

```bash
cd frontend
npm install
```

**Backend:**

```bash
cd backend
npm install express passport passport-google-oauth20 axios cors @tensorflow/tfjs-node
```

---

## ⚙️ Configure Google OAuth

- Go to [Google Cloud Console](https://console.cloud.google.com/).
- Create a new project.
- Enable **OAuth 2.0 Client IDs** under **APIs & Services > Credentials**.
- Get your `clientID` and `clientSecret`.
- Update them in `backend/server.js`.

---

## ▶️ Run the App

**Start Backend Server:**

```bash
cd backend
node server.js
```

**Start Frontend:**

```bash
cd frontend
npm start
```

---

## 🧠 Train the Model

To train the AI evaluation model:

```bash
cd backend
node model/train.js
```

---

## 🚀 Usage

- Visit [http://localhost:3000](http://localhost:3000)
- Log in using Google or email/phone
- Choose a domain like **JavaScript**, **Python**, etc.
- Answer questions via video
- Receive **AI-generated feedback** with:
  - Relevance score
  - Correctness score
  - Suggested improvements

---

## 📦 Dataset

We use the open-source [LinkedIn Skill Assessments Dataset](https://github.com/Ebazhanov/linkedin-skill-assessments-quizzes) which contains hundreds of domain-specific technical questions and answers across fields like:

- Python
- JavaScript
- C++
- Java
- SQL
- Data Science
- Web Development
- And more...

---

## 📌 Notes

- The TensorFlow.js model is basic and can be improved by integrating advanced NLP models like BERT or Sentence Transformers.
- Current scoring is based on semantic similarity and keyword overlap. You can enhance with transformers and fine-tuned scoring logic.
- This is a modular app using **React** for frontend and **Node.js + Express** for backend.
- Authentication and evaluation are currently mocked — can be extended for production with secure user auth, real-time ML inference, and session tracking.

---

## 💡 Future Enhancements

- Audio + Video input analysis (emotion, speech pace)
- Real-time transcription and response ranking
- Integration with LangChain or OpenAI APIs
- Deployment to Vercel / Render / Firebase

---

## 👥 Contributors

- Prince Verma(https://github.com/PrinceV-hub)

---

## 🔗 License

MIT License
