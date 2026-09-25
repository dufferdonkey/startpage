// ---------- Clock & Date ----------
function updateClock() {
  const now = new Date();

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  document.getElementById("clock").textContent = time;

  const date = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  document.getElementById("date").textContent = date;
}

setInterval(updateClock, 1000);
updateClock();

// ---------- Weather (Open-Meteo, no API key needed) ----------
function weatherCodeToInfo(code) {
  const map = {
    0: ["Clear sky", "☀️"],
    1: ["Mainly clear", "🌤️"],
    2: ["Partly cloudy", "⛅"],
    3: ["Overcast", "☁️"],
    45: ["Fog", "🌫️"],
    48: ["Fog", "🌫️"],
    51: ["Light drizzle", "🌦️"],
    53: ["Drizzle", "🌦️"],
    55: ["Dense drizzle", "🌧️"],
    61: ["Light rain", "🌧️"],
    63: ["Rain", "🌧️"],
    65: ["Heavy rain", "🌧️"],
    71: ["Light snow", "🌨️"],
    73: ["Snow", "🌨️"],
    75: ["Heavy snow", "❄️"],
    80: ["Rain showers", "🌦️"],
    81: ["Rain showers", "🌦️"],
    82: ["Violent showers", "⛈️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm w/ hail", "⛈️"],
    99: ["Thunderstorm w/ hail", "⛈️"],
  };
  return map[code] || ["Unknown", "🌡️"];
}

async function loadWeather(lat, lon) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    const data = await res.json();
    const temp = Math.round(data.current_weather.temperature);
    const code = data.current_weather.weathercode;
    const [desc, icon] = weatherCodeToInfo(code);

    document.getElementById("weather-temp").textContent = `${temp}°C`;
    document.getElementById("weather-desc").textContent = desc;
    document.getElementById("weather-icon").textContent = icon;

    // Optional reverse geocoding for a location name
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}`
    );
    const geoData = await geoRes.json();
    const place = geoData.results?.[0];
    if (place) {
      document.getElementById("weather-location").textContent = `${place.name}, ${place.country_code || ""}`;
    }
  } catch (err) {
    document.getElementById("weather-desc").textContent = "Weather unavailable";
    document.getElementById("weather-icon").textContent = "⚠️";
  }
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) => loadWeather(pos.coords.latitude, pos.coords.longitude),
    () => {
      document.getElementById("weather-desc").textContent = "Location denied";
      document.getElementById("weather-icon").textContent = "📍";
    }
  );
} else {
  document.getElementById("weather-desc").textContent = "Geolocation unsupported";
}

// ---------- Search ----------
function searchDuckDuckGo() {
  const query = document.getElementById("searchBox").value.trim();
  if (query) {
    window.open(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, "_blank");
  }
}

document.getElementById("searchBox").addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchDuckDuckGo();
});

// ---------- Dropdown menus ----------
document.addEventListener("DOMContentLoaded", () => {
  const toggles = document.querySelectorAll(".dropdown-toggle");

  toggles.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const menu = btn.nextElementSibling;
      const isOpen = menu.classList.contains("open");

      document.querySelectorAll(".dropdown-menu.open").forEach((m) => {
        if (m !== menu) m.classList.remove("open");
      });

      menu.classList.toggle("open", !isOpen);
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-menu.open").forEach((m) =>
      m.classList.remove("open")
    );
  });
});
