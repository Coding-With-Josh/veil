import {
  PrivacyProvider,
  VeilWallet,
  PrivateTransferParams,
  PrivateTransferResult,
} from "../types";
import { PrivacyCash } from "privacycash";
import { decryptSecretKey } from "../wallet/keyEncyption";

/**
 * Helper: build a PrivacyCash instance
 */

export function getDecryptedSecretKey(wallet: VeilWallet, password: string) {
  return decryptSecretKey(wallet.encryptedSecretKey, password);
}

function makePrivacyCashInstance(
  rpcUrl: string,
  wallet: VeilWallet,
  password: string
) {
  const secretKeyUint8 = getDecryptedSecretKey(wallet, password);
  return new PrivacyCash({
    RPC_url: rpcUrl,
    owner: secretKeyUint8, // PrivacyCash expects raw secret key or Keypair
    enableDebug: false,
  });
}

/**
 * Privacy Cash adapter implements only the interface from types.ts:
 * - createWallet
 * - privateTransfer
 */
export const privacyCash: PrivacyProvider = {
  name: "privacy-cash",

  async createWallet(): Promise<VeilWallet> {
    throw new Error(
      "PrivacyCash does not generate wallets. Use Veil.createWallet() instead."
    );
  },

  async privateTransfer(
    params: PrivateTransferParams
  ): Promise<PrivateTransferResult> {
    // Ensure we have an RPC URL
    const rpcUrl = params.rpcUrl ?? "https://api.devnet.solana.com";

    // PrivacyCash uses a raw secret key array, so the Veil wallet must
    // expose the secret key in whatever secure form your SDK uses.
    // We expect the password to be allowed here for decryption
    if (!params.password) {
      throw new Error(
        "MISSING_PASSWORD: Password required for private transfer"
      );
    }

    const pc = makePrivacyCashInstance(rpcUrl, params.from, params.password);

    // Note: PrivacyCash protocol does not currently support attaching a memo field directly.
    // The memo param is accepted for API consistency but not transmitted.
    if (params.memo) {
      // no-op
    }

    let result: any;

    const isSpl =
      Boolean(params.tokenMint && params.tokenMint !== "SOL") ||
      Boolean(params.tokenMint === "USDC");

    if (isSpl) {
      // SPL/USDC flows
      if (params.to === params.from.publicKey) {
        // deposit SPL
        result = await pc.depositUSDC({
          base_units: params.amount,
        });
      } else {
        // withdraw SPL
        result = await pc.withdrawUSDC({
          base_units: params.amount,
          recipientAddress: params.to,
        });
      }
    } else {
      // SOL flows
      if (params.to === params.from.publicKey) {
        // deposit SOL
        result = await pc.deposit({
          lamports: params.amount,
        });
      } else {
        // withdraw SOL
        result = await pc.withdraw({
          lamports: params.amount,
          recipientAddress: params.to,
        });
      }
    }

    return {
      signature: result.txId ?? result.txid ?? result.signature ?? "",
      provider: "privacy-cash",
      proof: result,
    };
  },
};
