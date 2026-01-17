/* ----------------------------------
 * Core SDK Types
 * ---------------------------------- */

export type VeilNetwork = "mainnet-beta" | "devnet" | "testnet";

/**
 * Main SDK configuration.
 * Veil now manages wallets internally using LazorKit passkeys.
 */
export interface VeilConfig {
  network: VeilNetwork;
  rpcUrl?: string;
  defaultProvider?: PrivacyProviderType;
}

/* ----------------------------------
 * Wallet Types (SDK-managed, LazorKit-backed)
 * ---------------------------------- */

/**
 * Represents a Veil-managed smart wallet using LazorKit.
 * Wallets are created via createWallet() and are provider-agnostic.
 */
export interface VeilWallet {
  id: string; // internal SDK wallet ID
  publicKey: string; // smart wallet Solana public key
  encryptedSecretKey: string; // encrypted private key storage
  passkeyCredentialId?: string; // WebAuthn / passkey credential
  provider: PrivacyProviderType; // privacy backend this wallet will use
  createdAt: number;
}

/**
 * Options when creating a wallet
 */
export interface CreateWalletOptions {
  provider?: PrivacyProviderType; // default privacy provider
  password?: string; // optional local encryption password
}

/* ----------------------------------
 * Privacy Providers
 * ---------------------------------- */

export type PrivacyProviderType = "privacy-cash" | "shadowwire" | "noir";

/**
 * Interface every provider must implement
 */
export interface PrivacyProvider {
  name: PrivacyProviderType;

  createWallet(): Promise<VeilWallet>;
  privateTransfer(
    params: PrivateTransferParams
  ): Promise<PrivateTransferResult>;

  // Optional helpers providers can implement
  getPrivateBalance?(wallet: VeilWallet, rpcUrl: string): Promise<number>;

  getPrivateBalanceSpl?(
    wallet: VeilWallet,
    rpcUrl: string,
    mint: string
  ): Promise<number>;
}

/* ----------------------------------
 * Transfers
 * ---------------------------------- */

export interface PrivateTransferParams {
  rpcUrl: VeilConfig["rpcUrl"];
  from: VeilWallet;
  to: string; // recipient public key
  amount: number;
  tokenMint?: string;
  memo?: string; // <-- Added to match README and user request
  password?: string;
}

export interface PrivateTransferResult {
  signature: string;
  provider: PrivacyProviderType;
  proof?: unknown; // Bulletproof / ZK proof / encrypted payload
}

/* ----------------------------------
 * Encryption
 * ---------------------------------- */

export interface EncryptParams {
  data: Uint8Array | string;
  recipientPublicKey: string;
}

export interface EncryptResult {
  ciphertext: Uint8Array;
}

/* ----------------------------------
 * Zero Knowledge
 * ---------------------------------- */

export interface ZKVerifyParams {
  proof: unknown;
  publicSignals?: unknown;
}

export interface ZKVerifyResult {
  valid: boolean;
}
