import axios from 'axios';

interface WeatherData {
  weather: string;
  temperature: number;
}

export class WeatherService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

  constructor() {
    this.apiKey = process.env['WEATHER_API_KEY'] || '';
  }

  async getWeatherData(
    latitude: number,
    longitude: number
  ): Promise<WeatherData> {
    try {
      const response = await axios.get(
        `${this.baseUrl}?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}`
      );

      return {
        weather: response.data.weather[0].main.toUpperCase(),
        temperature: response.data.main.temp - 273.15, // Convert Kelvin to Celsius
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }
}
