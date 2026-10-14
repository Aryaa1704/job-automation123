document.getElementById('run-current-page').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const btn = document.getElementById('happpy-floating-agent-btn');
        if (btn) btn.click();
        else alert('Open a job posting page on LinkedIn, Naukri, or Indeed to run the referral agent!');
      }
    });
    window.close();
  }
});

document.getElementById('open-dashboard').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: window.location.origin || 'http://localhost:3000' });
});
