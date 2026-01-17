import { VeilWallet } from "../types";
import { PrivacyCash } from "privacycash";
import { decryptSecretKey } from "../wallet/keyEncyption";

/**
 * Query private SOL balance
 */
export async function getPrivacyCashSolBalance(
  wallet: VeilWallet,
  rpcUrl: string,
  password: string
) {
  const secretKey = decryptSecretKey(wallet.encryptedSecretKey, password);
  const pc = new PrivacyCash({ RPC_url: rpcUrl, owner: secretKey });
  return pc.getPrivateBalance();
}

/**
 * Query private USDC balance
 */
export async function getPrivacyCashUsdcBalance(
  wallet: VeilWallet,
  rpcUrl: string,
  password: string
) {
  const secretKey = decryptSecretKey(wallet.encryptedSecretKey, password);
  const pc = new PrivacyCash({ RPC_url: rpcUrl, owner: secretKey });
  return pc.getPrivateBalanceUSDC();
}

/**
 * Query private balance for any SPL token
 */
export async function getPrivacyCashSplBalance(
  wallet: VeilWallet,
  rpcUrl: string,
  mintAddress: string,
  password: string
) {
  const secretKey = decryptSecretKey(wallet.encryptedSecretKey, password);
  const pc = new PrivacyCash({ RPC_url: rpcUrl, owner: secretKey });
  return pc.getPrivateBalanceSpl(mintAddress);
}
