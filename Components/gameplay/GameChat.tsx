import React, { useState, useRef, useEffect } from 'react';
import { FilePart } from '../../Services/geminiService';

export interface ChatMessage {
  sender: 'user' | 'ai' | 'system';
  text: string;
}

export interface AttachedFile extends FilePart {
  name: string;
  id: string;
}

interface GameChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, files: AttachedFile[]) => Promise<void>;
  isGenerating: boolean;
}

const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

const PaperclipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
  </svg>
);

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const GameChat: React.FC<GameChatProps> = ({ messages, onSendMessage, isGenerating }) => {
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if ((input.trim() || attachedFiles.length > 0) && !isGenerating) {
      onSendMessage(input.trim(), attachedFiles);
      setInput('');
      setAttachedFiles([]);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSend();
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      await processFiles(Array.from(event.target.files));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = async (files: File[]) => {
    const newAttachedFiles: AttachedFile[] = [];

    for (const file of files) {
      const unsupportedTypes = [
        'application/x-msdownload',
        'application/x-executable',
        'application/x-mach-binary',
        'application/octet-stream'
      ];

      if (unsupportedTypes.includes(file.type) || file.name.match(/\.(exe|dll|so|dylib|app)$/i)) {
        // Silently skip or could add error state toast/alert, 
        // for "Refine Code" keeping it simple like standard chat is usually fine unless we want strict error feedback.
        // Let's console log for now.
        console.warn(`File type ${file.type} not supported`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        console.warn(`File ${file.name} too large`);
        continue;
      }

      try {
        const base64Data = await readFileAsBase64(file);
        newAttachedFiles.push({
          id: Math.random().toString(36).substring(7),
          name: file.name,
          mimeType: file.type,
          data: base64Data
        });
      } catch (err) {
        console.error("Error reading file:", err);
      }
    }

    setAttachedFiles(prev => [...prev, ...newAttachedFiles]);
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Fehler beim Lesen der Datei'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePaste = async (event: React.ClipboardEvent) => {
    const items = Array.from(event.clipboardData.items) as DataTransferItem[];
    const files: File[] = [];

    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length > 0) {
      event.preventDefault();
      await processFiles(files);
    }
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
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
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachedFiles.map(file => (
              <div key={file.id} className="relative group">
                {file.mimeType.startsWith('image/') ? (
                  <div className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden relative">
                    <img
                      src={`data:${file.mimeType};base64,${file.data}`}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-2 py-1 text-xs text-slate-700 border border-slate-200">
                    <span className="truncate max-w-[100px]">{file.name}</span>
                  </div>
                )}
                <button
                  onClick={() => handleRemoveFile(file.id)}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Entfernen"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            placeholder="z. B. Füge ein Belohnungssystem hinzu"
            className="w-full rounded-2xl border border-white/80 bg-white/90 py-3 pl-4 pr-24 text-sm text-slate-700 shadow-inner focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
            disabled={isGenerating}
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
              accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.hwp,.hwpx"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Dateien hochladen"
              disabled={isGenerating}
            >
              <PaperclipIcon className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={isGenerating || (!input.trim() && attachedFiles.length === 0)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-purple-300/50 transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Nachricht senden"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default GameChat;
