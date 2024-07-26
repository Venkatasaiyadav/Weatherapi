const express = require('express');
const app = express();
const request = require('request');
const path = require('path');

app.use(express.static('public'));

const apiKey = '40c7caafab6965a34cb70dc07118bf25';

app.get('/', (req, res) => {
    const location = req.query.location;

    if (!location) {
        res.render('index.ejs', {
            location: null,
            currentTemp: null,
            currentCondition: null,
            currentEmoji: null,
            currentImage: null,
            tomorrowTemp: null,
            tomorrowCondition: null,
            tomorrowEmoji: null,
            tomorrowImage: null
        });
        return;
    }

    const currentWeatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
    const forecastWeatherUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;

    request(currentWeatherUrl, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const currentWeatherData = JSON.parse(body);
            const currentTemp = currentWeatherData.main.temp;
            const currentCondition = currentWeatherData.weather[0].description;
            const currentEmoji = getWeatherEmoji(currentCondition);
            const currentImage = getWeatherImage(currentCondition);

            request(forecastWeatherUrl, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    const forecastWeatherData = JSON.parse(body);
                    const tomorrowWeather = forecastWeatherData.list[8]; // Assuming 3-hour intervals, 8 * 3 = 24 hours
                    const tomorrowTemp = tomorrowWeather.main.temp;
                    const tomorrowCondition = tomorrowWeather.weather[0].description;
                    const tomorrowEmoji = getWeatherEmoji(tomorrowCondition);
                    const tomorrowImage = getWeatherImage(tomorrowCondition);

                    res.render('index.ejs', {
                        location,
                        currentTemp,
                        currentCondition,
                        currentEmoji,
                        currentImage,
                        tomorrowTemp,
                        tomorrowCondition,
                        tomorrowEmoji,
                        tomorrowImage
                    });
                } else {
                    res.render('index.ejs', {
                        location,
                        currentTemp,
                        currentCondition,
                        currentEmoji,
                        currentImage,
                        tomorrowTemp: 'N/A',
                        tomorrowCondition: 'N/A',
                        tomorrowEmoji: '❓',
                        tomorrowImage: '/default.jpg'
                    });
                }
            });
        } else {
            res.render('index.ejs', {
                location: 'Not Found',
                currentTemp: 'N/A',
                currentCondition: 'N/A',
                currentEmoji: '❓',
                currentImage: '/default.jpg',
                tomorrowTemp: 'N/A',
                tomorrowCondition: 'N/A',
                tomorrowEmoji: '❓',
                tomorrowImage: '/default.jpg'
            });
        }
    });
});

function getWeatherEmoji(condition) {
    if (condition.includes('rain')) return '🌧️';
    if (condition.includes('cloud') || condition.includes('overcast')) return '☁️';
    if (condition.includes('sun') || condition.includes('clear')) return '☀️';
    if (condition.includes('wind')) return '💨';
    if (condition.includes('mist') || condition.includes('fog')) return '🌫️';
    // Add more conditions and emojis as needed
    return '❓';
}

function getWeatherImage(condition) {
    if (condition.includes('rain')) {
        return '/rainy.jpg';
    } else if (condition.includes('cloud') || condition.includes('overcast')) {
        return '/cloudy.jpeg';
    } else if (condition.includes('sun') || condition.includes('clear')) {
        return '/sunny.jpeg';
    } else if (condition.includes('wind')) {
        return '/windy.jpeg';
    } else if (condition.includes('mist') || condition.includes('fog')) {
        return '/misty.jpg';
    } else {
        // Add more conditions and images as needed
        return '/default.jpeg';
    }
}


const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
