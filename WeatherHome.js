let temp = null;
let countryy = null;
let wind_speed = null;
let uv_index = null;
let cloudcover = null;
let uv_index_ranking = null;
let feels_like = null;
let currentTime = null;
let hour = null;
let forecastContainer = null;

// OpenWeather API Key
const apiKey = ""; // Replace with your API Key

// Function to get weather data based on user input
async function getData(location) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=imperial`; // Fetch in Fahrenheit

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        console.log(json);

        if (!json.main) {
            throw new Error("Invalid location. Please try again.");
        }

        // Temperature
        temp = json.main.temp;
        document.getElementById('weather-temp').innerHTML = `${temp}°F`;

        // Country & City
        countryy = json.sys.country;
        document.getElementById('country').innerHTML = `Country: ${countryy}`;
        document.getElementById('city').innerHTML = `City: ${json.name}`;

        // Feels Like Temperature
        feels_like = json.main.feels_like;
        document.getElementById('feels-like').innerHTML = `True Feel: ${feels_like}°F`;

        // Local Time (Estimate based on UTC offset)
        const timezoneOffset = json.timezone; // Seconds offset from UTC
        const localTime = new Date(Date.now() + timezoneOffset * 1000);
        hour = localTime.getHours();

        // Cloud Cover
        cloudcover = json.clouds.all; // OpenWeather uses percentage (0-100)
        document.getElementById("cloudcover").innerHTML = `Cloud Cover: ${cloudcover}%`;

        // Set Background Image Based on Cloud Cover & Time
        let backgroundImage = "";

        if (hour >= 6 && hour < 18) { // Daytime
            if (cloudcover <= 5) {
                backgroundImage = "url('DayClearSkies.jpg')";
            } else if (cloudcover <= 25) {
                backgroundImage = "url('PartlyCloudyDay.jpg')";
            } else if (cloudcover <= 50) {
                backgroundImage = "url('CloudySkiesDay.avif')";
            } else {
                backgroundImage = "url('cloudyday.jpg')";
            }
        } else { // Nighttime
            if (cloudcover <= 5) {
                backgroundImage = "url('ClearSkiesNight.jpeg')";
            } else if (cloudcover <= 25) {
                backgroundImage = "url('PartlyCloudyNight.webp')";
            } else if (cloudcover <= 50) {
                backgroundImage = "url('CloudySkiesNight.webp')";
            } else {
                backgroundImage = "url('cloudynight.jpg')";
            }
        }

        document.body.style.backgroundImage = backgroundImage;
        document.body.style.backgroundSize = "cover"; 
        document.body.style.backgroundPosition = "center"; 

        // Wind Speed
        wind_speed = json.wind.speed; // OpenWeather uses mph
        document.getElementById("wind_speed").innerHTML = `Wind Speed: ${wind_speed} mph`;

        // UV Index (Requires One Call API - See Below)
        await getUVIndex(json.coord.lat, json.coord.lon);

    } catch (error) {
        console.error(error.message);
        alert(error.message);
    }
}

// Get UV Index (Requires One Call API)
async function getUVIndex(lat, lon) {
    const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    try {
        const response = await fetch(uvUrl);
        const data = await response.json();

        uv_index = data.value;
        let uv_index_ranking = "";

        if (uv_index <= 2) {
            uv_index_ranking = "Low";
        } else if (uv_index <= 5) {
            uv_index_ranking = "Moderate";
        } else if (uv_index <= 7) {
            uv_index_ranking = "High";
        } else if (uv_index <= 10) {
            uv_index_ranking = "Very High";
        } else {
            uv_index_ranking = "Extreme";
        }

        document.getElementById("uv_index").innerHTML = `UV: ${uv_index}`;
        document.getElementById("uv_index_rating").innerHTML = `UV Rating: ${uv_index_ranking}`;

    } catch (error) {
        console.error("Failed to fetch UV Index:", error);
    }
}

// Function to handle user input and update the weather
document.getElementById("searchBtn").addEventListener("click", function () {
    let userLocation = document.getElementById("whereL").value.trim();
    if (userLocation !== "") {
        getData(userLocation);
    } else {
        alert("Please enter a location!");
    }
});


async function getForecast(location) {
    const apiKey = "a4ea281ff0a6f88d0ca990438123fee4"; // Replace with your API key
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=imperial`;

    try {
        const response = await fetch(forecastUrl);
        if (!response.ok) {
            throw new Error(`Forecast API Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Forecast Data:", data); // Debugging

        let forecastContainer = document.getElementById("forecast");

        // Check if forecastContainer exists
        if (!forecastContainer) {
            console.error("Forecast container not found in the HTML!");
            return;
        }

     // Reset old data

        let dailyForecasts = {};

        // Group data by day (since API gives 3-hour intervals)
        data.list.forEach((entry) => {
            let date = new Date(entry.dt * 1000).toDateString();
            
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = {
                    temp: Math.round(entry.main.temp),
                    description: entry.weather[0].description,
                    icon: entry.weather[0].icon
                };
            }
        });

        // Display up to 7 days of forecast
        Object.keys(dailyForecasts).slice(1, 7).forEach((date) => {
            let { temp, description, icon } = dailyForecasts[date];

            let forecastItem = document.createElement("div");
            forecastItem.classList.add("forecast-item");

            forecastItem.innerHTML = `
                <p><strong>${date}</strong></p>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
                <p>Temp: ${temp}°F</p>
                <p>Condition: ${description}</p>
                <hr>`;
            forecastContainer.appendChild(forecastItem);
        });

		async function getHourlyForecast(location) {
			const apiKey = "a4ea281ff0a6f88d0ca990438123fee4"; // Your API Key
			const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=imperial`;
		
			try {
				const response = await fetch(forecastUrl);
				if (!response.ok) {
					throw new Error(`Hourly Forecast API Error: ${response.status}`);
				}
		
				const data = await response.json();
				console.log("Hourly Forecast Data:", data); // Debugging
		
				let hourlyContainer = document.getElementById("hourly-forecast");
				if (!hourlyContainer) {
					console.error("Hourly forecast container not found in the HTML!");
					return;
				}
		
		
		
				// Display next 8 intervals (24 hours)
				for (let i = 0; i < 8; i++) {
					let entry = data.list[i];
					let time = new Date(entry.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
					let temp = Math.round(entry.main.temp);
					let description = entry.weather[0].description;
					let icon = entry.weather[0].icon;
		
					let hourlyItem = document.createElement("div");
					hourlyItem.classList.add("hourly-item");
		
					hourlyItem.innerHTML = `
						<p><strong>${time}</strong></p>
						<img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
						<p>${temp}°F</p>
						<p>${description}</p>
					`;
		
					hourlyContainer.appendChild(hourlyItem);
				}
		
			} catch (error) {
				console.error("Error fetching hourly forecast:", error);
				document.getElementById("hourly-forecast").innerHTML = `<p>Error loading hourly forecast.</p>`;
			}
		}
		
		// Call function when user searches
		document.getElementById("searchBtn").addEventListener("click", function () {
			let userLocation = document.getElementById("whereL").value.trim();
			if (userLocation !== "") {
				getHourlyForecast(userLocation);
			}
		});
		
		// Load default location
		getHourlyForecast("Slippery Rock, Pennsylvania");
		

    } catch (error) {
        console.error("Error fetching forecast:", error);
        document.getElementById("forecast").innerHTML = `<p>Error loading forecast.</p>`;
    }
}




// Default location when page loads
getData("Slippery Rock, Pennsylvania");
getForecast("Slippery Rock, Pennsylvania");


