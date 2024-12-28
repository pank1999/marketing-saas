import { Request, Response } from 'express';
import { WeatherService } from '../services/weather.service';

export class WeatherController {
  private weatherService: WeatherService;

  constructor() {
    this.weatherService = new WeatherService();
  }

  async getWeather(req: Request, res: Response) {
    try {
      const { lat, lon } = req.query;

      if (!lat || !lon) {
        return res
          .status(400)
          .json({ message: 'Latitude and longitude are required' });
      }

      const weatherData = await this.weatherService.getWeatherData(
        parseFloat(lat as string),
        parseFloat(lon as string)
      );

      res.json(weatherData);
    } catch (error) {
      console.error('Weather fetch error:', error);
      res.status(500).json({ message: 'Error fetching weather data' });
    }
  }
}
