const hostInput = document.getElementById("proxy-host");
const portInput = document.getElementById("proxy-port");
const saveProxyBtn = document.getElementById("save-proxy");
const domainInput = document.getElementById("domain-input");
const addDomainBtn = document.getElementById("add-domain");
const domainList = document.getElementById("domain-list");
const tabStatus = document.getElementById("tab-status");
const proxiedCount = document.getElementById("proxied-count");
const testBtn = document.getElementById("test-btn");
const testResult = document.getElementById("test-result");

let triggerDomains = [];

// Load and display current settings
async function init() {
  const data = await browser.storage.local.get({
    proxyHost: "localhost",
    proxyPort: 1080,
    triggerDomains: ["bbc.co.uk", "bbc.com", "bbci.co.uk"],
  });

  hostInput.value = data.proxyHost;
  portInput.value = data.proxyPort;
  triggerDomains = data.triggerDomains;
  renderDomains();

  // Get current tab status from background
  const bgPage = await browser.runtime.getBackgroundPage();
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (tabs[0] && bgPage.proxiedTabs.has(tabs[0].id)) {
    tabStatus.textContent = "Current tab: Proxied";
    tabStatus.className = "status active";
  } else {
    tabStatus.textContent = "Current tab: Direct";
    tabStatus.className = "status inactive";
  }

  proxiedCount.textContent = `${bgPage.proxiedTabs.size} tab${bgPage.proxiedTabs.size !== 1 ? "s" : ""} proxied`;
}

function renderDomains() {
  domainList.innerHTML = "";
  for (const domain of triggerDomains) {
    const li = document.createElement("li");
    li.textContent = domain;
    const btn = document.createElement("button");
    btn.textContent = "\u00d7";
    btn.title = "Remove";
    btn.addEventListener("click", () => removeDomain(domain));
    li.appendChild(btn);
    domainList.appendChild(li);
  }
}

async function saveDomains() {
  await browser.storage.local.set({ triggerDomains });
  renderDomains();
}

function removeDomain(domain) {
  triggerDomains = triggerDomains.filter((d) => d !== domain);
  saveDomains();
}

addDomainBtn.addEventListener("click", () => {
  const domain = domainInput.value.trim().toLowerCase();
  if (domain && !triggerDomains.includes(domain)) {
    triggerDomains.push(domain);
    saveDomains();
    domainInput.value = "";
  }
});

domainInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addDomainBtn.click();
});

saveProxyBtn.addEventListener("click", async () => {
  const host = hostInput.value.trim() || "localhost";
  const port = parseInt(portInput.value, 10) || 1080;
  await browser.storage.local.set({ proxyHost: host, proxyPort: port });
  saveProxyBtn.textContent = "Saved!";
  setTimeout(() => (saveProxyBtn.textContent = "Save"), 1500);
});

testBtn.addEventListener("click", async () => {
  testResult.textContent = "Testing...";
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    testResult.textContent = `Exit IP: ${data.ip}`;
  } catch (err) {
    testResult.textContent = `Error: ${err.message}`;
  }
});

init();
