# artist-marketplace-platform
A comprehensive microservices-based online marketplace connecting artists with buyers. This platform enables artists to create detailed profiles and portfolios, manage art listings, and process secure payments. Buyers can discover art through advanced search and filters, place orders, and leave reviews. An administrative dashboard allows for robust

## Payram payment integration

- `docker-compose.yml` now includes a `payram` service based on `payramapp/payram:latest` with both API and HTTP ports exposed.
- The Payram service is built from `payram-image/Dockerfile`, which patches the bundled frontend to remove hardcoded `:8443/:8080` browser fallback.
- `docker-compose.yml` includes a one-shot `payram-root-init` service that creates the Payram root user internally (no browser call to `:8443` required).
- `docker-compose.yml` includes a `payram-dashboard` proxy on port `8081` that serves the dashboard and forwards `/backend/*` to Payram API internally.
- Payram now uses `API_URL=http://gateway` so backend API calls stay on the internal Docker network.
- Artwork payments are initiated through `POST /products/{product_id}/payments/checkout`.
- Merchant domain payments are initiated through `POST /products/merchant/payments/domain/checkout`.
- Product detail page now uses the **Buy Now** action to create a checkout session and redirect to Payram.

### Payram root bootstrap defaults

- Root bootstrap credentials are sourced from environment variables in `docker-compose.yml`.
- Override before `docker compose up`:
  - `PAYRAM_ROOT_EMAIL`
  - `PAYRAM_ROOT_PASSWORD`

### Payram EVM wallet auto-bootstrap

- `payram-root-init` now attempts to auto-create EVM **master** and **cold** wallets so manual wallet connection steps are no longer required in normal setup.
- Wallet bootstrap defaults (override before `docker compose up` when needed):
  - `PAYRAM_AUTO_CREATE_EVM_WALLETS=true`
  - `PAYRAM_EVM_NETWORK=EVM`
  - `PAYRAM_MASTER_WALLET_NAME=EVM Master Wallet`
  - `PAYRAM_COLD_WALLET_NAME=EVM Cold Wallet`
  - `PAYRAM_WALLET_LIST_PATH=/api/v1/wallets`
  - `PAYRAM_WALLET_CREATE_PATH=/api/v1/wallets`
  - `PAYRAM_REQUIRE_EVM_WALLETS=false` (set `true` to fail bootstrap if wallet creation is not successful)

### Payram dashboard access

- Open dashboard at `http://localhost:8081`.
- Only port `8081` is exposed for browser access (Codespaces-friendly single-port setup).
- The dashboard frontend and API traffic are routed internally through the proxy, avoiding direct browser dependency on `:8443` or `:8080`.
