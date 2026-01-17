import { VeilWallet, PrivacyProvider } from "../types";

/**
 * Common private balance helper across providers (SOL & SPL).
 * Assumes each provider adapter implements its own balance logic.
 */
export async function getPrivateBalance(
  provider: PrivacyProvider,
  wallet: VeilWallet,
  rpcUrl: string,
  mintAddress?: string
): Promise<number> {
  // Some providers expose balance functions directly
  // We check for known provider types and call accordingly.

  switch (provider.name) {
    case "privacy-cash":
      // Privacy Cash supports SOL & SPL
      if (mintAddress) {
        return await (provider as any).getPrivateBalanceSpl(wallet, rpcUrl, mintAddress);
      }
      return await (provider as any).getPrivateBalance(wallet, rpcUrl);

    case "shadowwire":
      // ShadowWire returns a private balance via its client
      return await (provider as any).getPrivateBalance(wallet, rpcUrl);

    default:
      throw new Error(`Provider ${provider.name} does not support getPrivateBalance.`);
  }
}
