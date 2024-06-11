console.log("injectjs is loaded!");

// Function to report access to content script
function reportAccess(property) {
  window.postMessage({ type: 'reportAccess', property }, '*');
}

// Overwrite `screen.width` getter
Object.defineProperty(window.screen, 'width', {
  get: function() {
    console.log('Access to screen.width is detected');
    reportAccess('screen.width');
    return window.screen.width;
  }
});

// Listen for messages to block access
window.addEventListener('message', (event) => {
  if (event.source !== window || !event.data || event.data.type !== 'blockAccess') {
    return;
  }

  if (event.data.property === 'screen.width') {
    console.log('Access to screen.width is blocked');
    // Implement any additional blocking logic if needed
  }
});
