console.log("Content script loaded successfully!");

let entropyThreshold;
let entropies = {};

// Function to read entropy data from CSV
function readCSVData() {
    return fetch("http://localhost:8000/Entropy.csv")
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n'); // Fixing the escape character
            rows.forEach(row => {
                const columns = row.split(',');
                const vector = columns[0].trim();
                const entropy = parseFloat(columns[2]);
                entropies[vector] = entropy;
            });
        })
        .catch(error => {
            console.error('Error reading CSV file:', error);
        });
}

// Function to request entropy threshold from the background script
function requestEntropyThreshold() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ getEntropyThreshold: true }, response => {
            if (response && response.threshold !== undefined) {
                entropyThreshold = response.threshold;
                resolve();
            } else {
                reject('Failed to get entropy threshold');
            }
        });
    });
}


// Function to inject the monitoring script
function injectMonitoringScript(threshold, entropies) {
    const scriptContent = `
        (function() {
            let entropyValues = ${JSON.stringify(entropies)};
            let entropyThreshold = ${threshold};
            let attributeAccessData = {};
            console.log("Entropy values:", entropyValues);
            console.log("Entropy threshold:", entropyThreshold);

            function calculateVectorEntropy(attributes) {
            // Normalize a vector by splitting, trimming, sorting, and joining
            function normalizeVector(vector) {
                return vector.split('|').map(attr => attr.trim()).sort().join('|');
            }

            // Normalize the input attributes
            const normalizedAttributes = normalizeVector(attributes.join('|'));

            // Iterate over each key in the entropyValues table
            for (const key in entropyValues) {
                if (entropyValues.hasOwnProperty(key)) {
                    // Normalize the key from the entropyValues table
                    const normalizedKey = normalizeVector(key);

                    // Compare the normalized key with the normalized input attributes
                    if (normalizedKey === normalizedAttributes) {
                        // If they match, return the corresponding entropy value
                        return entropyValues[key];
                    }
                }
            }

            // Log the new vector and return the default entropy value for new vectors
            logNewVector(normalizedAttributes);
            return 0.99;
        }
            function logNewVector(vector) {
                const logEntry = vector + '\\n';
                fetch('http://localhost:8000/Logvectors.txt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: logEntry
                }).catch(error => {                      
                    console.error('Error logging vector:', error);
                });
            }


            function reportAccess(attribute, scriptSource) {
                let allowAccess = false;
                if (attribute && scriptSource) {
                    if (!attributeAccessData[scriptSource]) {
                        attributeAccessData[scriptSource] = new Set();
                    }
                    attributeAccessData[scriptSource].add(attribute);

                    const attributes = Array.from(attributeAccessData[scriptSource]);
                    const vectorEntropy = calculateVectorEntropy(attributes);
                    console.log('Vector ', attributes.join("|"), ' entropy for', scriptSource, 'is:', vectorEntropy, ' and its:', entropyValues[attributes.join("|")]);

                    allowAccess = vectorEntropy <= entropyThreshold;
                }

                if (allowAccess) {
                    console.log('Access allowed for attribute:', attribute, 'from script:', scriptSource);
                    return true; // Access granted
                } else {
                    console.log('Access denied for attribute:', attribute, 'from script:', scriptSource);
                    return false; // Access denied
                }
            }

            function hookMethod(obj, method, objName) {
                const originalMethod = obj[method];
                obj[method] = function() {

                    // Get all script elements
                    const scripts = document.getElementsByTagName('script');
                    // Get the last script element (currently executing script)
                    const currentScript = scripts[scripts.length - 1];
                    // Log the URL of the currently executing script
                    if (currentScript.src=""){
                                    currentScript.src=window.location.href;
                                }    
                    if (reportAccess(objName + '.' + method, currentScript.src)) {
                        return originalMethod.apply(this, arguments);
                    } else {
                        console.log('Blocked access to method:', objName + '.' + method);
                    }
                };
            }

            function hookProperty(obj, prop, objName) {
                let originalValue = obj[prop];
                Object.defineProperty(obj, prop, {
                    get: function() {

                        // Get all script elements
                        const scripts = document.getElementsByTagName('script');
                        // Get the last script element (currently executing script)
                        const currentScript = scripts[scripts.length - 1];
                        if (currentScript.src=""){
                                    currentScript.src=window.location.href;
                                }    

                        if (reportAccess(objName + '.' + prop, currentScript.src)) {
                            return originalValue;
                        } else {
                            console.log('Blocked access to property:', objName + '.' + prop);
                            return undefined;
                        }
                    },
                    set: function(value) {
                        if (reportAccess(objName + '.' + prop, currentScript.src)) {
                            originalValue = value;
                        } else {
                            console.log('Blocked access to property:', objName + '.' + prop);
                        }
                    }
                });
            }

            function hookPropertyaudio(obj, prop, objName) {
                const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
                if (descriptor && descriptor.get) {
                    const originalGetter = descriptor.get;
                    Object.defineProperty(obj, prop, {
                        get: function() {
                                // Get all script elements
                                const scripts = document.getElementsByTagName('script');
                                // Get the last script element (currently executing script)
                                const currentScript = scripts[scripts.length - 1];
                                if (currentScript.src=""){
                                    currentScript.src=window.location.href;
                                }                        
                            if (reportAccess(objName + '.' + prop, currentScript.src)) {
                                return originalGetter.call(this);
                            } else {
                                console.log('Blocked access to property:', objName + '.' + prop);
                                return undefined;
                            }
                        }
                    });
                }
            }


            function hookAllProperties(obj, objName) {
                for (let prop in obj) {
                    hookProperty(obj, prop, objName);
                }
            }
            hookAllProperties(screen, 'screen');
            hookAllProperties(navigator, 'navigator');
            hookProperty(HTMLCanvasElement.prototype, 'toDataURL', 'HTMLCanvasElement');
            // Hook additional properties if they exist
            if (window.BaseAudioContext) {
                hookPropertyaudio(BaseAudioContext.prototype, 'sampleRate', 'BaseAudioContext');
                hookPropertyaudio(BaseAudioContext.prototype, 'currentTime', 'BaseAudioContext');
                hookPropertyaudio(BaseAudioContext.prototype, 'state', 'BaseAudioContext');
            }
            if (window.AudioContext) {
                hookPropertyaudio(AudioContext.prototype, 'baseLatency', 'AudioContext');
                hookPropertyaudio(AudioContext.prototype, 'outputLatency', 'AudioContext');
            }
            if (window.AudioDestinationNode) {
                hookPropertyaudio(AudioDestinationNode.prototype, 'maxChannelCount', 'AudioDestinationNode');
            }
            if (window.AudioNode) {
                hookPropertyaudio(AudioNode.prototype, 'channelCount', 'AudioNode');
                hookPropertyaudio(AudioNode.prototype, 'numberOfInputs', 'AudioNode');
                hookPropertyaudio(AudioNode.prototype, 'numberOfOutputs', 'AudioNode');
            }

        })();
    `;

    const script = document.createElement('script');
    script.textContent = scriptContent;
    document.documentElement.appendChild(script);
    script.remove();
}

// Main function to orchestrate the order of execution
async function main() {
    await readCSVData();
    await requestEntropyThreshold();
    injectMonitoringScript(entropyThreshold, entropies);
}
main();

// Listen for messages (if necessary, for future enhancements)
window.addEventListener('message', function(event) {
    // You can handle messages here if necessary
});
