console.log("Content script loaded and running.");

// Inject the script into the page after DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const script = document.createElement('script');
  script.src = browser.runtime.getURL('inject.js');
  (document.head || document.documentElement).appendChild(script);
});

// Listen for messages from the injected script
window.addEventListener('message', async (event) => {
  if (event.source !== window || !event.data || event.data.type !== 'reportAccess') {
    return;
  }

  try {
    const response = await browser.runtime.sendMessage(event.data);
    if (response && response.block) {
      window.postMessage({ type: 'blockAccess', property: event.data.property }, '*');
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
});
