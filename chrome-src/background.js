chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "RESULTS") {
    chrome.storage.local.set({ lastResults: msg.data });
  }
});