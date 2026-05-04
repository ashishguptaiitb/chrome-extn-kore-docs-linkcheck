document.getElementById("refresh").onclick = () => location.reload();

chrome.storage.local.get(["lastResults"], (res) => {
  const list = document.getElementById("results");
  (res.lastResults || []).forEach(r => {
    const li = document.createElement("li");
    li.textContent = `${r.url} - ${r.status}`;
    list.appendChild(li);
  });
});