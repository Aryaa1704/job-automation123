chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "openLinkedInProfile") {
    chrome.tabs.create({ url: msg.profileUrl }, (tab) => {
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, {
          action: "sendConnectionRequest",
          message: msg.outreachMessage
        }, sendResponse);
      }, 3000);
    });
  }
  return true;
});
