async function getExclusions() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["excludeList"], (res) => {
      resolve(res.excludeList || []);
    });
  });
}

function isExcluded(url, excludeList) {
  return excludeList.some(pattern => url.includes(pattern));
}

function classifyStatus(status, opaque = false) {
  if (opaque) return "unknown";
  if (status >= 200 && status < 400) return "valid";
  if (status >= 400) return "broken";
  return "unknown";
}

async function fetchWithHeadThenGet(url) {
  try {
    const headRes = await fetch(url, {
      method: "HEAD",
      redirect: "follow"
    });

    // Opaque response (CORS)
    if (headRes.type === "opaque") {
      return { url, status: null, result: "unknown", reason: "opaque" };
    }

    // Fallback to GET only if HEAD is not usable
    if (headRes.status === 405 || headRes.status === 0) {
      return await fallbackGet(url);
    }

    return {
      url,
      status: headRes.status,
      result: classifyStatus(headRes.status),
      method: "HEAD"
    };

  } catch (err) {
    // Network / CORS failure → try GET once
    return await fallbackGet(url);
  }
}

async function fallbackGet(url) {
  try {
    const getRes = await fetch(url, {
      method: "GET",
      redirect: "follow"
    });

    if (getRes.type === "opaque") {
      return { url, status: null, result: "unknown", reason: "opaque" };
    }

    return {
      url,
      status: getRes.status,
      result: classifyStatus(getRes.status),
      method: "GET"
    };

  } catch (err) {
    return {
      url,
      status: null,
      result: "unknown",
      reason: "fetch_error"
    };
  }
}

async function scanLinks() {
  const links = [...document.querySelectorAll("a[href]")]
    .map(a => a.href);

  const excludeList = await getExclusions();

  const filtered = links.filter(url => !isExcluded(url, excludeList));

  const results = await Promise.all(
    filtered.map(url => fetchWithHeadThenGet(url))
  );

  chrome.runtime.sendMessage({
    type: "RESULTS",
    data: results
  });
}

scanLinks();