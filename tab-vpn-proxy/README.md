# Docker SOCKS5 Proxy via NordVPN (UK Exit)

Routes all proxied traffic through a NordVPN UK server using WireGuard (NordLynx).

## Setup

### 1. Get your NordVPN access token

1. Log in to [NordVPN Dashboard](https://my.nordaccount.com/)
2. Go to **Services** → **NordVPN**
3. Under **Manual Setup**, generate or copy your access token

### 2. Get your NordLynx private key

```bash
curl -s "https://api.nordvpn.com/v1/users/services/credentials" \
  -u token:<ACCESS_TOKEN> | jq -r '.nordlynx_private_key'
```

Replace `<ACCESS_TOKEN>` with the token from step 1.

### 3. Configure

```bash
cp .env.example .env
```

Edit `.env` and paste your private key:

```
NORDLYNX_PRIVATE_KEY=<your_key>
SOCKS_PORT=1080
```

### 4. Start

```bash
docker compose up -d
```

Wait for the healthcheck to pass (up to ~90s):

```bash
docker compose ps
```

### 5. Test

Verify you get a UK IP:

```bash
curl --socks5-hostname localhost:1080 https://api.ipify.org
```

Test BBC access:

```bash
curl --socks5-hostname localhost:1080 https://www.bbc.co.uk/iplayer
```

DNS leak test (DNS should resolve via NordVPN servers, not your ISP):

```bash
curl --socks5-hostname localhost:1080 https://dnsleaktest.com/
```

## Notes

- Country ID 227 = United Kingdom
- DNS servers `103.86.96.100` and `103.86.99.100` are NordVPN's DNS servers
- The SOCKS5 server (microsocks) shares the VPN container's network stack via `network_mode: "service:nordvpn-uk"`, so all its traffic exits through the VPN tunnel
