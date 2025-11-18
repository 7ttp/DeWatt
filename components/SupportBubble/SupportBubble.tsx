'use client';

import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function SupportBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string; from: 'user' | 'support' }>>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { text: message, from: 'user' }]);
    
    // Simulate support response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: 'Thanks for your message! Our team will get back to you shortly.', 
        from: 'support' 
      }]);
    }, 1000);
    
    setMessage('');
  };

  return (
    <>
      {/* Support Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-2 md:bottom-24 md:right-6 w-[calc(100vw-1rem)] max-w-sm md:w-80 bg-white rounded-lg shadow-2xl z-50 border border-gray-200">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 md:p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-sm md:text-base">Support</h3>
              <p className="text-[10px] md:text-xs opacity-90">We&apos;re here to help</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-3 md:p-4 h-48 md:h-64 overflow-y-auto bg-gray-50">
            <div className="bg-white rounded-lg p-2 md:p-3 shadow-sm mb-2 md:mb-3">
              <p className="text-xs md:text-sm text-gray-700">
                👋 Hi! How can we help you today?
              </p>
            </div>
            
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-2 md:p-3 shadow-sm mb-2 md:mb-3 ${
                  msg.from === 'user'
                    ? 'bg-green-500 text-white ml-4 md:ml-8'
                    : 'bg-white text-gray-700 mr-4 md:mr-8'
                }`}
              >
                <p className="text-xs md:text-sm">{msg.text}</p>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSubmit} className="p-3 md:p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-xs md:text-sm text-gray-900"
              />
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white p-1.5 md:p-2 rounded-lg transition-colors flex-shrink-0"
              >
                <Send size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Support Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 md:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 group"
        aria-label="Open support chat"
      >
        {isOpen ? (
          <X size={20} className="md:w-6 md:h-6" />
        ) : (
          <MessageCircle size={20} className="md:w-6 md:h-6 group-hover:animate-bounce" />
        )}
      </button>
    </>
  );
}
