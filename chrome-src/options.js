document.getElementById("save").onclick = () => {
  const value = document.getElementById("exclude").value
    .split("\n")
    .map(v => v.trim())
    .filter(Boolean);

  chrome.storage.sync.set({ excludeList: value });
};