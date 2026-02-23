'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hallo! 👋 Ich bin Dataquard. Wie kann ich dir helfen?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    '🟢 Was ist nDSG?',
    '🇪🇺 Was ist DSGVO?',
    '💰 Wie viel kostet es?',
    '🚀 Wie funktioniert der Scanner?'
  ];

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      let response = '';
      
      if (input.includes('nDSG') || input.includes('Schweiz')) {
        response = '✅ nDSG (Schweizer Datenschutzgesetz) ist das Datenschutzgesetz für die Schweiz. Es schützt personenbezogene Daten. Dataquard hilft Ihnen, eine konforme Privacy Policy zu generieren!';
      } else if (input.includes('DSGVO') || input.includes('EU')) {
        response = '🇪🇺 DSGVO (Datenschutz-Grundverordnung) ist das Datenschutzgesetz der EU. Es ist strenger als nDSG. Mit Dataquard können Sie schnell eine DSGVO-konforme Policy erstellen!';
      } else if (input.includes('Preis') || input.includes('Kosten') || input.includes('kostet')) {
        response = '💰 ESSENTIAL: CHF 59/Jahr (5 Scans)\nPROFESSIONAL: CHF 149 (Unlimited Scans)\n\nBeiden beinhalten PDF-Download und Email-Support!';
      } else if (input.includes('Scanner') || input.includes('funktioniert')) {
        response = '🚀 Der Scanner analysiert Ihre Website und zeigt mit einer Ampel an:\n🟢 nDSG (Schweiz)\n🟡 DSGVO (EU)\n🔴 BEIDE\n\nDann können Sie sofort die richtige Privacy Policy downloaden!';
      } else {
        response = 'Gute Frage! 🤔 Für spezifische Rechtsberatung empfehle ich, einen Datenschutzanwalt zu konsultieren. Ich kann aber gerne allgemeine Fragen beantworten!';
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);
    }, 800);
  };

  return (
    <>
      {/* Floating Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center text-2xl z-40 hover:scale-110 transition"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 border-2 border-blue-600">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">🤖 Dataquard Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xl hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
                  <span className="flex space-x-2">
                    <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200"></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions (nur wenn keine Messages) */}
          {messages.length === 1 && !loading && (
            <div className="px-4 py-2 space-y-2">
              <p className="text-xs text-gray-600 font-semibold">Schnellfragen:</p>
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => {
                    setInput(question);
                  }}
                  className="w-full text-left text-xs bg-gray-100 hover:bg-gray-200 p-2 rounded text-gray-700"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t p-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Frage stellen..."
              className="flex-1 border rounded px-3 py-2 focus:outline-none focus:border-blue-600"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              ➜
            </button>
          </div>
        </div>
      )}
    </>
  );
}
