# Tab VPN - Firefox Tab-Level SOCKS5 Proxy

Routes traffic from specific browser tabs through a SOCKS5 proxy based on URL patterns. Uses Firefox's `proxy.onRequest` API for true per-tab proxy decisions.

**Architecture:** `Firefox Tab → SOCKS5 (localhost:1080) → Docker Container → NordLynx WireGuard → UK Exit`

## Quick Start

### 1. Start the proxy

```bash
cd docker
cp .env.example .env
# Edit .env with your NordLynx private key (see docker/README.md)
docker compose up -d
```

Verify:
```bash
curl --socks5-hostname localhost:1080 https://api.ipify.org
# Should return a UK IP
```

### 2. Install the extension

1. Open Firefox and go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `extension/manifest.json`

### 3. Use it

Navigate to any trigger domain (e.g., `bbc.co.uk`) -- the tab's traffic will automatically route through the VPN proxy. The extension icon shows blue when a tab is proxied.

## Configuration

Click the extension icon to:
- Change proxy host/port
- Add/remove trigger domains
- Test the connection (shows exit IP)

Default trigger domains: `bbc.co.uk`, `bbc.com`, `bbci.co.uk`

## How It Works

- `proxy.onRequest` fires for every network request with the originating `tabId`
- `webNavigation.onCommitted` and `tabs.onUpdated` track which tabs are on trigger domains
- `proxyDNS: true` ensures DNS resolution happens through the proxy (no DNS leaks)
- Non-matching tabs use direct connections with zero overhead
