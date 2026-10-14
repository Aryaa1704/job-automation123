// LinkedIn page pe run hoga
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "sendConnectionRequest") {
    const connectBtn = document.querySelector('button[aria-label*="Connect"]');
    if (connectBtn) {
      connectBtn.click();
      setTimeout(() => {
        const addNoteBtn = document.querySelector('button[aria-label="Add a note"]');
        if (addNoteBtn) addNoteBtn.click();
        setTimeout(() => {
          const textarea = document.querySelector('textarea#custom-message');
          if (textarea) {
            textarea.value = msg.message;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
          }
          sendResponse({ success: true });
        }, 1000);
      }, 1000);
    } else {
      sendResponse({ success: false, error: "Connect button not found" });
    }
  }
  return true;
});
