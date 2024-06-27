'use server';

import { createAI, getMutableAIState } from 'ai/rsc';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ReactNode } from 'react';
import { generateId } from 'ai';

import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

import { weatherSchema, WeatherParams, fetchWeatherData } from '@/base/weather';
import WeatherCard from '@/components/weather-card';

export interface ServerMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClientMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  display?: ReactNode;
}

export interface ToolResult {
  result: string;
}

export async function continueConversation(input: string): Promise<ClientMessage> {
  'use server';

  const history = getMutableAIState();
  console.info(history.get());

  let weatherCard: ReactNode | null = null;

  try {
    const { text, toolResults } = await generateText({
      // model: openai('gpt-3.5-turbo'),
      model: openai('gpt-4o'),
      messages: [...history.get(), { role: 'user', content: input }],
      tools: {
        getCurrentWeather: {
          description: 'Get the current weather information for a specific city or region. The user can provide the name of the city and nation, and optionally specify the temperature unit (Celsius or Fahrenheit) and the language for the response.',
          parameters: weatherSchema,
          execute: async (params: WeatherParams) => {
            try {
              const weatherData = await fetchWeatherData(params);

              history.update((messages: ServerMessage[]) => [
                ...messages,
                {
                  role: 'assistant',
                  content: `The weather information ${params.location} with ${JSON.stringify(weatherData)}`,
                },
              ]);

              console.log(JSON.stringify(weatherData));

              weatherCard = <WeatherCard data={JSON.stringify(weatherData)} />;

              return JSON.stringify(weatherData);
            } catch (error) {
              console.error('Error fetching weather data:', error);
              throw new Error('Failed to fetch weather data');
            }
          },
        },
      },
    });

    console.info('continueConversation():', text);
    history.done([...history.get(), { role: 'assistant', content: text }]);

    const toolResultsContent = toolResults
      ? (toolResults as ToolResult[]).map(toolResult => toolResult.result).join('\n')
      : '';

    let readableContent = toolResultsContent;
    if (toolResultsContent) {
      // 사람이 읽기 쉽게 변환
      const { text: readableText } = await generateText({
        model: openai('gpt-4o'),
        messages: [
          { role: 'system', content: '다음 날씨 데이터를 사람이 읽기 쉬운 형식으로 변환해 주세요. 유닉스 시간도 사람이 이해하기 편하게 바꾸어 주세요.' },
          { role: 'user', content: toolResultsContent },
        ],
      });

      // Markdown을 HTML로 변환
      const markdownToHtml = await remark()
        .use(remarkGfm)
        .use(html)
        .process(readableText);

      readableContent = markdownToHtml.toString();
    }

    // Markdown을 HTML로 변환
    const markdownToHtml = await remark()
      .use(remarkGfm)
      .use(html)
      .process(text);

    const markdownText = markdownToHtml.toString();

    console.info(markdownText)

    return {
      id: generateId(),
      role: 'assistant',
      content: markdownText || readableContent,
      display: weatherCard,
    };
  } catch (error) {
    console.error('Error in continueConversation:', error);
    throw new Error('Failed to continue conversation');
  }
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});
