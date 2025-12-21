// Clock functionality
function updateClock() {
  const clock = document.getElementById("clock");
  const dateEl = document.getElementById("date");
  const now = new Date();
  
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = String(hours % 12 || 12).padStart(2, '0');
  
  clock.textContent = `${displayHours}:${minutes}:${seconds} ${ampm}`;
  
  // Date and Day
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateEl.textContent = now.toLocaleDateString('en-US', options);
}

// Weather functionality with auto-location
const API_KEY = 'a40806000b9428bb10bb1e2709af4af5'; // Replace with your actual API key

async function updateWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        
        const temp = Math.round(data.main.temp);
        const description = data.weather[0].description;
        const location = data.name;
        
        document.getElementById('weather-temp').textContent = `${temp}°C`;
        document.getElementById('weather-desc').textContent = description;
        document.getElementById('weather-location').textContent = location;
      } catch (error) {
        console.error('Error fetching weather:', error);
        document.getElementById('weather-temp').textContent = 'Weather unavailable';
      }
    }, (error) => {
      console.error('Geolocation error:', error);
      document.getElementById('weather-temp').textContent = 'Location access denied';
    });
  } else {
    document.getElementById('weather-temp').textContent = 'Geolocation not supported';
  }
}

// Call weather function on page load
updateWeather();
// Update weather every 30 minutes
setInterval(updateWeather, 1800000);

// Google search functionality
function searchGoogle() {
  const query = document.getElementById("searchBox").value.trim();
  if (query) {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
    // Clear the search box after searching
    document.getElementById("searchBox").value = "";
  }
}

// Allow Enter key to trigger search
function handleKeyPress(event) {
  if (event.key === "Enter") {
    searchGoogle();
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
  // Start the clock
  updateClock();
  setInterval(updateClock, 1000);
  
  // Add Enter key support to search box
  const searchBox = document.getElementById("searchBox");
  if (searchBox) {
    searchBox.addEventListener("keypress", handleKeyPress);
    // Focus on search box when page loads
    searchBox.focus();
  }
});

// Optional: Add keyboard shortcut to focus search box (Ctrl + K or Cmd + K)
document.addEventListener("keydown", function(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === "k") {
    event.preventDefault();
    const searchBox = document.getElementById("searchBox");
    if (searchBox) {
      searchBox.focus();
      searchBox.select();
    }
  }
});
