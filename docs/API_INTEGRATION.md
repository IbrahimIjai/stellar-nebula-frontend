# Stellar Horizon API Integration

This document describes how Nebula Nomad uses the Stellar Horizon API, which hosts it may contact,
and how cross-origin requests are configured. It implements the Horizon part of issue #488.

## Endpoints

| Network | Horizon URL | Passphrase source |
| :--- | :--- | :--- |
| Testnet | `https://horizon-testnet.stellar.org` | `src/constants/stellar.ts` |
| Futurenet | `https://horizon-futurenet.stellar.org` | `src/constants/stellar.ts` |
| Mainnet | `https://horizon.stellar.org` | `src/constants/stellar.ts` |

The active URL comes from `VITE_STELLAR_HORIZON_URL`. When that variable is unset, the network
default applies. See `src/config/stellar.ts` (`getActiveStellarConfig`).

## Horizon Operations Used

| Operation | Used for | Where |
| :--- | :--- | :--- |
| `root()` | Connectivity check | `checkStellarConnection` in `src/config/stellar.ts` |
| `accounts()` | Account, balance and trustline lookups | `src/utils/stellar/balance.ts`, `src/services/assets/resources.ts`, `src/services/assets/trustlines.ts` |
| `transactions()` | Transaction history and cache | `src/services/history/transactions.ts`, `src/services/transaction-cache.ts`, `src/utils/horizon-utils.ts` |
| `payments()` | Payment lookups for balances | `src/utils/stellar/balance.ts` |
| `ledgers()` | Contract event listening | `src/services/contracts/eventListener.ts` |
| `GET /accounts/{id}` (raw `fetch`) | Ship NFT metadata lookup | `src/services/nft/shipNFT.ts` |

## Trusted Hosts

`src/config/horizon.ts` defines the allow-list:

- Only the three public Horizon hosts above are trusted over HTTPS.
- In development, `http://localhost` and `http://127.0.0.1` are also allowed for a local Quickstart node.
- URLs with embedded credentials are rejected.
- `createHorizonServer()` calls `assertTrustedHorizonUrl()` before it creates a client. An untrusted URL throws an error and no request is sent.

To point the app at a private Horizon provider, add its host to `TRUSTED_HORIZON_HOSTS`
in the same change that sets `VITE_STELLAR_HORIZON_URL`, and document the reason here.

## CORS

Horizon is a public API. The Horizon server, not this app, sets the CORS headers:

- Horizon responds with `Access-Control-Allow-Origin` so that browsers on any origin can read public ledger data.
- Nebula Nomad does not depend on a permissive CORS policy. It only reads public data.
- The app does not need the `Access-Control-Allow-Credentials` header, because no cross-origin request carries credentials.

The app's own CORS policy is documented in [SECURITY.md](./SECURITY.md#cors-and-horizon-access-488).

## Credentials

- All Horizon requests made by the app are unauthenticated.
- The raw `fetch` in `src/services/nft/shipNFT.ts` sets `credentials: 'omit'` (`HORIZON_FETCH_CREDENTIALS`) so cookies are never attached.
- The Stellar SDK clients make unauthenticated requests. Do not add `Authorization` headers or API keys to a Horizon client. Keys belong on a server, not in the frontend bundle.

## Adding a New Horizon Call

1. Use the client from `createHorizonServer()`. Do not construct `Horizon.Server` directly.
2. For a raw `fetch`, pass `credentials: HORIZON_FETCH_CREDENTIALS`.
3. Strip or mask amounts and addresses before sending them to monitoring (see [MONITORING.md](./MONITORING.md#privacy-controls-logrocket--sentry-486)).
