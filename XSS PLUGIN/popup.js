console.log("Popup script loaded.");
document.getElementById('blockButton').addEventListener('click', function() {
  console.log("User chose to block XSS attacks.");
  browser.runtime.sendMessage({ type: 'user_decision', decision: true });
});

document.getElementById('dontBlockButton').addEventListener('click', function() {
  console.log("User chose not to block XSS attacks.");
  browser.runtime.sendMessage({ type: 'user_decision', decision: false });
});
console.log("Popup script loaded.");
