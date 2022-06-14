import { BN } from '@project-serum/anchor';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { 
  loadWalletKey, 
  parsePrice, 
  program, 
  provider,
  getCreatorPDA
} from '../utils';

import farmIDL from '../target/idl/farm.json'
import bankIDL from '../target/idl/bank.json'

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

  const farm = Keypair.generate();

  /* generating a PDA */
  const [farmAuth, farmAuthBump] = await PublicKey.findProgramAddress(
    [farm.publicKey.toBytes()],
    new PublicKey(farmIDL.metadata.address),
  );

  [creatorPDAPubkey] = await getCreatorPDA(farm.publicKey, adminKeyPair.publicKey);

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
  console.log('\n farm address: ', farm.publicKey.toString());

  const signers = [farm, adminKeyPair];

  const accounts = {
    farm: farm.publicKey,
    authority: provider.wallet.publicKey,
    farmAuthority: farmAuth,
    farmManager: provider.wallet.publicKey,
    bank: provider.wallet.publicKey,
    artBank: new PublicKey(bankIDL.metadata.address),
    payer: provider.wallet.publicKey,
    systemProgram: SystemProgram.programId,
  };

  const txn = await program.methods
    .initFarm(farmAuthBump, params)
    .accounts(accounts)
    .signers(signers)
    .rpc();

  console.log('Completed initialization of farm.', txn);
}
