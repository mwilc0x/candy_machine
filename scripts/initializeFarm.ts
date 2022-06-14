import { BN } from '@project-serum/anchor';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { 
  loadWalletKey, 
  parsePrice, 
  program, 
  provider,
  getCreatorPDA
} from '../utils';

import { PREFIX } from '../constants'
import idl from '../target/idl/farm.json'

type FarmInitData = {
  keypair: Keypair,
  maxSupply: number,
  itemsAvailable: number,
  price: number,
  sellerFeeBasisPoints: number,
  symbol: string,
  goLiveDate: number
};

export const initializeFarm = async <FarmInitData>(initData) => {
  let creatorPDAPubkey;
  const adminKeyPair = loadWalletKey(initData.keypair);

  /* generating a PDA */
  const [farm] = await PublicKey.findProgramAddress(
    [Buffer.from(PREFIX)],
    new PublicKey(idl.metadata.address)
  );

  [creatorPDAPubkey] = await getCreatorPDA(farm, adminKeyPair.publicKey);

  const params = {
    price: new BN(parsePrice(initData.price)),
    nftsMinted: new BN(0),
    goLiveDate: new BN(initData.goLiveDate),
    creators: [
      { address: adminKeyPair.publicKey, verified: true, share: 100 }
    ],
    symbol: initData.symbol,
    sellerFeeBasisPoints: initData.sellerFeeBasisPoints, // 500 = 5%
    maxSupply: new BN(initData.maxSupply),
    collectionMintKey: initData.collectionMintKey
  };

  console.log('\n take this address and replace on /constants.ts');
  console.log('\n farm address: ', farm.toString());

  const accounts = {
    farm,
    authority: provider.wallet.publicKey,
    systemProgram: SystemProgram.programId,
  };

  const txn = await program.methods
    .initializeFarm(params)
    .accounts(accounts)
    .rpc();

  console.log('Completed initialization of farm.', txn);
}
