import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function InterviewPage({ domain }) {
  const [question, setQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState('');
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    // Fetch question
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(`https://silver-space-enigma-pjprqq57wwp5h6qgg-5000.app.github.dev/api/questions/${domain}`);
        setQuestion(response.data.question);
      } catch (err) {
        console.error('Error fetching question:', err.message);
        setQuestion('Error loading question');
      }
    };
    fetchQuestion();

    // Start webcam
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('Error accessing webcam:', err.message);
      });

    // Cleanup
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [domain]);

  const startRecording = () => {
    setIsRecording(true);
    if (streamRef.current) {
      mediaRecorderRef.current = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      mediaRecorderRef.current.onstop = async () => {
        console.log('Recording stopped, creating blob');
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        console.log('Blob created, size:', blob.size);
        if (blob.size === 0) {
          console.log('Empty blob detected');
          setFeedback('Error: No video data recorded');
          console.log('Feedback set to: Error: No video data recorded');
          chunksRef.current = [];
          return;
        }
        const formData = new FormData();
        formData.append('video', blob, 'response.webm');
        try {
          console.log('Sending POST to /api/evaluate');
          const response = await axios.post(`https://silver-space-enigma-pjprqq57wwp5h6qgg-5000.app.github.dev/api/evaluate`, formData);
          console.log('Response received:', response.data);
          setFeedback(response.data.feedback);
          console.log('Feedback set to:', response.data.feedback);
        } catch (err) {
          console.error('Error posting video:', err.message);
          setFeedback('Error evaluating response');
          console.log('Feedback set to: Error evaluating response');
        }
        chunksRef.current = [];
      };
      mediaRecorderRef.current.start();
    } else {
      console.error('No stream available for recording');
      setFeedback('Error: Webcam not initialized');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    console.log('Stop recording called');
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
          disabled={!streamRef.current && !isRecording}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        <button
          onClick={() => {
            setFeedback('Test feedback');
            console.log('Test feedback set');
          }}
          className="bg-gray-500 text-white p-2 rounded ml-2"
        >
          Test Feedback
        </button>
      </div>
      {feedback && (
        <p key={feedback} className="text-green-500" style={{ minHeight: '1.5em' }}>
          {feedback}
        </p>
      )}
    </div>
  );
}

export default InterviewPage;