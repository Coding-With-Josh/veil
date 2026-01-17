import { VeilConfig, VeilWallet, CreateWalletOptions, PrivacyProviderType, PrivateTransferParams, PrivateTransferResult } from "./types";
import { resolvePrivateProvider } from "./providers";
import { createWalletLazorKit } from "./wallet";

/**
 * Core SDK class for Veil
 */
export class Veil {
  public config: VeilConfig;

  constructor(config: VeilConfig) {
    if (!config.network) throw new Error("INVALID_CONFIG: network must be defined");
    this.config = config;
  }

  /* ------------------------------
   * LazorKit Wallet Creation
   * ------------------------------ */
async createWallet(options?: CreateWalletOptions) {
  return createWalletLazorKit(this.config.network, options);
}

  /* ------------------------------
   * Private Transfer
   * ------------------------------ */
  async privateTransfer(
    params: PrivateTransferParams
  ): Promise<PrivateTransferResult> {
    if (!params.from) throw new Error("WALLET_NOT_FOUND");

    const provider = resolvePrivateProvider(params.from.provider);

    // Call the provider directly (Privacy Cash / ShadowWire / etc.)
    return provider.privateTransfer(params);
  }

  /* ------------------------------
   * Helpers
   * ------------------------------ */
  private getDefaultRpcUrl(): string {
    switch (this.config.network) {
      case "mainnet-beta":
        return "https://api.mainnet-beta.solana.com";
      case "testnet":
        return "https://api.testnet.solana.com";
      case "devnet":
      default:
        return "https://api.devnet.solana.com";
    }
  }
}
