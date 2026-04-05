# Tab Tunnel

A Firefox extension that routes specific tabs through a VPN — automatically, based on the sites you visit.

Add domains like `bbc.co.uk` or your bank's website, and those tabs get routed through a SOCKS5 proxy connected to a VPN. Everything else stays on your normal connection. No app to toggle, no split tunneling to configure, no full-system VPN slowing everything down. You set it up once and never think about it again.

## Use cases

- **Watch foreign TV** — access BBC iPlayer, ITV, or other geo-restricted streaming from anywhere
- **Use your bank abroad** — avoid triggering fraud alerts or geo-blocks when travelling
- **Selective privacy** — route only the tabs that matter through a VPN, keep everything else fast and direct

## How it works

When you navigate to a matching domain, the extension tags that tab and routes all its traffic through your proxy — including subresources, AJAX requests, and DNS lookups. Non-matching tabs are completely unaffected.

```
Tab (bbc.co.uk) → SOCKS5 proxy → Docker/WireGuard VPN → UK exit
Tab (google.com) → direct connection (no proxy)
```

## Setup

### 1. Start the proxy

The included Docker stack runs a WireGuard VPN (via NordVPN) with a SOCKS5 proxy. See [`tab-vpn-proxy/README.md`](tab-vpn-proxy/README.md) for full setup instructions.

```bash
cd tab-vpn-proxy
cp .env.example .env
# Add your NordLynx private key (see tab-vpn-proxy/README.md)
docker compose up -d
```

Verify it's working:
```bash
curl -x socks5h://localhost:1080 https://api.ipify.org
# Should return a UK IP address
```

### 2. Install the extension

**From file:**
1. Download `tab-tunnel.xpi` from this repo
2. In Firefox, go to `about:addons`
3. Click the gear icon → **Install Add-on From File** → select the `.xpi`

**For development:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `extension/manifest.json`

### 3. Configure

Click the extension icon to:
- Set your proxy address (default: `localhost:1080`)
- Add or remove trigger domains
- Test the connection and see your exit IP

Default domains: `bbc.co.uk`, `bbc.com`, `bbci.co.uk`

## Bringing your own proxy

You don't need to use the included Docker stack. Any SOCKS5 proxy will work — point the extension at whatever host and port you like. The extension doesn't care how the proxy is set up, only that it speaks SOCKS5.
