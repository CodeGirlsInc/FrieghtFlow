"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/Textarea";

export default function Home() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (e.target.value.length > 200) {
      setError("You have exceeded the character limit.");
    } else {
      setError(undefined);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">FreightFlow Homepage</h1>
      <div className="w-full max-w-md">
        <Textarea
          value={value}
          onChange={handleChange}
          placeholder="Enter your text here..."
          maxLength={200}
          error={error}
        />
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => setError("This is a simulated error.")}
        >
          Simulate Error
        </button>
      </div>
    </main>
  );
}