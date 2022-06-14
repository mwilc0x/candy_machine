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
  program,
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
  anchorProgram: Program,
  farmAddress: PublicKey
}

export const createCollection = async ({
  anchorProgram,
  farmAddress,
  walletKeyPair 
}: CreateCollectionArguments) => {
  const wallet = loadWalletKey(walletKeyPair);
  const signers = [wallet];
  const instructions = [];
  let mintPubkey: PublicKey;
  let metadataPubkey: PublicKey;
  let masterEditionPubkey: PublicKey;
  let collectionPDAPubkey: PublicKey;
  let collectionAuthorityRecordPubkey: PublicKey;

  const farm: any = await anchorProgram.account.farm.fetch(
    farmAddress,
  );

  const mint = web3.Keypair.generate();
  mintPubkey = mint.publicKey;
  await fs.promises.writeFile('collection-secret.json', `[${mint.secretKey.toString()}]`);
  
  metadataPubkey = await getMetadata(mintPubkey);
  masterEditionPubkey = await getMasterEdition(mintPubkey);
  [collectionPDAPubkey] = await getCollectionPDA(farmAddress, wallet.publicKey);
  [collectionAuthorityRecordPubkey] = await getCollectionAuthorityRecordPDA(
    mintPubkey,
    collectionPDAPubkey,
  );
  signers.push(mint);

  const userTokenAccountAddress = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint.publicKey,
    wallet.publicKey,
  );

  instructions.push(
    ...[
      web3.SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintPubkey,
        space: MintLayout.span,
        lamports:
          await anchorProgram.provider.connection.getMinimumBalanceForRentExemption(
            MintLayout.span,
          ),
        programId: TOKEN_PROGRAM_ID,
      }),
      Token.createInitMintInstruction(
        TOKEN_PROGRAM_ID,
        mintPubkey,
        0,
        wallet.publicKey,
        wallet.publicKey,
      ),
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintPubkey,
        userTokenAccountAddress,
        wallet.publicKey,
        wallet.publicKey,
      ),
      Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        mintPubkey,
        userTokenAccountAddress,
        wallet.publicKey,
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
        address: wallet.publicKey.toBase58(),
        verified: true,
        share: 100,
      }),
    ],
    collection: null,
    uses: null,
  });

  instructions.push(
    ...new CreateMetadataV2(
      { feePayer: wallet.publicKey },
      {
        metadata: metadataPubkey,
        metadataData: data,
        updateAuthority: wallet.publicKey,
        mint: mintPubkey,
        mintAuthority: wallet.publicKey,
      },
    ).instructions,
  );

  instructions.push(
    ...new CreateMasterEditionV3(
      {
        feePayer: wallet.publicKey,
      },
      {
        edition: masterEditionPubkey,
        metadata: metadataPubkey,
        mint: mintPubkey,
        mintAuthority: wallet.publicKey,
        updateAuthority: wallet.publicKey,
        maxSupply: new BN(0),
      },
    ).instructions,
  );

  instructions.push(
    await anchorProgram.instruction.setCollection({
      accounts: {
        farm: farmAddress,
        authority: wallet.publicKey,
        collectionPda: collectionPDAPubkey,
        payer: wallet.publicKey,
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
  console.log('Collection metadata authority: ', wallet.publicKey.toBase58());
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
    collectionMetadataAuthority: wallet.publicKey.toBase58(),
    collectionMasterEdition: masterEditionPubkey.toBase58(),
    collectionMint: mintPubkey.toBase58(),
    collectionPda: collectionPDAPubkey.toBase58(),
    collectionAuthorityRecord: collectionAuthorityRecordPubkey.toBase58()
  };

  await fs.promises.writeFile('collection-keys.json', JSON.stringify(collectionKeys));

  const txId = (
    await sendTransactionWithRetryWithKeypair(
      anchorProgram.provider.connection,
      wallet,
      instructions,
      signers, 
    )
  ).txid;
  const toReturn = {
    collectionMintKey: mintPubkey,
    txId,
  };
  console.log('Completed transaction', toReturn);

  const [farmPDA] = await PublicKey.findProgramAddress(
    [Buffer.from(PREFIX)],
    new PublicKey(idl.metadata.address)
  );

  const updateCollectionAccounts = {
    farm: farmPDA,
    authority: wallet.publicKey
  };

  await program.methods
    .updateFarmCollection(mintPubkey)
    .accounts(updateCollectionAccounts)
    .rpc();

  return toReturn;
}
