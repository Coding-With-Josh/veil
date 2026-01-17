import { VeilWallet, CreateWalletOptions, PrivacyProviderType } from "../types";

// LazorKit imports
import { LazorkitProvider, useWallet as useLazorWallet } from "@lazorkit/wallet";
import { Keypair } from "@solana/web3.js";
import { encryptSecretKey } from "./keyEncyption";
/**
 * Production-ready wallet creation using the LazorKit passkey wallet.
 * This function must be called from a browser context where WebAuthn is available.
 */
export async function createWalletLazorKit(
  network: string,
  options?: CreateWalletOptions
): Promise<VeilWallet> {
  // provider fallback
    const keypair = Keypair.generate(); // generate a new Solana keypair
  const publicKey = keypair.publicKey.toBase58();
  const secretUint8 = keypair.secretKey;
  const provider: PrivacyProviderType = options?.provider ?? "privacy-cash";

  // LazorKit signup flow
  // Wrap your application (or SDK consumer) in LazorKitProvider
  // e.g., <LazorKitProvider rpcUrl="..." portalUrl="..."> ... </>
  const encryptedSecretKey = encryptSecretKey(secretUint8, options?.password ?? "");
  const { connect, isConnected, smartWalletPubkey, wallet } = useLazorWallet();

  // triggers passkey prompt
  await connect();

  if (!isConnected || !smartWalletPubkey) {
    throw new Error("Failed to connect passkey wallet");
  }

  return {
    id: crypto.randomUUID(),
    encryptedSecretKey,
    publicKey: smartWalletPubkey.toBase58(),         // Solana smart wallet pubkey
    passkeyCredentialId: wallet?.credentialId ?? "",  // WebAuthn passkey identifier
    provider,
    createdAt: Date.now(),
  };
}
