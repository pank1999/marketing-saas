export enum ConditionType {
  TIME_OF_DAY = 'TIME_OF_DAY',
  WEATHER = 'WEATHER',
  TEMPERATURE = 'TEMPERATURE',
}

export interface Condition {
  id: number;
  type: ConditionType;
  value: string;
  variation: string;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConditionDto {
  type: ConditionType;
  value: string;
  variation: string;
  projectId: number;
}

export const TIME_OF_DAY_OPTIONS = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'];

export const WEATHER_OPTIONS = ['SUNNY', 'CLOUDY', 'RAINY', 'SNOWY'];

export const TEMPERATURE_RANGES = [
  'BELOW_0C',
  '0C_TO_15C',
  '15C_TO_25C',
  'ABOVE_25C',
];
