console.log("BACKGROUND script loaded.");

let privacyLevel = 'medium'; // Default privacy level
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setPrivacyLevel') {
    privacyLevel = request.level;
    sendResponse({status: 'success', level: privacyLevel}); // Sending the updated privacy level back to the popup
  }
});

// Modify the listener to use the updated privacy level
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'reportAccess') {
    console.log(`Access reported: ${message.property}`);
    
    // Check if we need to block the access based on privacy level
    if (message.property === 'screen.width' && privacyLevel === 'high') {
      sendResponse({ block: true });
    } else {
      sendResponse({ block: false });
    }
  }
  // Add the message handling for updating the settings here if needed
});
