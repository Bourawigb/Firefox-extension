var blockXSS = false;
console.log("BACKGROUND script loaded.");
browser.runtime.onMessage.addListener(function(message) {
  if (message.type === 'taint_report') {
    var taintData = message.data;
    console.log("Message received:", message);
    if (blockXSS) {
      // Define a listener to intercept and block the request
      browser.webRequest.onBeforeRequest.addListener(
        blockRequest,
        {urls: [taintData.sink]},
        ["blocking"]
      );
    }
  } else if (message.type === 'user_decision') {
    blockXSS = message.decision;
  }
});

function blockRequest(details) {
  console.log("URL requested: " + details.url + " from source: " + details.originUrl + " is blocked!");
  // Cancel the request
  return {cancel: true};
}
