import { BN } from '@project-serum/anchor';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { 
  loadWalletKey, 
  parsePrice, 
  farmProgram, 
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
  const farm = loadWalletKey("/Users/mike/.config/solana/test/art_farm/devnet/farm.json");
  const creator = loadWalletKey("/Users/mike/.config/solana/test/art_farm/devnet/creator.json");
  const payer = loadWalletKey("/Users/mike/.config/solana/test/art_farm/devnet/payer.json");
  const bank = loadWalletKey("/Users/mike/.config/solana/test/art_farm/devnet/bank.json");
  const sales = loadWalletKey("/Users/mike/.config/solana/test/art_farm/devnet/sales.json");
  const manager = loadWalletKey("/Users/mike/.config/solana/test/art_farm/devnet/manager.json");

  /* generate Farm Authority PDA */
  const [farmAuth, farmAuthBump] = await PublicKey.findProgramAddress(
    [farm.publicKey.toBytes()],
    new PublicKey(farmIDL.metadata.address),
  );

  // /* generate Creator Authority PDA */
  // const [creatorAuth, creatorAuthBump] = await PublicKey.findProgramAddress(
  //   [creator.publicKey.toBytes()],
  //   new PublicKey(farmIDL.metadata.address),
  // );

  const params = {
    price: new BN(parsePrice(initData.price)),
    nftsMinted: new BN(0),
    goLiveDate: new BN(initData.goLiveDate),
    creators: [
      // we verify later with PDA
      { address: creator.publicKey, verified: false, share: 100 }
    ],
    symbol: initData.symbol,
    sellerFeeBasisPoints: initData.sellerFeeBasisPoints, // 500 = 5%
    maxSupply: new BN(initData.maxSupply),
    collectionMintKey: initData.collectionMintKey
  };

  console.log('\n take this address and replace on /constants.ts');
  console.log('\n farm address: ', farm.publicKey.toString());

  const signers = [farm, payer, bank, sales, manager];

  console.log(`
    farm ${farm.publicKey.toString()}
    farmAuth ${farmAuth.toString()}
    payer ${payer.publicKey.toString()}
    sales ${sales.publicKey.toString()}
    manager ${manager.publicKey.toString()}
  `);

  const accounts = {
    farm: farm.publicKey,
    // receives all sales of nft
    authority: sales.publicKey,

    // can sign for metadata
    farmAuthority: farmAuth,
    
    // // can sign for creator
    // creatorAuthority: creatorAuth,

    farmManager: manager.publicKey,
    
    bank: bank.publicKey,
    artBank: new PublicKey(bankIDL.metadata.address),
    
    // this has to be someone completely separate
    payer: payer.publicKey,

    systemProgram: SystemProgram.programId,
  };

  const txn = await farmProgram.methods
    .initFarm(farmAuthBump, params)
    .accounts(accounts)
    .signers(signers)
    .rpc();

  console.log('Completed initialization of farm.', txn);
}
