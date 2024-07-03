import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText } from 'ai';
import { z } from 'zod';

import { weatherSchema, WeatherParams, fetchWeatherData } from '@/base/weather';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o'),
    messages: convertToCoreMessages(messages),
    tools: {
      getCurrentWeather: {
        description: 'Get the current weather information for a specific city or region. The user can provide the name of the city and nation, and optionally specify the temperature unit (Celsius or Fahrenheit) and the language for the response.',
        parameters: weatherSchema,
        // execute: async (params: WeatherParams) => {
        //   try {
        //     const weatherData = await fetchWeatherData(params);
        //     console.log(JSON.stringify(weatherData));
        //     return JSON.stringify(weatherData);
        //   } catch (error) {
        //     console.error('Error fetching weather data:', error);
        //     throw new Error('Failed to fetch weather data');
        //   }
        // },
      },
      askForConfirmation: {
        description: 'Ask the user for confirmation.',
        parameters: z.object({
          message: z.string().describe('The message to ask for confirmation.'),
        }),
      },
    },
  });

  return result.toAIStreamResponse();
}



// import { openai } from '@ai-sdk/openai';
// import { convertToCoreMessages, streamText } from 'ai';
// import { z } from 'zod';

// import { weatherSchema, WeatherParams, fetchWeatherData } from '@/base/weather';

// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30;

// export async function POST(req: Request) {
//   const { messages } = await req.json();

//   const result = await streamText({
//     model: openai('gpt-4o'),
//     messages: convertToCoreMessages(messages),
//     tools: {
//     //   // server-side tool with execute function:
//     //   getWeatherInformation: {
//     //     description: 'show the weather in a given city to the user',
//     //     parameters: z.object({ city: z.string() }),
//     //     execute: async ({ city }: { city: string }) => {
//     //       console.info('getWeatherInformation(): ', city)

//     //       const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
//     //       return weatherOptions[
//     //         Math.floor(Math.random() * weatherOptions.length)
//     //       ];
//     //     },
//     //   },
//       getCurrentWeather: {
//         description: 'Get the current weather information for a specific city or region. The user can provide the name of the city and nation, and optionally specify the temperature unit (Celsius or Fahrenheit) and the language for the response.',
//         parameters: weatherSchema,
//         execute: async (params: WeatherParams) => {
//         try {
//             const weatherData = await fetchWeatherData(params);

//             console.log(JSON.stringify(weatherData));

//             // weatherCard = <WeatherCard data={JSON.stringify(weatherData)} />;

//             return JSON.stringify(weatherData);
//         } catch (error) {
//             console.error('Error fetching weather data:', error);
//             throw new Error('Failed to fetch weather data');
//         }
//         },
//       },
//       // client-side tool that starts user interaction:
//       askForConfirmation: {
//         description: 'Ask the user for confirmation.',
//         parameters: z.object({
//           message: z.string().describe('The message to ask for confirmation.'),
//         }),
//       },
//     //   // client-side tool that is automatically executed on the client:
//     //   getLocation: {
//     //     description:
//     //       'Get the user location. Always ask for confirmation before using this tool.',
//     //     parameters: z.object({}),
//     //   },
//     },
//   });

//   return result.toAIStreamResponse();
// }