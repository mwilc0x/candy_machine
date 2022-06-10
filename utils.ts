require('dotenv').config();
import fs from 'fs';
import {
  AnchorProvider,
  Idl,
  Program,
  setProvider,
  workspace,
  web3
} from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction
} from '@solana/web3.js';

import {
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  TOKEN_METADATA_PROGRAM_ID,
  CANDY_MACHINE_PROGRAM_ID
} from './constants';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';

export const createAssociatedTokenAccountInstruction = (
  associatedTokenAddress: PublicKey,
  payer: PublicKey,
  walletAddress: PublicKey,
  splTokenMintAddress: PublicKey
) => {
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
    { pubkey: walletAddress, isSigner: false, isWritable: false },
    { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false
    },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false
    }
  ];

  const account = new TransactionInstruction({
    keys,
    programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    data: Buffer.from([])
  });

  return account;
}

export const getMetadata = async (mint: PublicKey): Promise<PublicKey> => {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer()
      ],
      TOKEN_METADATA_PROGRAM_ID
    )
  )[0];
}

export const getMasterEdition = async (
  mint: web3.PublicKey,
): Promise<web3.PublicKey> => {
  return (
    await web3.PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from('edition'),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    )
  )[0];
};

export const getCreatorPDA = async (
  candyMachineAddress: web3.PublicKey,
  creator: web3.PublicKey,
): Promise<[web3.PublicKey, number]> => {
  return await web3.PublicKey.findProgramAddress(
    [Buffer.from('creator'), candyMachineAddress.toBuffer(), creator.toBuffer()],
    CANDY_MACHINE_PROGRAM_ID,
  );
};

export const getCollectionPDA = async (
  candyMachineAddress: web3.PublicKey,
  ownerAddress: web3.PublicKey,
): Promise<[web3.PublicKey, number]> => {
  return await web3.PublicKey.findProgramAddress(
    [Buffer.from('collection'), candyMachineAddress.toBuffer(), ownerAddress.toBuffer()],
    CANDY_MACHINE_PROGRAM_ID,
  );
};

export const getCollectionAuthorityRecordPDA = async (
  mint: web3.PublicKey,
  newAuthority: web3.PublicKey,
): Promise<[web3.PublicKey, number]> => {
  return await web3.PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from('collection_authority'),
      newAuthority.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID,
  );
};

export const getTokenWallet = async (
  wallet: PublicKey,
  mint: PublicKey
) => {
  return (
    await PublicKey.findProgramAddress(
      [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    )
  )[0];
}

export function parsePrice(
  price: number,
  mantissa: number = LAMPORTS_PER_SOL
) {
  return Math.ceil(price * mantissa);
}

export function loadWalletKey(keypair): Keypair {
  if (!keypair || keypair == '') {
    throw new Error('Keypair is required!');
  }

  const decodedKey = new Uint8Array(
    keypair.endsWith('.json') && !Array.isArray(keypair)
      ? JSON.parse(fs.readFileSync(keypair).toString())
      : bs58.decode(keypair),
  );

  const loaded = Keypair.fromSecretKey(decodedKey);
  return loaded;
}

export const provider = AnchorProvider.env();
setProvider(provider);

export const DEVNET_WALLET = provider.wallet;
export const program = workspace.NftBuoy as Program<Idl>;
