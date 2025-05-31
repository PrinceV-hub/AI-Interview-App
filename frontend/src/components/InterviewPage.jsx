import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import axios from 'axios';

function InterviewPage({ user, domain }) {
  const [question, setQuestion] = useState('');
  const [recording, setRecording] = useState(false);
  const [feedback, setFeedback] = useState('');
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    // Fetch question based on domain
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/questions/${domain}`);
        setQuestion(response.data.question);
      } catch (err) {
        console.error('Error fetching question:', err);
      }
    };
    fetchQuestion();

    // Setup video stream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            const formData = new FormData();
            formData.append('video', event.data);
            try {
              const response = await axios.post('http://localhost:5000/api/evaluate', formData);
              setFeedback(response.data.feedback);
            } catch (err) {
              console.error('Error evaluating response:', err);
            }
          }
        };
      })
      .catch((err) => console.error('Error accessing media devices:', err));

    // Load TensorFlow.js model
    async function loadModel() {
      const model = await tf.loadLayersModel('http://localhost:5000/model/model.json');
      console.log('Model loaded');
    }
    loadModel();
  }, [domain]);

  const startRecording = () => {
    setRecording(true);
    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current.stop();
  };

  return (
    <div className="bg-white p-8 rounded shadow-md w-full max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">Interview: {domain}</h2>
      <p className="mb-4">{question}</p>
      <video ref={videoRef} autoPlay className="w-full h-64 mb-4"></video>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={startRecording}
          disabled={recording}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          Start Recording
        </button>
        <button
          onClick={stopRecording}
          disabled={!recording}
          className="bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:bg-gray-400"
        >
          Stop Recording
        </button>
      </div>
      {feedback && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="text-lg font-bold">Feedback</h3>
          <p>{feedback}</p>
        </div>
      )}
    </div>
  );
}

export default InterviewPage;
