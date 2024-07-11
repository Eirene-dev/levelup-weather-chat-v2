'use client';

import { useState, useEffect, useRef } from 'react';
import { ClientMessage, submitMessage } from './actions';
import { useActions } from 'ai/rsc';
import { generateId } from 'ai';

import SubmitButton from '@/components/submit-button';

import roleToColorMap from '@/base/role-to-color-map'

export default function Home() {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const { submitMessage } = useActions();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;

    setIsLoading(true);
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: generateId(),
        status: 'user.message.created',
        text: input,
        gui: null,
        role: 'user',
      },
    ]);

    try {
      const response = await submitMessage(value);
      setMessages(currentMessages => [...currentMessages, response]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }

    setInput('');
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-screen">
      <div className="w-full h-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col justify-between h-full">
          <div>
            {messages.map(message => (
              <div key={message.id} className={`flex flex-col gap-1 p-2 border-b ${roleToColorMap[message.role]}`}>
                <div className="flex flex-row justify-between">
                  {message.role && <strong>{`${message.role}: `}</strong>}
                  <div className="text-sm text-zinc-500">{message.status}</div>
                </div>
                <div className="flex flex-col gap-2">{message.gui}</div>
                <div>{message.text}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmission} className="flex w-full mt-4">
            <input
              ref={inputRef}
              value={input}
              onChange={event => setInput(event.target.value)}
              className="w-full p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring focus:border-blue-300"
              disabled={isLoading}
              placeholder="현재 제주도 날씨 어때?"
            />
            <SubmitButton isLoading={isLoading} isDisabled={!input.trim()} onStop={() => setIsLoading(false)} />
          </form>
        </div>
      </div>
    </div>
  );
}
