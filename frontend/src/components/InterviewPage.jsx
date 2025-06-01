import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function InterviewPage({ domain }) {
  const [question, setQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState('');
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    // Fetch question
    const fetchQuestion = async () => {
      try {
        // Replace with your Codespaces backend URL
        const response = await axios.get(`https://<your-codespace-name>-5000.app.github.dev/api/questions/${domain}`);
        setQuestion(response.data.question);
      } catch (err) {
        setQuestion('Error loading question');
      }
    };
    fetchQuestion();

    // Start webcam
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('Error accessing webcam:', err);
      });

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [domain]);

  const startRecording = () => {
    setIsRecording(true);
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (e) => {
          chunksRef.current.push(e.data);
        };
        mediaRecorderRef.current.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const formData = new FormData();
          formData.append('video', blob, 'response.webm');
          try {
            // Replace with your Codespaces backend URL
            const response = await axios.post(`https://<your-codespace-name>-5000.app.github.dev/api/evaluate`, formData);
            setFeedback(response.data.feedback);
          } catch (err) {
            setFeedback('Error evaluating response');
          }
          chunksRef.current = [];
        };
        mediaRecorderRef.current.start();
      });
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="bg-white p-8 rounded shadow-md w-full max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">Interview: {domain}</h2>
      <p className="mb-4">{question}</p>
      <div className="mb-4">
        <video ref={videoRef} autoPlay muted className="w-full rounded" />
      </div>
      <div className="mb-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>
      {feedback && <p className="text-green-500">{feedback}</p>}
    </div>
  );
}

export default InterviewPage;
