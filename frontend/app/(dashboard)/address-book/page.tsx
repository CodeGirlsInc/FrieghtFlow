'use client';

import { useState } from 'react';

export default function AddressBookPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleAddContact = () => {
    if (name && email) {
      setContacts([...contacts, { id: Date.now(), name, email }]);
      setName('');
      setEmail('');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Address Book</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full mb-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-2 rounded"
        />
        <button
          onClick={handleAddContact}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Contact
        </button>
      </div>

      <div className="space-y-2">
        {contacts.map((contact) => (
          <div key={contact.id} className="border rounded p-3 bg-gray-50">
            <p className="font-semibold">{contact.name}</p>
            <p className="text-sm text-gray-600">{contact.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
