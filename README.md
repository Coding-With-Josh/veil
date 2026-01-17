## Abstract

Veil Protocol is a developer-first privacy SDK for Solana that unifies multiple privacy-preserving protocols under a single, minimal, and composable interface. Instead of forcing developers to learn and integrate fragmented privacy stacks, Veil abstracts privacy primitives such as confidential transfers, zero-knowledge proofs, and encrypted execution into a single SDK that works with a non-secret project identifier. Veil is designed as protocol infrastructure, not a hosted service, enabling local-first execution, composability, and ecosystem-wide adoption without central trust assumptions.

---

## 1. Motivation

Privacy on Solana exists, but it is fragmented.

Today, developers must:

- Choose between multiple privacy protocols (Privacy Cash, ShadowWire, Noir, etc.)
- Learn different SDKs, APIs, and assumptions
- Write custom glue code per protocol
- Rebuild UX, error handling, and abstractions repeatedly

This fragmentation:

- Slows adoption
- Increases bugs
- Discourages experimentation
- Makes privacy feel “advanced” instead of normal

Veil exists to make **privacy the default developer experience**.

---

## 2. Design Principles

Veil is built on five non-negotiable principles:

### 2.1 SDK-First, Not App-First

Veil is not an application, API, or hosted service.
It is **developer infrastructure**.

All functionality lives inside the SDK.

### 2.2 No Central Backend Dependency

- No Veil API
- No runtime authentication
- No required network calls to Veil servers

Veil must work in:

- Wallets
- Frontends
- Local scripts
- Offline or constrained environments

### 2.3 Project ID Is an Identifier, Not a Secret

Veil uses a public, non-sensitive `projectId` to namespace integrations.

This mirrors:

- Sentry DSNs
- PostHog project keys
- Public analytics identifiers

It is never used for authorization.

### 2.4 Protocol Abstraction, Not Reinvention

Veil does not replace privacy protocols.
It **wraps them cleanly**.

Each privacy system remains sovereign; Veil provides the interface.

### 2.5 Progressive Privacy

Developers should be able to:

- Start simple
- Opt into stronger privacy
- Switch protocols without rewriting their app

---

## 3. High-Level Architecture

```
Developer App
     |
     v
@veil/sdk
     |
     +-- Provider Router
     |
     +-- Privacy Providers
           ├─ Privacy Cash
           ├─ Radr Labs (ShadowWire)
           ├─ Noir / ZK
```

Veil sits **between applications and privacy protocols**.

---

## 4. Core Concepts

### 4.1 Veil SDK

Package name:

```
@veil/sdk
```

Responsibilities:

- Expose a unified privacy API
- Route calls to the correct privacy provider
- Handle protocol differences internally
- Provide consistent DX, errors, and typing

Non-responsibilities:

- Authentication
- Key management
- Analytics
- Hosting
- Compliance logic

---

### 4.2 Project ID

A Project ID:

- Is created via the Veil dashboard
- Is passed into the SDK at initialization
- Namespaces usage and metadata

Example:

```ts
const veil = new Veil({
  projectId: "veil_proj_x92fLmQ",
  network: "devnet",
});
```

Properties:

- Public
- Non-secret
- Immutable
- SDK-only concern

---

## Installation

```bash
npm install @veil/sdk
```

## Quick Start

### 1. Initialize the SDK

```typescript
import { Veil } from "@veil/sdk";

const veil = new Veil({
  network: "devnet",
  defaultProvider: "privacy-cash", // or "shadowwire"
});
```

### 2. Create a Privacy Wallet

Veil uses **LazorKit** to generate passkey-secured smart wallets. This must be run in a browser/client environment supporting WebAuthn.

```typescript
const wallet = await veil.createWallet({
  provider: "privacy-cash",
  password: "optional-local-encryption-password",
});

console.log(`Created wallet: ${wallet.publicKey}`);
```

### 3. Send a Private Transfer

Send assets confidentially using your initialized wallet.

```typescript
const result = await veil.privateTransfer({
  from: wallet,
  to: "NoteRecipientPublicKeySuggest...",
  amount: 100, // units depend on provider (e.g., lamports or token atoms)
  rpcUrl: "https://api.devnet.solana.com", // Required for connection
  tokenMint: "OptionalSplTokenMintAddress...",
  memo: "Private payment",
});

console.log(`Transfer successful! Sig: ${result.signature}`);
```

## Supported Providers

Veil currently supports the following privacy protocols:

| Provider         | Key            | Description                                  | Status                  |
| ---------------- | -------------- | -------------------------------------------- | ----------------------- |
| **Privacy Cash** | `privacy-cash` | Wrapper for privacy.cash protocol.           | ✅ **Stable** (Default) |
| **ShadowWire**   | `shadowwire`   | Bulletproof-based confidential transactions. | ✅ **Stable**           |
| **Noir**         | `noir`         | Zero-Knowledge proof generation (Stub).      | 🚧 **Alpha**            |

## Experimental Features

### Confidential SPL Token (Token-2022)

The SDK includes utility helpers for Token-2022 Confidential Transfers in `src/utils/confidentialSPL.ts`.

> [!WARNING] > **Current Limitation**: Due to missing exports in the stable `@solana/spl-token` library, the confidential transfer functions (`confidentialTransfer`, `confidentialDeposit`) currently fall back to standard SPL transfer instructions. Full confidential support will be enabled when the upstream library stabilizes.

## Architecture

Veil sits between your application and the underlying privacy protocols:

```
Developer App  ->  @veil/sdk  ->  LazorKit Wallet
                                      |
                                      +-> Privacy Cash
                                      +-> ShadowWire
                                      +-> Noir
```

### 4.3 Providers

A **provider** is a protocol adapter that implements Veil’s privacy interface.

Each provider:

- Wraps a specific privacy protocol
- Conforms to a shared interface
- Advertises its capabilities

---

## 5. Provider Interface

All privacy providers implement the same interface:

```ts
interface PrivacyProvider {
  id: string;

  capabilities: {
    privateAmounts: boolean;
    privateRecipients: boolean;
    zkProofs: boolean;
    encryptedState: boolean;
  };

  privateTransfer(
    params: PrivateTransferParams
  ): Promise<VeilTransactionResult>;
}
```

This allows:

- Runtime protocol selection
- Capability-based routing
- Graceful fallbacks

---

## 6. Unified Privacy API

The SDK exposes **one primary surface**:

```ts
await veil.privateTransfer({
  to: recipient,
  amount: 1.25,
  token: "USDC",
  protocol: "privacy-cash", // optional
});
```

Behavior:

- If `protocol` is omitted, Veil selects the best default
- If unsupported, Veil throws a typed error
- No protocol-specific imports are required

---

## 7. Sponsor Protocol Integration Strategy

Veil integrates sponsor technologies **natively inside the SDK**, not as demos.

### 7.1 Privacy Cash

- Wrapped confidential transfers
- Default provider for private payments
- Qualifies for Privacy Cash bounty

### 7.2 Radr Labs (ShadowWire)

- Bulletproof-based amount hiding
- On-chain verifiable privacy
- Optional provider

### 7.3 Noir (ZK Proofs)

- ZK circuits
- Proof generation and verification
- Abstracted behind Veil’s provider interface (Stubbed)

### 7.4 Current Limitations (Alpha)

> [!NOTE] > **Confidential SPL Token Support**: The confidential transfer functions (`confidentialTransfer`, `confidentialDeposit`, etc.) currently rely on standard SPL Token instructions as placeholders. The full Token-2022 Confidential Transfer extension instructions will be enabled once the `@solana/spl-token` library updates to support them fully in the stable release.

To verify, `src/utils/confidentialSPL.ts` contains the placeholder implementations.

Each integration is:

- Modular
- Optional
- Replaceable

---

## 8. Error Model

Veil exposes **structured errors**, never raw protocol errors.

```ts
VeilError {
  code: "PROVIDER_UNAVAILABLE" |
        "UNSUPPORTED_OPERATION" |
        "INVALID_PARAMS";
  provider?: string;
  message: string;
}
```

This ensures predictable UX.

---

## 9. Security Model

Veil assumes:

- Wallets handle signing
- Keys never touch Veil
- Providers enforce cryptographic guarantees

Veil itself:

- Does not custody assets
- Does not see secrets
- Does not transmit sensitive data

---

## 10. Future Extensions (Non-Blocking)

- CLI (`veil init`)
- Framework scaffolds (Next.js)
- Dashboard analytics (opt-in)
- Compliance adapters (Range)
- Ephemeral rollups (MagicBlock)

These do **not** affect the SDK core.

---

## 11. Why This Matters

Veil shifts privacy on Solana from:

> “advanced feature”
> to
> “default infrastructure”

By unifying privacy tooling behind a clean SDK, Veil lowers the barrier for builders and accelerates real-world adoption of confidential systems on Solana.

---

## 12. Conclusion

Veil Protocol is not a demo, not an app, and not a wrapper for a single sponsor.
It is **privacy infrastructure**.

If privacy is necessary for an open society, then privacy tooling must be simple, composable, and developer-first.

Veil makes privacy normal.
