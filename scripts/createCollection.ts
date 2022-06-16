import fs from 'fs';

import {
  Keypair,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  MintLayout,
  Token,
} from '@solana/spl-token';
import { BN, Program, web3 } from '@project-serum/anchor';
import {
  Creator,
  DataV2,
  CreateMetadataV2,
  CreateMasterEditionV3,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  farmProgram,
  loadWalletKey,
  getMasterEdition,
  getCollectionPDA,
  getMetadata,
  getCollectionAuthorityRecordPDA,
} from '../utils';
import { TOKEN_METADATA_PROGRAM_ID, PREFIX } from '../constants';
import { sendTransactionWithRetryWithKeypair } from '../helpers';
import idl from '../target/idl/farm.json';

type CreateCollectionArguments = {
  walletKeyPair: Keypair,
  farmProgram: Program,
  farmAddress: PublicKey
}

export const createCollection = async ({
  farmProgram,
  farmAddress,
  walletKeyPair 
}: CreateCollectionArguments) => {
  // const wallet = loadWalletKey(walletKeyPair);
  const creator = loadWalletKey("/Users/mike/.config/solana/test/art_farm/devnet/creator.json");
  const signers = [creator];
  const instructions = [];
  let mintPubkey: PublicKey;
  let metadataPubkey: PublicKey;
  let masterEditionPubkey: PublicKey;
  let collectionPDAPubkey: PublicKey;
  let collectionAuthorityRecordPubkey: PublicKey;

  const farm: any = await farmProgram.account.farm.fetch(
    farmAddress,
  );

  const mint = web3.Keypair.generate();
  mintPubkey = mint.publicKey;
  await fs.promises.writeFile('collection-secret.json', `[${mint.secretKey.toString()}]`);
  
  metadataPubkey = await getMetadata(mintPubkey);
  masterEditionPubkey = await getMasterEdition(mintPubkey);
  [collectionPDAPubkey] = await getCollectionPDA(farmAddress, creator.publicKey);
  [collectionAuthorityRecordPubkey] = await getCollectionAuthorityRecordPDA(
    mintPubkey,
    collectionPDAPubkey,
  );
  signers.push(mint);

  const userTokenAccountAddress = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint.publicKey,
    creator.publicKey,
  );

  instructions.push(
    ...[
      web3.SystemProgram.createAccount({
        fromPubkey: creator.publicKey,
        newAccountPubkey: mintPubkey,
        space: MintLayout.span,
        lamports:
          await farmProgram.provider.connection.getMinimumBalanceForRentExemption(
            MintLayout.span,
          ),
        programId: TOKEN_PROGRAM_ID,
      }),
      Token.createInitMintInstruction(
        TOKEN_PROGRAM_ID,
        mintPubkey,
        0,
        creator.publicKey,
        creator.publicKey,
      ),
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintPubkey,
        userTokenAccountAddress,
        creator.publicKey,
        creator.publicKey,
      ),
      Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        mintPubkey,
        userTokenAccountAddress,
        creator.publicKey,
        [],
        1,
      ),
    ],
  );

  const data = new DataV2({
    symbol: farm.data.symbol ?? '',
    name: 'Collection NFT',
    uri: '',
    sellerFeeBasisPoints: farm.data.seller_fee_basis_points,
    creators: [
      new Creator({
        address: creator.publicKey.toBase58(),
        verified: true,
        share: 100,
      }),
    ],
    collection: null,
    uses: null,
  });

  instructions.push(
    ...new CreateMetadataV2(
      { feePayer: creator.publicKey },
      {
        metadata: metadataPubkey,
        metadataData: data,
        updateAuthority: creator.publicKey,
        mint: mintPubkey,
        mintAuthority: creator.publicKey,
      },
    ).instructions,
  );

  instructions.push(
    ...new CreateMasterEditionV3(
      {
        feePayer: creator.publicKey,
      },
      {
        edition: masterEditionPubkey,
        metadata: metadataPubkey,
        mint: mintPubkey,
        mintAuthority: creator.publicKey,
        updateAuthority: creator.publicKey,
        maxSupply: new BN(0),
      },
    ).instructions,
  );

  instructions.push(
    await farmProgram.instruction.setCollection({
      accounts: {
        farm: farmAddress,
        farmManager: creator.publicKey,
        collectionPda: collectionPDAPubkey,
        payer: creator.publicKey,
        systemProgram: SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
        metadata: metadataPubkey,
        mint: mintPubkey,
        edition: masterEditionPubkey,
        collectionAuthorityRecord: collectionAuthorityRecordPubkey,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      },
    }),
  );

  console.log('Farm address: ', farmAddress.toBase58());
  console.log('Collection metadata address: ', metadataPubkey.toBase58());
  console.log('Collection metadata authority: ', creator.publicKey.toBase58());
  console.log(
    'Collection master edition address: ',
    masterEditionPubkey.toBase58(),
  );
  console.log('Collection mint address: ', mintPubkey.toBase58());
  console.log('Collection PDA address: ', collectionPDAPubkey.toBase58());
  console.log(
    'Collection authority record address: ',
    collectionAuthorityRecordPubkey.toBase58(),
  );

  const collectionKeys = {
    farmAddress: farmAddress.toBase58(),
    collectionMetadata: metadataPubkey.toBase58(),
    collectionMetadataAuthority: creator.publicKey.toBase58(),
    collectionMasterEdition: masterEditionPubkey.toBase58(),
    collectionMint: mintPubkey.toBase58(),
    collectionPda: collectionPDAPubkey.toBase58(),
    collectionAuthorityRecord: collectionAuthorityRecordPubkey.toBase58()
  };

  await fs.promises.writeFile('collection-keys.json', JSON.stringify(collectionKeys));

  const txId = (
    await sendTransactionWithRetryWithKeypair(
      farmProgram.provider.connection,
      creator,
      instructions,
      signers, 
    )
  ).txid;
  const toReturn = {
    collectionMintKey: mintPubkey,
    txId,
  };
  console.log('Completed transaction', toReturn);

  const updateCollectionAccounts = {
    farm: farmAddress,
    farmManager: creator.publicKey
  };

  await farmProgram.methods
    .updateFarmCollection(mintPubkey)
    .accounts(updateCollectionAccounts)
    .signers([creator])
    .rpc();

  return toReturn;
}