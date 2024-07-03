'use client';

import { useEffect, useState } from 'react';
import { ToolInvocation } from 'ai';
import { Message, useChat } from 'ai/react';
import WeatherCard from '@/components/weather-card';
import LoadingIndicator from '@/components/loading-indicator';
import SubmitButton from '@/components/submit-button';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import { weatherSchema, WeatherParams, fetchWeatherData } from '@/base/weather';

// Message 타입을 확장하여 htmlContent 속성을 포함시킵니다.
interface ExtendedMessage extends Message {
  htmlContent?: string;
}

export default function Chat() {
  const { messages, input, isLoading, handleInputChange, handleSubmit, stop, addToolResult } =
    useChat({
      maxToolRoundtrips: 5,

      // run client-side tools that are automatically executed:
      async onToolCall({ toolCall }) {
        if (toolCall.toolName === 'getLocation') {
          const cities = [
            'New York',
            'Los Angeles',
            'Chicago',
            'San Francisco',
          ];
          console.info('onToolCall(): ', toolCall);
          return cities[Math.floor(Math.random() * cities.length)];
        } else if (toolCall.toolName === 'getCurrentWeather') {
            console.info('onToolCall(): ', toolCall);
            const params = toolCall.args as WeatherParams;
            console.info('onToolCall() params: ', params);
            const weatherData = await fetchWeatherData(params);

            return JSON.stringify(weatherData);
        }
      },
    });

  const [renderedMessages, setRenderedMessages] = useState<ExtendedMessage[]>([]);

  useEffect(() => {
    const processMessages = async () => {
      const updatedMessages = await Promise.all(
        messages.map(async (m) => {
          const processedContent = await remark()
            .use(remarkGfm)
            .use(html)
            .process(m.content);
          return { ...m, htmlContent: processedContent.toString() };
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
            {renderedMessages.map((m) => (
              <div key={m.id} className="space-y-4">
                <strong>{m.role}:</strong>
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{ __html: m.htmlContent || m.content }}
                />
                {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
                  const toolCallId = toolInvocation.toolCallId;
                  const addResult = (result: string) =>
                    addToolResult({ toolCallId, result });

                  if (toolInvocation.toolName === 'askForConfirmation') {
                    return (
                      <div key={toolCallId} className="space-y-2">
                        {toolInvocation.args.message}
                        <div>
                          {'result' in toolInvocation ? (
                            <b>{toolInvocation.result}</b>
                          ) : (
                            <>
                              <button
                                className="px-4 py-2 mr-2 text-white bg-blue-500 rounded"
                                onClick={() => addResult('Yes')}
                              >
                                Yes
                              </button>
                              <button
                                className="px-4 py-2 text-white bg-red-500 rounded"
                                onClick={() => addResult('No')}
                              >
                                No
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  } else if (toolInvocation.toolName == 'getCurrentWeather') {
                    return 'result' in toolInvocation ? (
                      <div key={toolCallId} className="space-y-2">
                        <WeatherCard data={toolInvocation.result} />
                      </div>
                    ) : (
                      <div key={toolCallId} className="space-y-2">
                        Calling {toolInvocation.toolName}...
                      </div>
                    );
                  }

                  return 'result' in toolInvocation ? (
                    <div key={toolCallId} className="space-y-2">
                      Tool call {`${toolInvocation.toolName}: `}
                      {toolInvocation.result}
                    </div>
                  ) : (
                    <div key={toolCallId} className="space-y-2">
                      Calling {toolInvocation.toolName}...
                    </div>
                  );
                })}
                <br />
              </div>
            ))}
          </div>
          {isLoading && <LoadingIndicator />}
          <form onSubmit={handleSubmit} className="flex w-full mt-4">
            <input
              value={input}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring focus:border-blue-300"
              disabled={isLoading}
            />
            <SubmitButton isLoading={isLoading} isDisabled={!input.trim()} onStop={stop} />
          </form>
        </div>
      </div>
    </div>
  );
}



// 'use client';

// import { ToolInvocation } from 'ai';
// import { Message, useChat } from 'ai/react';
// import WeatherCard from '@/components/weather-card';
// import LoadingIndicator from '@/components/loading-indicator';
// import SubmitButton from '@/components/submit-button';

// export default function Chat() {
//   const { messages, input, isLoading, handleInputChange, handleSubmit, stop, addToolResult } =
//     useChat({
//       maxToolRoundtrips: 5,

//       // run client-side tools that are automatically executed:
//       async onToolCall({ toolCall }) {
//         if (toolCall.toolName === 'getLocation') {
//           const cities = [
//             'New York',
//             'Los Angeles',
//             'Chicago',
//             'San Francisco',
//           ];
//           console.info('onToolCall(): ', toolCall);
//           return cities[Math.floor(Math.random() * cities.length)];
//         }
//       },
//     });

//   return (
//     <div className="flex flex-col items-center justify-between w-full h-screen">
//       <div className="w-full h-full max-w-md p-6 bg-white rounded-lg shadow-md">
//         <div className="flex flex-col justify-between h-full">
//           <div className="overflow-y-auto">
//             {messages?.map((m: Message) => (
//               <div key={m.id} className="space-y-4">
//                 <strong>{m.role}:</strong> {m.content}
//                 {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
//                   const toolCallId = toolInvocation.toolCallId;
//                   const addResult = (result: string) =>
//                     addToolResult({ toolCallId, result });

//                   if (toolInvocation.toolName === 'askForConfirmation') {
//                     return (
//                       <div key={toolCallId} className="space-y-2">
//                         {toolInvocation.args.message}
//                         <div>
//                           {'result' in toolInvocation ? (
//                             <b>{toolInvocation.result}</b>
//                           ) : (
//                             <>
//                               <button
//                                 className="px-4 py-2 mr-2 text-white bg-blue-500 rounded"
//                                 onClick={() => addResult('Yes')}
//                               >
//                                 Yes
//                               </button>
//                               <button
//                                 className="px-4 py-2 text-white bg-red-500 rounded"
//                                 onClick={() => addResult('No')}
//                               >
//                                 No
//                               </button>
//                             </>
//                           )}
//                         </div>
//                       </div>
//                     );
//                   } else if (toolInvocation.toolName == 'getCurrentWeather') {
//                     return 'result' in toolInvocation ? (
//                       <div key={toolCallId} className="space-y-2">
//                         <WeatherCard data={toolInvocation.result} />
//                       </div>
//                     ) : (
//                       <div key={toolCallId} className="space-y-2">
//                         Calling {toolInvocation.toolName}...
//                       </div>
//                     );
//                   }

//                   return 'result' in toolInvocation ? (
//                     <div key={toolCallId} className="space-y-2">
//                       Tool call {`${toolInvocation.toolName}: `}
//                       {toolInvocation.result}
//                     </div>
//                   ) : (
//                     <div key={toolCallId} className="space-y-2">
//                       Calling {toolInvocation.toolName}...
//                     </div>
//                   );
//                 })}
//                 <br />
//               </div>
//             ))}
//           </div>
//           {isLoading && <LoadingIndicator />}
//           <form onSubmit={handleSubmit} className="flex w-full mt-4">
//             <input
//               value={input}
//               onChange={handleInputChange}
//               className="w-full p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring focus:border-blue-300"
//             />
//             <SubmitButton isLoading={isLoading} isDisabled={!input.trim()} onStop={stop} />
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }



// 'use client';

// import { ToolInvocation } from 'ai';
// import { Message, useChat } from 'ai/react';
// import WeatherCard from '@/components/weather-card';

// import LoadingIndicator from '@/components/loading-indicator';
// import SubmitButton from '@/components/submit-button';

// export default function Chat() {
//   const { messages, input, isLoading, handleInputChange, handleSubmit, stop, addToolResult } =
//     useChat({
//       maxToolRoundtrips: 5,

//       // run client-side tools that are automatically executed:
//       async onToolCall({ toolCall }) {
//         if (toolCall.toolName === 'getLocation') {
//           const cities = [
//             'New York',
//             'Los Angeles',
//             'Chicago',
//             'San Francisco',
//           ];

//           console.info('onToolCall(): ', toolCall);
//           return cities[Math.floor(Math.random() * cities.length)];
//         }
//       },
//     });

//   return (
//     <div className="flex flex-col items-center justify-between w-full h-screen">
//       <div className="w-full h-full max-w-md p-6 bg-white rounded-lg shadow-md">
//         <div className="flex flex-col justify-between h-full">
//           <div className="overflow-y-auto">
//             {messages?.map((m: Message) => (
//               <div key={m.id} className="space-y-4">
//                 <strong>{m.role}:</strong> {m.content}
//                 {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
//                   const toolCallId = toolInvocation.toolCallId;
//                   const addResult = (result: string) =>
//                     addToolResult({ toolCallId, result });

//                   // render confirmation tool (client-side tool with user interaction)
//                   if (toolInvocation.toolName === 'askForConfirmation') {
//                     return (
//                       <div key={toolCallId} className="space-y-2">
//                         {toolInvocation.args.message}
//                         <div>
//                           {'result' in toolInvocation ? (
//                             <b>{toolInvocation.result}</b>
//                           ) : (
//                             <>
//                               <button
//                                 className="px-4 py-2 mr-2 text-white bg-blue-500 rounded"
//                                 onClick={() => addResult('Yes')}
//                               >
//                                 Yes
//                               </button>
//                               <button
//                                 className="px-4 py-2 text-white bg-red-500 rounded"
//                                 onClick={() => addResult('No')}
//                               >
//                                 No
//                               </button>
//                             </>
//                           )}
//                         </div>
//                       </div>
//                     );
//                   } else if (toolInvocation.toolName == 'getCurrentWeather') {
//                     return 'result' in toolInvocation ? (
//                       <div key={toolCallId} className="space-y-2">
//                         <WeatherCard data={toolInvocation.result} />
//                       </div>
//                     ) : (
//                       <div key={toolCallId} className="space-y-2">
//                         Calling {toolInvocation.toolName}...
//                       </div>
//                     );
//                   }

//                   // other tools:
//                   return 'result' in toolInvocation ? (
//                     <div key={toolCallId} className="space-y-2">
//                       Tool call {`${toolInvocation.toolName}: `}
//                       {toolInvocation.result}
//                     </div>
//                   ) : (
//                     <div key={toolCallId} className="space-y-2">
//                       Calling {toolInvocation.toolName}...
//                     </div>
//                   );
//                 })}
//                 <br />
//               </div>
//             ))}
//           </div>
//           {isLoading && <LoadingIndicator />}
//           <form onSubmit={handleSubmit} className="flex w-full mt-4">
//             <input
//               value={input}
//               onChange={handleInputChange}
//               className="w-full p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring focus:border-blue-300"
//             />
//             <SubmitButton isLoading={isLoading} isDisabled={!input.trim()} onStop={stop} />
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }


// 'use client';

// import { ToolInvocation } from 'ai';
// import { Message, useChat } from 'ai/react';
// import WeatherCard from '@/components/weather-card';


// export default function Chat() {
//   const { messages, input, handleInputChange, handleSubmit, addToolResult } =
//     useChat({
//       maxToolRoundtrips: 5,

//       // run client-side tools that are automatically executed:
//       async onToolCall({ toolCall }) {
//         if (toolCall.toolName === 'getLocation') {
//           const cities = [
//             'New York',
//             'Los Angeles',
//             'Chicago',
//             'San Francisco',
//           ];

//           console.info('onToolCall(): ', toolCall)
//           return cities[Math.floor(Math.random() * cities.length)];
//         }
//       },
//     });

//   return (
//     <div>
//       {messages?.map((m: Message) => (
//         <div key={m.id}>
//           <strong>{m.role}:</strong>
//           {m.content}
//           {m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
//             const toolCallId = toolInvocation.toolCallId;
//             const addResult = (result: string) =>
//               addToolResult({ toolCallId, result });

//             // render confirmation tool (client-side tool with user interaction)
//             if (toolInvocation.toolName === 'askForConfirmation') {
//               return (
//                 <div key={toolCallId}>
//                   {toolInvocation.args.message}
//                   <div>
//                     {'result' in toolInvocation ? (
//                       <b>{toolInvocation.result}</b>
//                     ) : (
//                       <>
//                         <button onClick={() => addResult('Yes')}>Yes</button>
//                         <button onClick={() => addResult('No')}>No</button>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               );
//             } else if (toolInvocation.toolName == 'getCurrentWeather') {
//                 return 'result' in toolInvocation ? (
//                 <div key={toolCallId}>
//                     {/* Tool call {`${toolInvocation.toolName}: `}
//                     {toolInvocation.result} */}
//                     <WeatherCard data={toolInvocation.result} />
//                 </div>
//                 ) : (
//                 <div key={toolCallId}>Calling {toolInvocation.toolName}...</div>
//                 );
//             }

//             // other tools:
//             return 'result' in toolInvocation ? (
//               <div key={toolCallId}>
//                 Tool call {`${toolInvocation.toolName}: `}
//                 {toolInvocation.result}
//                 {/* <WeatherCard data={toolInvocation.result} /> */}
//               </div>
//             ) : (
//               <div key={toolCallId}>Calling {toolInvocation.toolName}...</div>
//             );
//           })}
//           <br />
//         </div>
//       ))}

//       <form onSubmit={handleSubmit}>
//         <input value={input} onChange={handleInputChange} />
//       </form>
//     </div>
//   );
// }