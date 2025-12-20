// Clock functionality
function updateClock() {
  const clock = document.getElementById("clock");
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' ,
    second: '2-digit'
  });
}

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
