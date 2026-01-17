import {
  PrivacyProvider,
  PrivateTransferParams,
  PrivateTransferResult,
  VeilWallet,
} from "../types";

import { ShadowWireClient } from "@radr/shadowwire";

/**
 * ShadowWire adapter — use official ShadowWire npm package
 */
export const shadowwire: PrivacyProvider = {
  name: "shadowwire",

  async createWallet(): Promise<VeilWallet> {
    throw new Error(
      "ShadowWire does not generate wallets. Use Veil.createWallet() instead."
    );
  },

  async privateTransfer(
    params: PrivateTransferParams
  ): Promise<PrivateTransferResult> {
    // Instantiate ShadowWire client with RPC
    const client = new ShadowWireClient({ network: "mainnet-beta" });

    // Note: ShadowWire protocol does not currently support attaching a memo field directly.
    // The memo param is accepted for API consistency but not transmitted.
    if (params.memo) {
      // no-op
    }

    // Decrypt wallet secret (depends on your key handling)
    const secretKey = (params.from as any).secretKey;

    // Build and send transfer
    const res = await client.transfer({
      sender: params.from.publicKey,
      recipient: params.to,
      amount: params.amount,
      token: (params.tokenMint as any) || "SOL",
      type: "internal", // Default to internal shielded transfer
    });

    return {
      signature: res.tx_signature,
      provider: "shadowwire",
      proof: res.proof_pda,
    };
  },

  async getPrivateBalance(wallet: VeilWallet, rpcUrl: string) {
    const sw = new ShadowWireClient({ network: "mainnet-beta" });
    const secretKey = (wallet as any).secretKey;
    const balance = await sw.getBalance(secretKey);
    return balance.available;
  },

  async getPrivateBalanceSpl(wallet: VeilWallet, rpcUrl: string, mint: string) {
    const sw = new ShadowWireClient({ network: "mainnet-beta" });
    const secretKey = (wallet as any).secretKey;
    const balance = await sw.getBalance(secretKey);
    return balance.available;
  },
};
