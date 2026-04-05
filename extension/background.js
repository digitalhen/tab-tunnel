// Tab Tunnel - Background Script
// Routes traffic from specific tabs through a SOCKS5 proxy based on trigger domains

var proxiedTabs = new Set();

let proxyHost = "localhost";
let proxyPort = 1080;
let triggerDomains = ["bbc.co.uk", "bbc.com", "bbci.co.uk"];

// Load settings from storage
async function loadSettings() {
  const data = await browser.storage.local.get({
    proxyHost: "localhost",
    proxyPort: 1080,
    triggerDomains: ["bbc.co.uk", "bbc.com", "bbci.co.uk"],
  });
  proxyHost = data.proxyHost;
  proxyPort = data.proxyPort;
  triggerDomains = data.triggerDomains;
}

loadSettings();

// Listen for settings changes
browser.storage.onChanged.addListener((changes) => {
  if (changes.proxyHost) proxyHost = changes.proxyHost.newValue;
  if (changes.proxyPort) proxyPort = changes.proxyPort.newValue;
  if (changes.triggerDomains) triggerDomains = changes.triggerDomains.newValue;
});

// Check if a URL matches any trigger domain (exact or subdomain)
function matchesTriggerDomain(url, domains) {
  try {
    const hostname = new URL(url).hostname;
    return domains.some(
      (domain) => hostname === domain || hostname.endsWith("." + domain)
    );
  } catch {
    return false;
  }
}

// Update the browser action icon for a tab
function updateIcon(tabId, active) {
  const suffix = active ? "active-" : "";
  browser.browserAction.setIcon({
    tabId,
    path: {
      48: `icons/icon-${suffix}48.png`,
      96: `icons/icon-${suffix}96.png`,
    },
  });
  browser.browserAction.setTitle({
    tabId,
    title: active ? "Tab Tunnel: Active (proxied)" : "Tab Tunnel: Inactive",
  });
}

// Evaluate whether a tab should be proxied based on its current URL
function evaluateTab(tabId, url) {
  if (matchesTriggerDomain(url, triggerDomains)) {
    if (!proxiedTabs.has(tabId)) {
      proxiedTabs.add(tabId);
      updateIcon(tabId, true);
    }
  } else {
    if (proxiedTabs.has(tabId)) {
      proxiedTabs.delete(tabId);
      updateIcon(tabId, false);
    }
  }
}

// Top-level navigation commits
browser.webNavigation.onCommitted.addListener(
  (details) => {
    if (details.frameId === 0) {
      evaluateTab(details.tabId, details.url);
    }
  }
);

// Also catch tab updates (handles session restore, URL bar navigation, etc.)
browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    evaluateTab(tabId, changeInfo.url);
  }
});

// Clean up closed tabs
browser.tabs.onRemoved.addListener((tabId) => {
  proxiedTabs.delete(tabId);
});

// Proxy decision handler -- fires for every request
browser.proxy.onRequest.addListener(
  (requestInfo) => {
    if (requestInfo.tabId !== -1 && proxiedTabs.has(requestInfo.tabId)) {
      return {
        type: "socks",
        host: proxyHost,
        port: proxyPort,
        proxyDNS: true,
        failoverTimeout: 5,
      };
    }
    return { type: "direct" };
  },
  { urls: ["<all_urls>"] }
);

// Log proxy errors
browser.proxy.onError.addListener((error) => {
  console.error("Tab Tunnel proxy error:", error.message);
});

// On startup, check all existing tabs (handles extension reload / browser restart)
browser.tabs.query({}).then((tabs) => {
  for (const tab of tabs) {
    if (tab.url) {
      evaluateTab(tab.id, tab.url);
    }
  }
});
