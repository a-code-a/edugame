import React, { useState, useRef, useEffect } from 'react';

export interface ChatMessage {
  sender: 'user' | 'ai' | 'system';
  text: string;
}

interface GameChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isGenerating: boolean;
}

const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);


const GameChat: React.FC<GameChatProps> = ({ messages, onSendMessage, isGenerating }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (input.trim() && !isGenerating) {
      onSendMessage(input.trim());
      setInput('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSend();
    }
  };

  return (
    <div className="w-full lg:w-96 flex flex-col bg-slate-50 dark:bg-slate-800/50 border-l border-slate-200 dark:border-slate-700">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5 text-purple-500"><path d="M9.594.812a.5.5 0 0 1 .812 0l1.25 2.532 2.796.406a.5.5 0 0 1 .277.853l-2.023 1.972.478 2.784a.5.5 0 0 1-.726.527L8 8.732l-2.498 1.313a.5.5 0 0 1-.726-.527l.478-2.784-2.023-1.972a.5.5 0 0 1 .277-.853l2.796-.406L5.594.812a.5.5 0 0 1 .812 0L8 3.344l1.594-2.532ZM6.406 15.188a.5.5 0 0 1 .812 0L8 12.656l.781 2.532a.5.5 0 0 1 .812 0l.443.894a.5.5 0 0 1-.363.633l-1.42.355a.5.5 0 0 1-.496 0l-1.42-.355a.5.5 0 0 1-.363-.633l.443-.894Z" /></svg>
            Refine with AI
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tell me what you want to change.</p>
      </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl ${
                msg.sender === 'user' ? 'bg-blue-500 text-white' : 
                msg.sender === 'ai' ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200' :
                'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 italic text-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
         {isGenerating && (
            <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Reworking the code...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Add France and Germany"
            className="w-full p-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            disabled={isGenerating}
          />
          <button
            onClick={handleSend}
            disabled={isGenerating || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameChat;
