import axios from "axios";
import WeatherType from "../type/WeatherType";
import WeatherModel from "../model/WeatherModel";

export default class OpenWeather {
    static fetch(): Promise<WeatherType> {
        return axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${process.env.OPEN_WEATHER_LAT}&lon=${process.env.OPEN_WEATHER_LON}&APPID=${process.env.OPEN_WEATHER_API_KEY}&units=metric`)
            .then(response => response.data)
            .catch(error => {
                console.error(error);
                return null;
            });
    }

    static fetchAndSave(): Promise<WeatherModel> {
        return this.fetch()
            .then(weather => {
                console.log(weather);
                if (weather) {
                    return WeatherModel.create({
                        temperature: weather.main.temp,
                        city: weather.name,
                        measuredAt: new Date()
                    });
                }
            });
    }
}
