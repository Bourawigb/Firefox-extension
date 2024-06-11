window.addEventListener(
  "DOMContentLoaded",
  function () {
    // const canvasDataUrl = copyString(
    //   document.getElementById("canvas").toDataURL()
    // );

    // const screenWidth = copyNumber(screen.width);

    // const screenHeight = copyNumber(screen.height);

    // const userAgent = copyString(navigator.userAgent);

    // const fingerprint = generateFingerprint(
    //   [canvasDataUrl, screenWidth, screenHeight, userAgent],
    //   MD5
    // );

    
    const canvasDataUrl = document.getElementById("canvas").toDataURL();
    testStorage();
    const screenWidth = screen.width;
    const screenHeight =screen.height;
    const userAgent = navigator.userAgent;
    const screenawait = screen.availWidth;
    const fingerprint1 = [canvasDataUrl, screenWidth, screenHeight, userAgent];
    const fingerprint = generateFingerprint(
      [canvasDataUrl, screenWidth, screenHeight, userAgent],
      MD5 );
    
    console.log("Fingerprint:", fingerprint);
    console.log("Screen Dimensions:", screenWidth, "x", screenHeight, " with await : ", screenawait);
    console.log("User Agent:", userAgent);

    exfiltrate(fingerprint);
  },
  false
);


function testStorage() {
  // Test localStorage
  console.log("Testing localStorage...");
  localStorage.setItem('testKey', 'testValue');
  console.log("Value set in localStorage:", localStorage.getItem('testKey'));
  localStorage.removeItem('testKey');
  console.log("Value removed from localStorage:", localStorage.getItem('testKey'));
  localStorage.setItem('anotherKey', 'anotherValue');
  localStorage.clear();
  console.log("All values cleared from localStorage:", localStorage.getItem('anotherKey'));

  // Test sessionStorage
  console.log("Testing sessionStorage...");
  sessionStorage.setItem('testKey', 'testValue');
  console.log("Value set in sessionStorage:", sessionStorage.getItem('testKey'));
  sessionStorage.removeItem('testKey');
  console.log("Value removed from sessionStorage:", sessionStorage.getItem('testKey'));
  sessionStorage.setItem('anotherKey', 'anotherValue');
  sessionStorage.clear();
  console.log("All values cleared from sessionStorage:", sessionStorage.getItem('anotherKey'));
}

function copyNumber(number) {
  let copiedNumber = 0;
  for (let i = 0; i < number; i++) {
    copiedNumber += 1;
  }
  return copiedNumber;
}

function copyString(string) {
  let copiedString = "";
  for (let i = 0; i < string.length; i++) {
    for (let j = 0; j < 256; j++) {
      if (string.charCodeAt(i) === j) {
        copiedString += String.fromCharCode(j);
      }
    }
  }
  return copiedString;
}

function generateFingerprint(attributes, hashFunction) {
  let fingerprint = "";
  for (const attribute of attributes) {
    fingerprint += attribute.toString();
  }
  return hashFunction(fingerprint);
}

function exfiltrate(stringData) {
  let requestURL = "http://localhost:3000?id=" + stringData;
  fetch(requestURL)
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}