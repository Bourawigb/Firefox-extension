console.log("background is loaded!");

let entropyThreshold = 0.5; // Default value
let currentMode = 'entropy'; // Default mode: 'entropy' or 'random'
let entropies = {};


// Function to read entropy data from CSV
function readCSVData() {
  return fetch(browser.runtime.getURL("./data/Entropy.csv"))
    .then(response => response.text())
    .then(data => {
      const rows = data.split('\n');
      rows.forEach(row => {
        const columns = row.split(',');
        const vector = columns[0].trim();
        const entropy = parseFloat(columns[2]);
        entropies[vector] = entropy;
      });
      console.log("Entropy data loaded successfully");
      // Store entropy data in local storage
      browser.storage.local.set({ entropyData: entropies });
    })
    .catch(error => {
      console.error('Error reading CSV file:', error);
    });
}

// Load entropy data when the background script starts
readCSVData().then(() => {
  console.log("Entropy data loaded and ready to be sent to content scripts");
});





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
      return true;
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
      browser.runtime.sendMessage(message);
    } else if (message.getEntropyData) {
      sendResponse({ entropies: entropies });
      return true;
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