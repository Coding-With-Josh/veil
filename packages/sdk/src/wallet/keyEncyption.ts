import crypto from "crypto";

/**
 * Encrypts a Solana secret key with a user‑provided password.
 * Uses AES‑256‑GCM for safe encryption.
 */
export function encryptSecretKey(secretKey: Uint8Array, password: string) {
  const key = crypto.scryptSync(password, "veil_salt", 32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(secretKey),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

/**
 * Decrypts an encrypted secret key back to a raw Uint8Array.
 * Must use the same password used in encryption.
 */
export function decryptSecretKey(
  encryptedKey: string,
  password: string
): Uint8Array {
  const buffer = Buffer.from(encryptedKey, "base64");

  const iv = buffer.slice(0, 12);
  const tag = buffer.slice(12, 28);
  const ciphertext = buffer.slice(28);

  const key = crypto.scryptSync(password, "veil_salt", 32);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

  decipher.setAuthTag(tag);

  const secretBuffer = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return new Uint8Array(secretBuffer);
}
