console.log("background is loaded!");

function getEntropyThreshold(callback) {
  browser.storage.local.get('entropyThreshold').then(data => {
    const threshold = data.entropyThreshold;
    if (threshold !== undefined) {
      callback(threshold);
    } else {
      callback(0.5); // Default threshold
    }
  });
}

function setEntropyThreshold(threshold) {
  browser.storage.local.set({'entropyThreshold': threshold});
  console.log('New threshold value set:', threshold);
}


let entropyThreshold = 0.5; // Default value

function listenForAttributeAccess() {
  browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.getEntropyThreshold) {
      sendResponse({ threshold: entropyThreshold });
    } else if (message.setEntropyThreshold) {
      entropyThreshold = message.setEntropyThreshold;
      setEntropyThreshold(entropyThreshold);
    }
       
  });
}



listenForAttributeAccess();
