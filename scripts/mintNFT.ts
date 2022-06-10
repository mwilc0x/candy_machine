import { MintLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { CANDY_MACHINE_PUBLIC_KEY, TOKEN_METADATA_PROGRAM_ID } from '../constants';
import {
  createAssociatedTokenAccountInstruction,
  getMetadata,
  getTokenWallet,
  loadWalletKey,
  program,
  provider,
  getCreatorPDA
} from '../utils';
import collectionKeys from '../collection-keys.json';

export const mintNFT = async ({ keypair }: { keypair: Keypair }) => {
  /* make sure to replace the const 'candyMachine' */
  /* on /constants.ts with your own address,
  that you will get by running scripts/initializeCandyMachine.ts */
  const candyMachineState = await program.account.candyMachine.fetch(
    CANDY_MACHINE_PUBLIC_KEY
  );
  
  const mint = Keypair.generate();
  const userKeyPair = loadWalletKey(keypair);
  const collectionKeyPair = loadWalletKey("./.wallets/cm-authority/id-devnet.json");

  const userTokenAccountAddress = await getTokenWallet(
    userKeyPair.publicKey,
    mint.publicKey,
  );

  const metadata = await getMetadata(mint.publicKey);
  const rent = await provider.connection.getMinimumBalanceForRentExemption(
    MintLayout.span
  );

  let creatorPDAPubkey;
  [creatorPDAPubkey] = await getCreatorPDA(CANDY_MACHINE_PUBLIC_KEY, collectionKeyPair.publicKey);

  const {
    collectionMint,
    collectionMetadata,
    collectionMasterEdition,
    collectionPda
  } = collectionKeys;

  const accounts = {
    candyMachine: CANDY_MACHINE_PUBLIC_KEY,
    authority: candyMachineState.authority,
    mint: mint.publicKey,
    metadata,
    mintAuthority: userKeyPair.publicKey,
    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    rent: SYSVAR_RENT_PUBKEY,

    collectionMint,
    collectionMetadata,
    collectionMasterEdition,
    collectionPda,
    creator: collectionKeyPair.publicKey,
    creatorPda: creatorPDAPubkey
  };

  const result = await program.methods
    .mintNft('Shrek #1', 'https://api.amoebits.io/get/amoebits_1')
    .accounts(accounts)
    .signers([mint, userKeyPair])
    .preInstructions([
      /* create a token/mint account and pay the rent */
      SystemProgram.createAccount({
        fromPubkey: userKeyPair.publicKey,
        newAccountPubkey: mint.publicKey,
        space: MintLayout.span,
        lamports: rent,
        programId: TOKEN_PROGRAM_ID
      }),
      Token.createInitMintInstruction(
        TOKEN_PROGRAM_ID,
        mint.publicKey,
        0, // decimals
        userKeyPair.publicKey, // mint authority
        userKeyPair.publicKey // freeze authority
      ),
      /* create an account that will hold your NFT */
      createAssociatedTokenAccountInstruction(
        userTokenAccountAddress, // associated account
        userKeyPair.publicKey, // payer
        userKeyPair.publicKey, // wallet address (to)
        mint.publicKey // mint/token address
      ),
      /* mint a NFT to the mint account */
      Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        mint.publicKey, // from
        userTokenAccountAddress, // account that will receive the metadata
        userKeyPair.publicKey, // authority
        [],
        1 // amount
      )
    ])
    .rpc();

    console.log('nft minted:', result);
}
