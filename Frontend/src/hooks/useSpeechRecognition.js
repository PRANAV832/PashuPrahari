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
  const isListeningRef = useRef(false);
  const accumulatedFinalRef = useRef('');
  const currentInstanceFinalRef = useRef('');

  // Initialize and configure recognition instance
  const createRecognition = useCallback(() => {
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
      isListeningRef.current = true;
      setError(null);
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

      currentInstanceFinalRef.current = finalSpeech.trim();

      const combinedFinal = (
        accumulatedFinalRef.current +
        (currentInstanceFinalRef.current ? ' ' + currentInstanceFinalRef.current : '')
      ).trim();

      if (combinedFinal) {
        setTranscript(combinedFinal);
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
          isExplicitStopRef.current = true;
          break;
        case 'no-speech':
          // Brief silence detected by browser engine, handled cleanly in onend
          return;
        case 'audio-capture':
          errorMessage =
            'No microphone was found. Please ensure a working audio input device is connected.';
          isExplicitStopRef.current = true;
          break;
        case 'network':
          errorMessage =
            'Network communication error. Voice recognition requires an active internet connection.';
          isExplicitStopRef.current = true;
          break;
        case 'aborted':
          // Recognition was aborted by user or system, do not set alarming error
          return;
        default:
          errorMessage = `Speech recognition error: ${event.error}. Please try again.`;
          break;
      }

      setError(errorMessage);
      setIsListening(false);
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      setInterimTranscript('');

      // Commit any confirmed final speech from the ended instance to accumulated buffer
      if (currentInstanceFinalRef.current) {
        accumulatedFinalRef.current = (
          accumulatedFinalRef.current + ' ' + currentInstanceFinalRef.current
        ).trim();
        currentInstanceFinalRef.current = '';
      }

      // If recognition ended due to browser silence timeout while user is still recording, auto-restart
      if (!isExplicitStopRef.current && isListeningRef.current) {
        try {
          const nextInstance = createRecognition();
          recognitionRef.current = nextInstance;
          if (nextInstance) {
            nextInstance.start();
          }
        } catch (e) {
          setIsListening(false);
          isListeningRef.current = false;
        }
      } else {
        setIsListening(false);
        isListeningRef.current = false;
      }
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
      isExplicitStopRef.current = false;
      isListeningRef.current = true;
      accumulatedFinalRef.current = '';
      currentInstanceFinalRef.current = '';
      setTranscript('');
      setInterimTranscript('');

      const instance = createRecognition();
      recognitionRef.current = instance;

      if (instance) {
        instance.start();
      }
    } catch (err) {
      if (err.name === 'InvalidStateError') {
        setIsListening(true);
        isListeningRef.current = true;
      } else {
        setError('Could not start microphone. Please check browser permissions.');
        setIsListening(false);
        isListeningRef.current = false;
      }
    }
  }, [isSupported, createRecognition]);

  // Stop listening
  const stop = useCallback(() => {
    isExplicitStopRef.current = true;
    isListeningRef.current = false;
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
    isExplicitStopRef.current = true;
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore error
      }
    }
    accumulatedFinalRef.current = '';
    currentInstanceFinalRef.current = '';
    setIsListening(false);
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  // Change language (e.g. 'hi-IN', 'mr-IN', 'en-IN')
  const setLanguage = useCallback(
    (newLang) => {
      setLanguageState(newLang);
      if (isListeningRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        setTimeout(() => {
          if (isSupported && isListeningRef.current) {
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
    [isSupported]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isExplicitStopRef.current = true;
      isListeningRef.current = false;
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
