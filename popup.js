console.log("Popup script loaded.");
// popup.js

// popup.js

document.addEventListener('DOMContentLoaded', function () {
  var slider = document.getElementById('entropy-slider');
  var output = document.getElementById('entropy-value');
  
  output.innerHTML = 'Entropy Threshold: ' + slider.value;

  // Send the entropy threshold to background.js when slider value changes
  slider.oninput = function() {
    output.innerHTML = 'Entropy Threshold: ' + this.value;
    browser.runtime.sendMessage({setEntropyThreshold: parseFloat(this.value)});
  }

  // Retrieve the entropy threshold from background.js when popup is opened
  browser.runtime.sendMessage({getEntropyThreshold: true}).then(response => {
    if (response && response.threshold) {
      slider.value = response.threshold;
      output.innerHTML = 'Entropy Threshold: ' + response.threshold;
    }
  });
});
