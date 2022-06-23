import { MintLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  PublicKey
} from '@solana/web3.js';
import { FARM_PUBLIC_KEY, TOKEN_METADATA_PROGRAM_ID } from '../constants';
import {
  createAssociatedTokenAccountInstruction,
  getMetadata,
  getTokenWallet,
  loadWalletKey,
  farmProgram,
  provider,
  getFarmAuthority
} from '../utils';

import farmIDL from '../target/idl/farm.json'

export const mintNFT = async ({ keypair }: { keypair: Keypair }) => {
  /* make sure to replace the const 'farm' */
  /* on /constants.ts with your own address,
  that you will get by running scripts/initializeFarm.ts */
  const farmState = await farmProgram.account.farm.fetch(
    FARM_PUBLIC_KEY
  );

  const mint = Keypair.generate();
  const payer = loadWalletKey(keypair);
  // const creator = loadWalletKey("/Users/mike/.config/solana/test/art_farm/devnet/creator.json");

  const userTokenAccountAddress = await getTokenWallet(
    payer.publicKey,
    mint.publicKey,
  );

  const metadata = await getMetadata(mint.publicKey);
  const rent = await provider.connection.getMinimumBalanceForRentExemption(
    MintLayout.span
  );

  const farm = loadWalletKey("/Users/mike/.config/solana/test/art_farm/devnet/farm.json");
  /* generating a PDA */
  const [farmAuth, farmAuthBump] = await PublicKey.findProgramAddress(
    [farm.publicKey.toBytes()],
    new PublicKey(farmIDL.metadata.address),
  );

  const accounts = {
    farm: FARM_PUBLIC_KEY,
    authority: farmState.authority,
    farmAuthority: farmAuth,
    mint: mint.publicKey,
    metadata,
    mintAuthority: payer.publicKey,
    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    rent: SYSVAR_RENT_PUBKEY,
  };

  const result = await farmProgram.methods
    .mintNft(farmAuthBump)
    .accounts(accounts)
    .signers([mint, payer])
    .preInstructions([
      /* create a token/mint account and pay the rent */
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint.publicKey,
        space: MintLayout.span,
        lamports: rent,
        programId: TOKEN_PROGRAM_ID
      }),
      Token.createInitMintInstruction(
        TOKEN_PROGRAM_ID,
        mint.publicKey,
        0, // decimals
        payer.publicKey, // mint authority
        payer.publicKey // freeze authority
      ),
      /* create an account that will hold your NFT */
      createAssociatedTokenAccountInstruction(
        userTokenAccountAddress, // associated account
        payer.publicKey, // payer
        payer.publicKey, // wallet address (to)
        mint.publicKey // mint/token address
      ),
      /* mint a NFT to the mint account */
      Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        mint.publicKey, // from
        userTokenAccountAddress, // account that will receive the metadata
        payer.publicKey, // authority
        [],
        1 // amount
      )
    ])
    .rpc();

  console.log('nft minted:', result);
}
