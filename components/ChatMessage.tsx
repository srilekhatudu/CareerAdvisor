import React from 'react';
import { User, Bot, Volume2, StopCircle } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  onSpeak: (text: string, id: string) => void;
  onStopSpeak: () => void;
  isSpeakingThis: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSpeak, onStopSpeak, isSpeakingThis }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md
          ${isUser ? 'bg-indigo-600' : 'bg-white border border-slate-200'}`}>
          {isUser ? <User size={20} className="text-white" /> : <Bot size={24} className="text-indigo-600" />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`p-4 rounded-2xl shadow-sm relative group
            ${isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
            }`}>
            <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
              {message.text}
            </p>
            
            {!isUser && (
              <button 
                onClick={() => isSpeakingThis ? onStopSpeak() : onSpeak(message.text, message.id)}
                className="absolute -bottom-8 left-0 p-1.5 text-slate-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Read aloud"
              >
                {isSpeakingThis ? <StopCircle size={18} /> : <Volume2 size={18} />}
              </button>
            )}
          </div>
          <span className="text-xs text-slate-400 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
