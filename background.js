console.log("background is loaded!");

let entropyThreshold = 0.5; // Default value
let currentMode = 'entropy'; // Default mode: 'entropy' or 'random'

function getEntropyThreshold(callback) {
  browser.storage.local.get('entropyThreshold').then(data => {
    const threshold = data.entropyThreshold;
    if (threshold !== undefined) {
      entropyThreshold = threshold;
      callback(threshold);
    } else {
      callback(entropyThreshold);
    }
  });
}

function setEntropyThreshold(threshold) {
  entropyThreshold = threshold;
  browser.storage.local.set({'entropyThreshold': threshold});
  console.log('New threshold value set:', threshold);
}

function setMode(mode) {
  currentMode = mode;
  browser.storage.local.set({'currentMode': mode});
  console.log('New mode set:', mode);
}

function listenForMessages() {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.getEntropyThreshold) {
      getEntropyThreshold(threshold => sendResponse({ threshold: threshold }));
      return true; // Indicates that the response is sent asynchronously
    } else if (message.setEntropyThreshold) {
      setEntropyThreshold(message.setEntropyThreshold);
    } else if (message.setMode) {
      setMode(message.setMode);
    } else if (message.getMode) {
      browser.storage.local.get('currentMode').then(data => {
        sendResponse({ mode: data.currentMode || currentMode });
      });
      return true;
    } else if (message.action === "updateScriptCounts") {
      // Forward the script counts to the popup if it's open
      browser.runtime.sendMessage(message);
    }
  });
}

// Initialize mode from storage
browser.storage.local.get('currentMode').then(data => {
  if (data.currentMode) {
    currentMode = data.currentMode;
  }
});

listenForMessages();