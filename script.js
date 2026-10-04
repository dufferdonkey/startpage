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

// ---------- Search + autosuggest ----------
const SEARCH_URL = "https://duckduckgo.com/?q=";
const SUGGEST_URL = "https://search.dufferdonkey-499.workers.dev/?q=";

const searchBox = document.getElementById("searchBox");

function searchDuckDuckGo() {
  const query = searchBox.value.trim();
  if (query) window.open(SEARCH_URL + encodeURIComponent(query), "_blank");
}

(function setupAutosuggest() {
  const list = document.createElement("ul");
  list.id = "suggest-list";
  list.setAttribute("role", "listbox");
  document.body.appendChild(list);

  let items = [];
  let activeIndex = -1;
  let typedValue = "";
  let controller = null;
  let debounceTimer = null;

  function positionList() {
    const r = searchBox.getBoundingClientRect();
    list.style.left = `${r.left}px`;
    list.style.top = `${r.bottom + 4}px`;
    list.style.width = `${r.width}px`;
  }

  function hide() {
    list.style.display = "none";
    items = [];
    activeIndex = -1;
  }

  function setActive(index) {
    const lis = list.children;
    if (lis[activeIndex]) lis[activeIndex].classList.remove("active");
    activeIndex = index;
    if (index >= 0) {
      lis[index].classList.add("active");
      searchBox.value = items[index];
    } else {
      searchBox.value = typedValue;
    }
  }

  function render(suggestions) {
    items = suggestions;
    activeIndex = -1;
    list.innerHTML = "";
    if (!items.length) return hide();

    items.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      li.setAttribute("role", "option");
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        searchBox.value = text;
        hide();
        searchDuckDuckGo();
      });
      list.appendChild(li);
    });

    positionList();
    list.style.display = "block";
  }

  async function fetchSuggestions(query) {
    if (controller) controller.abort();
    controller = new AbortController();
    try {
      const res = await fetch(SUGGEST_URL + encodeURIComponent(query), {
        signal: controller.signal,
      });
      const data = await res.json();
      // Accepts [{phrase: "..."}] or ["query", ["s1", "s2"]]
      const phrases = Array.isArray(data[1])
        ? data[1]
        : data.map((d) => d.phrase);
      render(phrases.filter((p) => typeof p === "string" && p).slice(0, 8));
    } catch (err) {
      if (err.name !== "AbortError") hide();
    }
  }

  searchBox.addEventListener("input", () => {
    typedValue = searchBox.value;
    const q = typedValue.trim();
    clearTimeout(debounceTimer);
    if (!q) return hide();
    debounceTimer = setTimeout(() => fetchSuggestions(q), 150);
  });

  searchBox.addEventListener("keydown", (e) => {
    const open = list.style.display === "block";

    if (e.key === "Enter") {
      hide();
      searchDuckDuckGo();
    } else if (!open) {
      return;
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(activeIndex + 1 >= items.length ? -1 : activeIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(activeIndex - 1 < -1 ? items.length - 1 : activeIndex - 1);
    } else if (e.key === "Escape") {
      searchBox.value = typedValue;
      hide();
    }
  });

  searchBox.addEventListener("blur", () => setTimeout(hide, 100));
  window.addEventListener("resize", () => {
    if (list.style.display === "block") positionList();
  });
})();
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
