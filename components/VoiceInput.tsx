import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isProcessing: boolean;
}

// Add type definition for Web Speech API since it's not always in default TS lib
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, isProcessing }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [onTranscript]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      if (recognition) {
        try {
          recognition.start();
          setIsListening(true);
        } catch (e) {
          console.error("Failed to start recognition", e);
        }
      } else {
        alert("Voice input is not supported in this browser.");
      }
    }
  }, [isListening, recognition]);

  return (
    <button
      onClick={toggleListening}
      disabled={isProcessing}
      className={`p-3 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center
        ${isListening 
          ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200' 
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
        } 
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title={isListening ? "Stop Listening" : "Start Voice Input"}
    >
      {isListening ? (
        <MicOff size={24} />
      ) : isProcessing ? (
        <Loader2 size={24} className="animate-spin" />
      ) : (
        <Mic size={24} />
      )}
    </button>
  );
};

export default VoiceInput;
