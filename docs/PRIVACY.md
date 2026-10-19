# Privacy Policy and Data Handling

This document describes what data Nebula Nomad sends to its monitoring providers, how that data is
redacted, and what remains open before the app can claim GDPR compliance. It implements the
technical controls for issue #486.

> This document describes engineering controls. It is not legal advice. Items marked **Open** need
> a decision from the product owner or legal counsel before launch.

## Data Categories

| Category | Examples | Where it can appear | Handling |
| :--- | :--- | :--- | :--- |
| Wallet public keys | `GABCD…` account IDs | Sentry user ID, LogRocket identity, breadcrumbs, request URLs (`/accounts/G…`) | Shortened to `GABCD…WXYZ` |
| Wallet secret keys | `S…` seeds | Should never reach the app. Any occurrence is redacted. | Replaced with `[REDACTED]` |
| Transaction amounts | balances, prices, fees | Event payloads, breadcrumbs, Horizon responses | Masked as `[AMOUNT]`. Horizon response bodies are dropped from replay. |
| Auth material | `Authorization`, `Cookie`, `X-API-Key`, tokens | Request headers, payload keys | Removed or replaced with `[REDACTED]` |
| Page content | Text and form inputs | LogRocket session replay, Sentry replay | Text and inputs are masked. Sentry replay already uses `maskAllText`. |
| IP address | Client IP | LogRocket | Not stored (`shouldCaptureIP: false`) |

## Technical Controls

The redaction rules live in `src/utils/sanitization.ts`:

- `redactWalletAddress()` shortens a public key to `GABCD…WXYZ`.
- `redactStellarKeysInText()` redacts every public key and secret seed inside a string.
- `sanitizeMonitoringData()` applies the key-based rules recursively. Values under secret-like keys
  are removed, and amount-like keys are masked.

`src/services/monitoring.ts` applies these rules at every boundary where data leaves the app:

- **Sentry**: `beforeBreadcrumb` sanitizes each breadcrumb. `beforeSend` sanitizes `extra`,
  `contexts` and the request URL.
- **LogRocket**: `requestSanitizer` strips auth and cookie headers and redacts keys in the URL and body.
  `responseSanitizer` drops Stellar network response bodies. `dom.textSanitizer` and
  `dom.inputSanitizer` are both enabled.
- **User identity**: `setMonitoringUser()` sends only the shortened wallet address as the user ID.
- **Events and breadcrumbs**: `captureMonitoringEvent()` and `addMonitoringBreadcrumb()` sanitize
  their message and payload before forwarding.

## Rights of Data Subjects

| Right | How it is supported today |
| :--- | :--- |
| Access and portability | **Open.** No self-service export exists. Requests must be answered manually. |
| Erasure | **Open.** Session replays are deleted through the LogRocket and Sentry dashboards. No automated flow exists. |
| Objection and restriction | All monitoring, including session replay, can be disabled for a build with `VITE_ENABLE_MONITORING=false`. There is no per-user opt-out yet. |
| Transparency | This document and `docs/MONITORING.md` describe the processing. |

## Lawful Basis and Consent

**Open.** Session replay in the EU requires a lawful basis, usually consent. The app currently loads
LogRocket and Sentry on every production page view without a consent prompt. Before the app
claims GDPR compliance, product and legal must decide:

1. The lawful basis for session replay (consent or legitimate interest).
2. Whether a consent banner gates LogRocket loading.
3. The retention period for replays and error events in each provider.
4. The data processing agreements in place with LogRocket and Sentry.
5. The contact point for privacy requests.

## Retention

**Open.** Retention periods are set in the LogRocket and Sentry project settings, not in this
repository. Record the agreed values here once they are decided.

## Changes to This Policy

Update this file together with any change to the redaction rules in `src/utils/sanitization.ts`
or the monitoring configuration in `src/services/monitoring.ts`.
