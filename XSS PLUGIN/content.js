console.log("Content script loaded and running.");

// Function to send a message to background.js
function sendMessageToBackground(message) {
  browser.runtime.sendMessage(message); // Use chrome.runtime for Chrome
  // browser.runtime.sendMessage(message); // Use browser.runtime for Firefox
}

// Listen for the __taintreport event on the window object
window.addEventListener('__taintreport', function(event) {
  console.log("Event caught in content script:", event.detail);
  
  // Send the event data to background.js
  sendMessageToBackground({
    type: 'taint_report',
    data: event.detail
  });
});
