'use client';

import { useState, useEffect, useRef } from 'react';
import { ClientMessage } from './actions';
import { useActions, useUIState } from 'ai/rsc';
import { generateId } from 'ai';

import LoadingIndicator from '@/components/loading-indicator';
import SubmitButton from '@/components/submit-button';

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

import { Message } from 'ai/react';

const roleToColorMap: Record<Message['role'], string> = {
  system: 'text-red-500',
  user: 'text-black',
  function: 'text-gray-500',
  tool: 'text-purple-500',
  assistant: 'text-blue-500',
  data: 'text-orange-500',
};

export default function Home() {
  const [input, setInput] = useState<string>('');
  const [conversation, setConversation] = useUIState();
  const { continueConversation } = useActions();

  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;

    setIsLoading(true);
    setConversation((currentConversation: ClientMessage[]) => [
      ...currentConversation,
      { id: generateId(), role: 'user', content: value },
    ]);

    try {
      const message = await continueConversation(value);
      setConversation((currentConversation: ClientMessage[]) => [
        ...currentConversation,
        message,
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }

    setInput('');
  };

  const renderMessages = () =>
    conversation.map((message: ClientMessage) => (
      <div key={message.id} className={`space-y-4 ${roleToColorMap[message.role]}`}>
        {message.role && <strong>{`${message.role}: `}</strong>}
        {message.content && (
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
        )}
        {message.display}
      </div>
    ));

  return (
    <div className="flex flex-col items-center justify-between w-full h-screen">
      <div className="w-full h-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col justify-between h-full">
          <div className="overflow-y-auto">
            {conversation.length > 0 && renderMessages()}
          </div>
          {isLoading && <LoadingIndicator />}

          <form onSubmit={handleSubmit} className="flex w-full mt-4">
            <input
              ref={inputRef}
              className="w-full p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring focus:border-blue-300"
              value={input}
              placeholder="제주도 오늘의 날씨는 어때?"
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <SubmitButton isLoading={isLoading} isDisabled={!input.trim()} onStop={() => setIsLoading(false)} />
          </form>
        </div>
      </div>
    </div>
  );
}
