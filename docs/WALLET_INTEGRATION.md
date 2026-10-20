# Wallet Integration — Error Scenarios

This document describes how wallet connection failures are classified, what the
user sees, and how they recover. All classification lives in
`src/services/wallets/errorHandling.ts` and is applied by
`WalletContext.connect()` via `handleWalletConnectionError()` +
`formatWalletError()`; the rendered message (message + recovery hint) appears in
the connect modal (`src/components/Wallet/ConnectModal.tsx`) and is logged with
its error code for debugging.

## How errors surface

- **UI**: the connect modal shows `role="alert"` with the formatted message
  (specific message + recovery instructions).
- **Logging**: `WalletContext` logs the failure with `errorCode` via the app
  logger and reports an `error_reported` analytics event.
- **Network mismatch**: detected separately by `validateNetworkMatch()` in
  `src/services/wallets/networkValidation.ts`; shown as a blocking error when
  signing and as `networkMismatchWarning` after connecting.

## Error scenarios

| Code                               | Scenario                          | User message                                       | Recovery                                           |
| ---------------------------------- | --------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| `FREIGHTER_NOT_INSTALLED`          | Freighter extension missing       | Freighter wallet is not installed                  | Install from https://www.freighter.app             |
| `XBULL_NOT_INSTALLED`              | xBull extension missing           | xBull wallet is not installed                      | Install from https://xbull.app                     |
| `ALBEDO_NOT_AVAILABLE`             | Albedo popup unavailable          | Albedo is not available in this browser            | Use a popup-capable browser                        |
| `LEDGER_WEBUSB_UNSUPPORTED`        | Browser lacks WebUSB              | Ledger WebUSB is not supported in this browser     | Use Chrome or Edge                                 |
| `WALLETCONNECT_PROJECT_ID_MISSING` | Missing env config                | WalletConnect project ID is not configured         | Set `VITE_WALLETCONNECT_PROJECT_ID`                |
| `WALLETCONNECT_PAIRING_FAILED`     | Pairing/session failed            | Failed to establish WalletConnect session          | Retry; ensure the wallet supports WalletConnect v2 |
| `USER_REJECTED`                    | User declined the request         | You rejected the wallet connection request         | Approve the request in the wallet popup/device     |
| `WALLET_LOCKED`                    | Wallet extension/device is locked | `<wallet>` wallet is locked                        | Unlock the wallet, then try again                  |
| `REQUEST_TIMEOUT`                  | No response before expiry         | The wallet did not respond in time                 | Try the request again                              |
| `LEDGER_DISCONNECTED`              | Device unplugged mid-request      | Ledger device disconnected                         | Reconnect, unlock, open the Stellar app            |
| `INVALID_KEY`                      | Public key unavailable            | Failed to retrieve your public key from the wallet | Disconnect and reconnect the wallet                |
| `UNKNOWN_ERROR`                    | Unmatched failure                 | Original error message                             | Retry or contact support                           |

## Wrong network (network mismatch)

Not an exception path — after a successful connection the app compares the
wallet's network against the configured app network:

> Your wallet is connected to **Testnet**, but this app requires **Mainnet**.
> Please switch your wallet to Mainnet to continue.

Signing is blocked while the mismatch persists. Switch the network in the
wallet extension (Freighter supports in-app switching; other wallets must be
switched externally) and the warning clears on the next validation.

## Adding a new scenario

1. Add a branch in `handleWalletConnectionError()` with a distinct `code`,
   specific `message`, actionable `helpText`, and `isRetryable` flag.
2. Add a row to the table above.
3. Cover it in `src/services/wallets/__tests__/errorHandling.test.ts`.
