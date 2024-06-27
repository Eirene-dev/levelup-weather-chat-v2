import { z } from 'zod';

export const weatherSchema = z.object({
  location: z.string().describe('The city and state in English, even if the input is in Korean, e.g., Seoul, Jeju.').describe('도시와 주의 이름은 영어로 입력해야 합니다. 입력이 한글일지라도 영어 도시 이름으로 변환되어야 합니다. 예: 서울 -> Seoul, 제주 -> Jeju'),
  nation: z.string().describe('The country or nation of the location, e.g., S.Korea'),
  unit: z.enum(['celsius', 'fahrenheit']).describe('The temperature unit to use. Infer this from the user\'s location.'),
  language: z.string().describe('The language of the nation, e.g., 한국어'),
});

export type WeatherParams = z.infer<typeof weatherSchema>;

export async function fetchWeatherData(params: WeatherParams) {
  const apiKey = process.env.OPENWEATHERMAP_KEY; // OpenWeatherMap API key
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${params.location}&appid=${apiKey}&units=metric`;

  console.info('fetchWeatherData()', params.location)

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    console.info(data)

    return {
      location: params.location,
      nation: params.nation, // Example nation
      temperature: data.main.temp,
      weather: data.weather[0].description,
      unit: params.unit,
      language: params.language,
      details: {
        temperature: data.main.temp,
        weather: data.weather[0].main,
        info: data.weather[0].description,
        feels_like: data.main.feels_like,
        temp_min: data.main.temp_min,
        temp_max: data.main.temp_max,
        pressure: data.main.pressure,
        humidity: data.main.humidity,
        wind_speed: data.wind.speed,
        wind_deg: data.wind.deg,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        location: data.location,
        nation: data.nation,
        format: data.format,
      },
    };
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    return null;
  }
}
