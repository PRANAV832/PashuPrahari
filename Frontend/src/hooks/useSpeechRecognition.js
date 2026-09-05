import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom React Hook for browser-native Web Speech API SpeechRecognition
 *
 * Supports Hindi (hi-IN), Marathi (mr-IN), and English (en-IN)
 */
export const useSpeechRecognition = (initialLanguage = 'hi-IN') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [language, setLanguageState] = useState(initialLanguage);

  // Check browser support
  const isSupported =
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const recognitionRef = useRef(null);
  const isExplicitStopRef = useRef(false);

  // Initialize and configure recognition instance
  const getRecognitionInstance = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      isExplicitStopRef.current = false;
    };

    recognition.onresult = (event) => {
      let finalSpeech = '';
      let interimSpeech = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript || '';

        if (result.isFinal) {
          finalSpeech += text + ' ';
        } else {
          interimSpeech += text;
        }
      }

      if (finalSpeech) {
        setTranscript(finalSpeech.trim());
      }
      setInterimTranscript(interimSpeech);
    };

    recognition.onerror = (event) => {
      let errorMessage = 'An error occurred with voice recognition.';

      switch (event.error) {
        case 'not-allowed':
        case 'service-not-allowed':
          errorMessage =
            'Microphone access was denied. Please allow microphone permissions in your browser address bar to use voice input.';
          break;
        case 'no-speech':
          errorMessage =
            'No speech was detected. Please try speaking closer to your microphone or click "Start again".';
          break;
        case 'audio-capture':
          errorMessage =
            'No microphone was found. Please ensure a working audio input device is connected.';
          break;
        case 'network':
          errorMessage =
            'Network communication error. Voice recognition requires an active internet connection.';
          break;
        case 'aborted':
          // Recognition was aborted by user or system, don't set alarming error
          return;
        default:
          errorMessage = `Speech recognition error: ${event.error}. Please try again.`;
          break;
      }

      setError(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    return recognition;
  }, [isSupported, language]);

  // Start listening
  const start = useCallback(() => {
    if (!isSupported) {
      setError(
        'Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or input symptoms manually.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup error
        }
      }

      setError(null);
      const instance = getRecognitionInstance();
      recognitionRef.current = instance;

      if (instance) {
        instance.start();
      }
    } catch (err) {
      if (err.name === 'InvalidStateError') {
        // Already started
        setIsListening(true);
      } else {
        setError('Could not start microphone. Please check browser permissions.');
        setIsListening(false);
      }
    }
  }, [isSupported, getRecognitionInstance]);

  // Stop listening
  const stop = useCallback(() => {
    isExplicitStopRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore error if already stopped
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  // Reset transcript and error
  const reset = useCallback(() => {
    stop();
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, [stop]);

  // Change language (e.g. 'hi-IN', 'mr-IN', 'en-IN')
  const setLanguage = useCallback(
    (newLang) => {
      setLanguageState(newLang);
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        // restart with new language
        setTimeout(() => {
          if (isSupported) {
            const SpeechRecognition =
              window.SpeechRecognition || window.webkitSpeechRecognition;
            const instance = new SpeechRecognition();
            instance.continuous = true;
            instance.interimResults = true;
            instance.lang = newLang;
            recognitionRef.current = instance;
            instance.start();
          }
        }, 100);
      }
    },
    [isListening, isSupported]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup error
        }
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    language,
    start,
    stop,
    reset,
    setLanguage,
    setTranscript,
  };
};
