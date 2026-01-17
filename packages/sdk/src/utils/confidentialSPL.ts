import {
  Connection,
  PublicKey,
  Transaction,
  Keypair,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  createInitializeAccountInstruction,
  TOKEN_2022_PROGRAM_ID,
  MINT_SIZE,
  getExtensionTypes,
  ExtensionType,
} from "@solana/spl-token";

// Extension instruction index
const CONFIDENTIAL_TRANSFER_EXTENSION_IX = 27;

// Sub-instruction indices
enum ConfidentialTransferInstruction {
  InitializeMint = 0,
  UpdateMint = 1,
  ConfigureAccount = 2,
  Deposit = 3,
  Withdraw = 4,
  Transfer = 5,
  ApplyPendingBalance = 6,
}

/**
 * Initialize a confidential SPL mint (Token-2022 + CT extension).
 */
export async function initConfidentialMint({
  connection,
  payer,
  mint,
  decimals,
  authority = payer.publicKey,
  autoApprove = true,
}: {
  connection: Connection;
  payer: Keypair;
  mint: PublicKey;
  decimals: number;
  authority?: PublicKey;
  autoApprove?: boolean;
}) {
  const lamports = await connection.getMinimumBalanceForRentExemption(
    MINT_SIZE + 2 + 2 + 65
  ); // Base + Type + Len + Data

  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint,
      space: MINT_SIZE + 2 + 2 + 65,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    })
  );

  // 1. Initialize Extension State
  const extensionData = Buffer.alloc(1 + 1 + 33 + 1 + 33);
  extensionData.writeUInt8(CONFIDENTIAL_TRANSFER_EXTENSION_IX, 0);
  extensionData.writeUInt8(ConfidentialTransferInstruction.InitializeMint, 1);

  // Authority (Option<Pubkey>)
  extensionData.writeUInt8(1, 2);
  extensionData.set(authority.toBuffer(), 3);

  // Auto-approve
  extensionData.writeUInt8(autoApprove ? 1 : 0, 35);

  // Auditor (Option<Pubkey>) - Set to null (0) for now
  extensionData.writeUInt8(0, 36);

  tx.add(
    new TransactionInstruction({
      keys: [{ pubkey: mint, isSigner: false, isWritable: true }],
      programId: TOKEN_2022_PROGRAM_ID,
      data: extensionData,
    })
  );

  // 2. Initialize Mint
  tx.add(
    createInitializeMintInstruction(
      mint,
      decimals,
      payer.publicKey,
      null,
      TOKEN_2022_PROGRAM_ID
    )
  );

  await connection.sendTransaction(tx, [payer]);
}

/**
 * Initialize confidential transfer for a token account
 */
export async function initConfidentialTokenAccount({
  connection,
  payer,
  tokenAccount,
  mint,
}: {
  connection: Connection;
  payer: Keypair;
  tokenAccount: PublicKey;
  mint: PublicKey;
}) {
  // 1. ConfigureAccount instruction for the extension
  const extensionData = Buffer.alloc(2);
  extensionData.writeUInt8(CONFIDENTIAL_TRANSFER_EXTENSION_IX, 0);
  extensionData.writeUInt8(ConfidentialTransferInstruction.ConfigureAccount, 1);

  const tx = new Transaction().add(
    new TransactionInstruction({
      keys: [
        { pubkey: tokenAccount, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
      ],
      programId: TOKEN_2022_PROGRAM_ID,
      data: extensionData,
    })
  );

  await connection.sendTransaction(tx, [payer]);
}

/**
 * Deposit tokens into the confidential balance
 */
export async function confidentialDeposit({
  connection,
  payer,
  tokenAccount,
  amount,
}: {
  connection: Connection;
  payer: Keypair;
  tokenAccount: PublicKey;
  amount: bigint;
}) {
  const data = Buffer.alloc(1 + 1 + 8);
  data.writeUInt8(CONFIDENTIAL_TRANSFER_EXTENSION_IX, 0);
  data.writeUInt8(ConfidentialTransferInstruction.Deposit, 1);
  data.writeBigUInt64LE(amount, 2);

  const ix = new TransactionInstruction({
    keys: [
      { pubkey: tokenAccount, isSigner: false, isWritable: true },
      { pubkey: payer.publicKey, isSigner: true, isWritable: false },
    ],
    programId: TOKEN_2022_PROGRAM_ID,
    data,
  });

  const tx = new Transaction().add(ix);
  await connection.sendTransaction(tx, [payer]);
}

/**
 * Transfer confidentially between two accounts
 */
export async function confidentialTransfer({
  connection,
  payer,
  from,
  to,
  amount,
}: {
  connection: Connection;
  payer: Keypair;
  from: PublicKey;
  to: PublicKey;
  amount: bigint;
}) {
  const data = Buffer.alloc(1 + 1); // Proofs omitted in stub
  data.writeUInt8(CONFIDENTIAL_TRANSFER_EXTENSION_IX, 0);
  data.writeUInt8(ConfidentialTransferInstruction.Transfer, 1);

  const ix = new TransactionInstruction({
    keys: [
      { pubkey: from, isSigner: false, isWritable: true },
      { pubkey: to, isSigner: false, isWritable: true },
      { pubkey: payer.publicKey, isSigner: true, isWritable: false },
    ],
    programId: TOKEN_2022_PROGRAM_ID,
    data,
  });

  const tx = new Transaction().add(ix);
  await connection.sendTransaction(tx, [payer]);
}

/**
 * Withdraw from the confidential balance
 */
export async function confidentialWithdraw({
  connection,
  payer,
  tokenAccount,
  amount,
}: {
  connection: Connection;
  payer: Keypair;
  tokenAccount: PublicKey;
  amount: bigint;
}) {
  const data = Buffer.alloc(1 + 1 + 8);
  data.writeUInt8(CONFIDENTIAL_TRANSFER_EXTENSION_IX, 0);
  data.writeUInt8(ConfidentialTransferInstruction.Withdraw, 1);
  data.writeBigUInt64LE(amount, 2);

  const ix = new TransactionInstruction({
    keys: [
      { pubkey: tokenAccount, isSigner: false, isWritable: true },
      { pubkey: payer.publicKey, isSigner: true, isWritable: false },
    ],
    programId: TOKEN_2022_PROGRAM_ID,
    data,
  });

  const tx = new Transaction().add(ix);
  await connection.sendTransaction(tx, [payer]);
}
