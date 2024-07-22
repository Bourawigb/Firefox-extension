console.log("background is loaded!");

function calculateVectorEntropy(attributes) {
  const vector = attributes.join('|');

  if (entropyValues[vector] !== undefined) {
    return entropyValues[vector];
  } else {
    logNewVector(vector);
    return 0; // Default entropy value for new vectors
  }
}

function logNewVector(vector) {
  const logEntry = vector + '\n';
  fetch('logVectors', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain'
    },
    body: logEntry
  }).catch(error => {
    console.error('Error logging vector:', error);
  });
}

function readCSVData() {
  fetch("Entropy.csv")
    .then(response => response.text())
    .then(data => {
      const rows = data.split('\n');
      rows.forEach(row => {
        const columns = row.split(',');
        const vector = columns[0].trim();
        const entropy = parseFloat(columns[2]);
        entropyValues[vector] = entropy;
      });
    })
    .catch(error => {
      console.error('Error reading CSV file:', error);
    });
}

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
let entropyValues = {};

readCSVData();

let attributeAccessData = {};

function listenForAttributeAccess() {
  browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.attributeAccessed) {
      const scriptSource = message.scriptSource;
      const attribute = message.attributeAccessed;
      console.log('Attribute accessed by this webpage:', attribute, 'and their source is:', scriptSource);

      if (!attributeAccessData[scriptSource]) {
        attributeAccessData[scriptSource] = new Set();
      }
      attributeAccessData[scriptSource].add(attribute);
      const attributes = Array.from(attributeAccessData[scriptSource]);
      const vectorEntropy = calculateVectorEntropy(attributes);
      console.log('Vector entropy for', scriptSource, ' is:', vectorEntropy);

    } else if (message.checkEntropy) {
      const attribute = message.attribute;
      const scriptSource = message.scriptSource;
      
      if (!attributeAccessData[scriptSource]) {
        attributeAccessData[scriptSource] = new Set();
      }
      attributeAccessData[scriptSource].add(attribute);
      
      const attributes = Array.from(attributeAccessData[scriptSource]);
      const vectorEntropy = calculateVectorEntropy(attributes);
      console.log(' entropy for', scriptSource, ' that demanding is:', vectorEntropy);

      getEntropyThreshold(threshold => {
        sendResponse({ allowAccess: vectorEntropy <= threshold });
      });

      return true; // Keep the message channel open for sendResponse
    } else if (message.getEntropyThreshold) {
      sendResponse({ threshold: entropyThreshold });
    } else if (message.setEntropyThreshold) {
      entropyThreshold = message.setEntropyThreshold;
      setEntropyThreshold(entropyThreshold);
    }
       
  });
}



listenForAttributeAccess();
console.log('Attribute access data:', attributeAccessData);
