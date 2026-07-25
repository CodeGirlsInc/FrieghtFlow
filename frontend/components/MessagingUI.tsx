'use client';

import { useState } from 'react';

export default function MessagingUI() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { id: Date.now(), text: input, timestamp: new Date() }]);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-96 border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="mb-3 p-2 bg-white rounded">
              <p>{msg.text}</p>
              <span className="text-xs text-gray-500">{msg.timestamp.toLocaleTimeString()}</span>
            </div>
          ))
        )}
      </div>

      <div className="border-t p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
