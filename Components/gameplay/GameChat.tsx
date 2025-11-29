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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (input.trim() && !isGenerating) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <aside className="w-full lg:w-[340px] xl:w-[380px] flex flex-col border-l border-white/60 bg-gradient-to-b from-white/90 via-[#f9f5ff]/90 to-white backdrop-blur-xl">
      <div className="border-b border-white/70 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-300/50">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-5 w-5">
              <path d="M9.594.812a.5.5 0 0 1 .812 0l1.25 2.532 2.796.406a.5.5 0 0 1 .277.853l-2.023 1.972.478 2.784a.5.5 0 0 1-.726.527L8 8.732l-2.498 1.313a.5.5 0 0 1-.726-.527l.478-2.784-2.023-1.972a.5.5 0 0 1 .277-.853l2.796-.406L5.594.812a.5.5 0 0 1 .812 0L8 3.344l1.594-2.532ZM6.406 15.188a.5.5 0 0 1 .812 0L8 12.656l.781 2.532a.5.5 0 0 1 .812 0l.443.894a.5.5 0 0 1-.363.633l-1.42.355a.5.5 0 0 1-.496 0l-1.42-.355a.5.5 0 0 1-.363-.633l.443-.894Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Mit KI verfeinern</h3>
            <p className="text-xs text-slate-500">Schreibe Wünsche oder Anpassungen ins Chatfeld</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        {messages.map((msg, index) => {
          const alignment = msg.sender === 'user' ? 'justify-end' : 'justify-start';
          const bubbleBase =
            'max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-lg shadow-slate-900/5';
          const bubbleStyles =
            msg.sender === 'user'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
              : msg.sender === 'ai'
                ? 'bg-white text-slate-700 border border-white/80'
                : 'bg-amber-50 text-amber-700 border border-amber-200 italic text-xs';
          return (
            <div key={index} className={`flex ${alignment}`}>
              <div className={`${bubbleBase} ${bubbleStyles}`}>{msg.text}</div>
            </div>
          );
        })}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-3 rounded-3xl border border-white/80 bg-white/90 px-4 py-3 text-sm text-slate-500 shadow-lg">
              <svg className="h-5 w-5 animate-spin text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Spiel wird angepasst …
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/70 px-5 py-5">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="z. B. Füge ein Belohnungssystem hinzu"
            className="w-full rounded-2xl border border-white/80 bg-white/90 py-3 pl-4 pr-14 text-sm text-slate-700 shadow-inner focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
            disabled={isGenerating}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isGenerating || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-purple-300/50 transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Nachricht senden"
          >
            <SendIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default GameChat;
