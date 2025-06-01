import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function InterviewPage({ domain }) {
  const [question, setQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState({ normal: '', enhanced: '', score: '', transcription: '' });
  const [transcription, setTranscription] = useState('');
  const [feedbackKey, setFeedbackKey] = useState(0);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(`https://silver-space-enigma-pjprqq57wwp5h6qgg-5000.app.github.dev/api/questions/${domain}`);
        setQuestion(response.data.question);
        setCorrectAnswer(response.data.correctAnswer || '');
      } catch (err) {
        console.error('Error fetching question:', err.message);
        setQuestion('Error loading question');
      }
    };
    fetchQuestion();

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

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [domain]);

  const startRecording = () => {
    setIsRecording(true);
    setTranscription('');
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
          setFeedback({ normal: 'Error: No video data recorded', enhanced: '', score: '', transcription: '' });
          setFeedbackKey(prev => prev + 1);
          chunksRef.current = [];
          return;
        }
        const formData = new FormData();
        formData.append('video', blob, 'response.webm');
        formData.append('question', question);
        formData.append('correctAnswer', correctAnswer);
        formData.append('transcription', transcription || 'No transcription available'); // Send browser transcription
        try {
          console.log('Sending POST to /api/evaluate');
          const response = await axios.post(`https://silver-space-enigma-pjprqq57wwp5h6qgg-5000.app.github.dev/api/evaluate`, formData);
          console.log('Response received:', response.data);
          setFeedback({
            normal: response.data.normalFeedback || 'No normal feedback',
            enhanced: response.data.enhancedFeedback || '',
            score: response.data.similarityScore || '',
            transcription: response.data.transcription || transcription
          });
          setFeedbackKey(prev => prev + 1);
          console.log('Feedback set to:', response.data);
        } catch (err) {
          console.error('Error posting video:', err.message);
          setFeedback({ normal: 'Error evaluating response', enhanced: '', score: '', transcription: transcription || 'Error transcribing audio' });
          setFeedbackKey(prev => prev + 1);
          console.log('Feedback set to: Error evaluating response');
        }
        chunksRef.current = [];
      };
      mediaRecorderRef.current.start();

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        speechRecognitionRef.current = new SpeechRecognition();
        speechRecognitionRef.current.continuous = true;
        speechRecognitionRef.current.interimResults = true;
        speechRecognitionRef.current.lang = 'en-US';
        speechRecognitionRef.current.onresult = (event) => {
          let interim = '';
          let final = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript + ' ';
            } else {
              interim += event.results[i][0].transcript + ' ';
            }
          }
          setTranscription(final + interim);
        };
        speechRecognitionRef.current.start();
      } else {
        console.log('SpeechRecognition not supported');
        setTranscription('Speech recognition not available in this browser');
      }
    } else {
      console.error('No stream available for recording');
      setFeedback({ normal: 'Error: Webcam not initialized', enhanced: '', score: '', transcription: '' });
      setFeedbackKey(prev => prev + 1);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    console.log('Stop recording called');
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
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
            setFeedback({ normal: 'Test normal feedback', enhanced: 'Test enhanced feedback', score: '80', transcription: 'Test transcription' });
            setFeedbackKey(prev => prev + 1);
            console.log('Test feedback set');
          }}
          className="bg-gray-500 text-white p-2 rounded ml-2"
        >
          Test Feedback
        </button>
      </div>
      <div className="mt-4">
        <p className="text-yellow-500" style={{ minHeight: '1.5em' }}>
          Live Transcription: {transcription || 'Speak to see transcription...'}
        </p>
        <p className="text-green-500" style={{ minHeight: '1.5em' }}>
          Normal Feedback: {feedback.normal || 'No feedback yet'}
        </p>
        <p className="text-blue-500" style={{ minHeight: '1.5em' }}>
          Enhanced Feedback: {feedback.enhanced || 'No enhanced feedback yet'}
        </p>
        <p className="text-purple-500" style={{ minHeight: '1.5em' }}>
          Similarity Score: {feedback.score ? `${feedback.score}%` : 'No score yet'}
        </p>
        <p className="text-orange-500" style={{ minHeight: '1.5em' }}>
          Transcription: {feedback.transcription || 'No transcription yet'}
        </p>
      </div>
    </div>
  );
}

export default InterviewPage;