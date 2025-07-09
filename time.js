function updateClock() {
  const clock = document.getElementById("clock");
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function searchGoogle() {
  const query = document.getElementById("searchBox").value.trim();
  if (query) {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
  }
}

setInterval(updateClock, 1000);
updateClock();
