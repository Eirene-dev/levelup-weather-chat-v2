'use client';

import { Message, useAssistant as useAssistant } from 'ai/react';
import { useState, useEffect, useRef } from 'react';

import SubmitButton from '@/components/submit-button';
import WeatherCard from '@/components/weather-card';
import LoadingIndicator from '@/components/loading-indicator';
import roleToColorMap from '@/base/role-to-color-map'

import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

// Message 타입을 확장하여 htmlContent 속성을 포함시킵니다.
interface ExtendedMessage extends Message {
  htmlContent?: string;
}

export default function Chat() {
  const {
    status,
    messages,
    input,
    submitMessage,
    handleInputChange,
    error,
    stop,
  } = useAssistant({ api: '/api/assistant' });

  // When status changes to accepting messages, focus the input:
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (status === 'awaiting_message') {
      inputRef.current?.focus();
    }
  }, [status]);

  const [renderedMessages, setRenderedMessages] = useState<ExtendedMessage[]>([]);

  useEffect(() => {
    const processMessages = async () => {
      const updatedMessages = await Promise.all(
        messages.map(async (m) => {
          const processedContent = await remark()
            .use(remarkGfm)
            .use(html, { sanitize: false })
            .process(m.content);
          return { ...m, htmlContent: processedContent.toString().replace(/\n/g, '') };
        })
      );
      setRenderedMessages(updatedMessages);
    };
    processMessages();
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-between w-full h-screen">
      <div className="w-full h-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col justify-between h-full">
          <div className="overflow-y-auto">
            {error != null && (
              <div className="relative px-6 py-4 text-white bg-red-500 rounded-md">
                <span className="block sm:inline">
                  Error: {(error as any).toString()}
                </span>
              </div>
            )}

            {renderedMessages.map((m: ExtendedMessage) => (
              <div
                key={m.id}
                className="whitespace-pre-wrap"
                style={{ color: roleToColorMap[m.role] }}
              >
                <strong>{`${m.role}: `}</strong>
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{ __html: m.htmlContent || m.content }}
                />
                {/* {m.role !== 'data' && m.content} */}
                {m.role === 'data' && (
                  <>
                    {/* {(m.data as any).description} */}
                    <pre className={'bg-gray-200'}>
                      {/* {JSON.stringify(m.data, null, 2)} */}
                      <WeatherCard data={JSON.stringify(m.data)} />
                    </pre>
                  </>
                )}
              </div>
            ))}
            {status === 'in_progress' && (
              <LoadingIndicator />
            )}
          </div>

          <form onSubmit={submitMessage} className="flex w-full mt-4">
            <input
              // ref={inputRef}
              value={input}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring focus:border-blue-300"
              disabled={status !== 'awaiting_message'}
              placeholder="현재 제주도 날씨 어때?"
            />
            <SubmitButton isLoading={status !== 'awaiting_message'} isDisabled={!input.trim()} onStop={stop} />
          </form>
        </div>
      </div>
    </div>
  );
}