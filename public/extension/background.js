/**
 * Happpy Job Agent - Background Service Worker
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('Happpy Job Agent Extension installed successfully.');
});

// Listen for messages from content scripts if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'referral_run_logged') {
    console.log('Referral run logged from extension:', request.data);
    sendResponse({ status: 'ok' });
  }
});
