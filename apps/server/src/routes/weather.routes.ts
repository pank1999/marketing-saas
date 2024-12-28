import { Router } from 'express';
import { WeatherController } from '../controllers/weather.controller';

const router = Router();
const weatherController = new WeatherController();

router.get('/', weatherController.getWeather.bind(weatherController));

export default router;
