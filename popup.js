console.log("Popup script loaded.");
document.getElementById('low').addEventListener('click', () => {
  setPrivacyLevel('low');
});

document.getElementById('medium').addEventListener('click', () => {
  setPrivacyLevel('medium');
});

document.getElementById('high').addEventListener('click', () => {
  setPrivacyLevel('high');
});

function setPrivacyLevel(level) {
browser.runtime.sendMessage({action: 'setPrivacyLevel', level: level}, (response) => {
  if (response.status === 'success') {
    console.log('Privacy level set to ' + response.level);
  } else {
    console.log('Failed to set privacy level');
  }
});
}

  