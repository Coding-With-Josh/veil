export type VeilErrorCode =
  | "PROVIDER_UNAVAILABLE"
  | "UNSUPPORTED_OPERATION"
  | "INVALID_PARAMS"
  | "INTERNAL_ERROR"
  | "INVALID_CONFIG"
  | "WALLET_NOT_FOUND"
  | "TRANSFER_FAILED"
  | "PROVIDER_NOT_SUPPORTED"
  | "ZK_VERIFICATION_FAILED";

export class VeilError extends Error {
  public code: VeilErrorCode;
  public provider?: string;

  constructor(code: VeilErrorCode, message: string, provider?: string) {
    super(message);
    this.name = "VeilError";
    this.code = code;
    this.provider = provider;

    // Restore prototype chain for correct instanceof checks
    Object.setPrototypeOf(this, VeilError.prototype);
  }
}
