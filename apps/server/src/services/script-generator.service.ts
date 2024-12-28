import { ConditionType } from '@prisma/client';

interface Condition {
  type: ConditionType;
  value: string;
  variation: string;
}

export class ScriptGenerator {
  private generateUrlValidation(allowedUrls: string[]): string {
    return `
      function isUrlAllowed() {
        const currentHost = window.location.hostname;
        const allowedUrls = ${JSON.stringify(allowedUrls)};
        
        return allowedUrls.some(url => {
          // Convert wildcards to regex pattern
          const pattern = url
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*');
          const regex = new RegExp('^' + pattern + '$');
          return regex.test(currentHost);
        });
      }

      if (!isUrlAllowed()) {
        console.error('This script is not authorized to run on this domain.');
        return;
      }
    `;
  }

  private generateTimeCheck(value: string, variation: string): string {
    return `
      function checkTime() {
        const hour = new Date().getHours();
        switch('${value}') {
          case 'MORNING':
            return hour >= 5 && hour < 12 ? '${variation}' : '';
          case 'AFTERNOON':
            return hour >= 12 && hour < 17 ? '${variation}' : '';
          case 'EVENING':
            return hour >= 17 && hour < 22 ? '${variation}' : '';
          case 'NIGHT':
            return (hour >= 22 || hour < 5) ? '${variation}' : '';
          default:
            return '';
        }
      }
    `;
  }

  private generateWeatherCheck(value: string, variation: string): string {
    return `
      async function checkWeather() {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            \`/api/weather?lat=\${latitude}&lon=\${longitude}\`
          );
          
          if (!response.ok) return '';
          
          const { weather } = await response.json();
          
          switch('${value}') {
            case 'SUNNY':
              return weather === 'CLEAR' ? '${variation}' : '';
            case 'CLOUDY':
              return weather === 'CLOUDS' ? '${variation}' : '';
            case 'RAINY':
              return weather === 'RAIN' ? '${variation}' : '';
            case 'SNOWY':
              return weather === 'SNOW' ? '${variation}' : '';
            default:
              return '';
          }
        } catch (error) {
          console.error('Weather check failed:', error);
          return '';
        }
      }
    `;
  }

  private generateTemperatureCheck(value: string, variation: string): string {
    return `
      async function checkTemperature() {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            \`/api/weather?lat=\${latitude}&lon=\${longitude}\`
          );
          
          if (!response.ok) return '';
          
          const { temperature } = await response.json();
          
          switch('${value}') {
            case 'BELOW_0C':
              return temperature < 0 ? '${variation}' : '';
            case '0C_TO_15C':
              return temperature >= 0 && temperature < 15 ? '${variation}' : '';
            case '15C_TO_25C':
              return temperature >= 15 && temperature < 25 ? '${variation}' : '';
            case 'ABOVE_25C':
              return temperature >= 25 ? '${variation}' : '';
            default:
              return '';
          }
        } catch (error) {
          console.error('Temperature check failed:', error);
          return '';
        }
      }
    `;
  }

  public generateScript(
    conditions: Condition[],
    allowedUrls: string[]
  ): string {
    const functionDefinitions = conditions.map((condition) => {
      switch (condition.type) {
        case ConditionType.TIME_OF_DAY:
          return this.generateTimeCheck(condition.value, condition.variation);
        case ConditionType.WEATHER:
          return this.generateWeatherCheck(
            condition.value,
            condition.variation
          );
        case ConditionType.TEMPERATURE:
          return this.generateTemperatureCheck(
            condition.value,
            condition.variation
          );
        default:
          return '';
      }
    });

    const script = `
      (async function() {
        ${this.generateUrlValidation(allowedUrls)}
        ${functionDefinitions.join('\n')}

        async function checkAllConditions() {
          const results = await Promise.all([
            ${conditions
              .map((condition) => {
                switch (condition.type) {
                  case ConditionType.TIME_OF_DAY:
                    return 'checkTime()';
                  case ConditionType.WEATHER:
                    return 'checkWeather()';
                  case ConditionType.TEMPERATURE:
                    return 'checkTemperature()';
                  default:
                    return "''";
                }
              })
              .join(',\n            ')}
          ]);

          const variation = results.find(result => result !== '');
          if (variation) {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('variation', variation);
            window.history.replaceState({}, '', currentUrl.toString());
          }
        }

        // Check conditions immediately and every 5 minutes
        checkAllConditions();
        setInterval(checkAllConditions, 5 * 60 * 1000);
      })();
    `;

    return script;
  }
}
