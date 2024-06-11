// background.js
console.log("background is loaded!");

function calculateVectorEntropy(attributes) {
  // Convert the array of attributes to a string separated by '|'
  const vector = attributes.join('|');

  // Search for the vector in the vectors array
  let vector1 = null;
  for (let i = 0; i < vectors.length; i++) {
    const vectorAttributes = vectors[i].split('|');
    if (attributes.every(attr => vectorAttributes.includes(attr))) {
      vector1 = vectors[i];
      break;
    }
  }

  // If the vector is found in the vectors array, retrieve its entropy value
  if (vector1) {
    return entropyValues[vector1];
  } else {
    // If the vector is not found, return a default entropy value (e.g., 0.5)
    return 0.5; // Default value
  }
}

// Function to read the CSV file and retrieve vectors with their entropy values
function readCSVData() {
  fetch("Entropy.csv")
    .then(response => response.text())
    .then(data => {
      const rows = data.split('\n');
      rows.forEach(row => {
        const columns = row.split(',');
        const vector = columns[0].trim();
        const entropy = parseFloat(columns[2]);
        // Store the vector and its corresponding entropy value
        vectors.push(vector);
        entropyValues[vector] = entropy;
      });
    })
    .catch(error => {
      console.error('Error reading CSV file:', error);
    });
}

// Function to get user-set entropy threshold
function getEntropyThreshold(callback) {
  // Retrieve entropy threshold from storage
  browser.storage.local.get('entropyThreshold').then(data => {
    const threshold = data.entropyThreshold;
    if (threshold !== undefined) {
      callback(threshold);
    } else {
      // Default value if threshold not set
      callback(0.5);
    }
  });
}

// Function to set user-set entropy threshold
function setEntropyThreshold(threshold) {
  // Store entropy threshold in storage
  browser.storage.local.set({'entropyThreshold': threshold});
  // Log the new threshold value
  console.log('New threshold value set:', threshold);
}

// Variable to store the entropy threshold
let entropyThreshold = 0.5; // Default value

// Array to store vectors and their corresponding entropy values
let vectors = [];
let entropyValues = {};

// Read CSV data on extension startup
readCSVData();

// Function to block requests if entropy is greater than or equal to the threshold
function blockRequestsIfEntropyGreaterThanThreshold(details) {
  const requestedUrl = details.url;
  const attributes = message.attributes.split('|');
  const vectorEntropy = calculateVectorEntropy(attributes);
  
  if (vectorEntropy >= entropyThreshold) {
    console.log('Blocking request:', requestedUrl);
    return { cancel: true };
  } else {
    return { cancel: false };
  }
}

// Listen for messages from content script
// Array to store attribute-accessed data
let attributeAccessData = {};

// Function to listen for attribute-accessed messages from content script
function listenForAttributeAccess() {
  browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.attributeAccessed){ 
      const scriptSource = message.scriptSource;
      const attribute = message.attributeAccessed;
      console.log('Attribute accessed by this webpage:' + attribute + 'and their source is : ' + scriptSource);
      // If scriptSource already exists in attributeAccessData, push the attribute
      if (!attributeAccessData[scriptSource]) {
        attributeAccessData[scriptSource] = new Set();
      }
      else {
      attributeAccessData[scriptSource].add(attribute);
      }
  }});
}

// Call the function to start listening for messages
listenForAttributeAccess();
console.log('Attribute access data:', attributeAccessData);
    const vectorEntropy = calculateVectorEntropy(attributeAccessData[scriptSource]);
    console.log('vector entropy is :', vectorEntropy);
    // Compare the vector entropy with the threshold
    getEntropyThreshold(function(threshold) {
      if (vectorEntropy <= threshold) {
        console.log('Vector entropy is less than or equal to the threshold. we pass requests');
        // Perform action if needed
      } else {
        console.log('Vector entropy is greater than the threshold. we block it ');
        // Listen for API requests and block those containing vectors with entropy less than or equal to the threshold
        
      }




      
   if (message.getEntropyThreshold) {
    // Send the entropy threshold to the popup script
    sendResponse({ threshold: entropyThreshold });
  } else if (message.setEntropyThreshold) {
    // Set the entropy threshold
    entropyThreshold = message.setEntropyThreshold;
    // Store the threshold in storage and log the new value
    setEntropyThreshold(entropyThreshold);
  }
});