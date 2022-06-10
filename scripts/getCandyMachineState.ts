import {
  PublicKey,
} from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import { CANDY_MACHINE_PUBLIC_KEY } from '../constants';
import {
  program,
} from '../utils';

export const getCandyMachineState = async () => {
    const myDataAcc = await program.account.candyMachine.fetch(CANDY_MACHINE_PUBLIC_KEY);
    console.log(parseCandyMachineStateData(myDataAcc.data));
}

function parseCandyMachineStateData(data) {
  return {
    price: new BN(data.price).toString(),
    nftsMinted: new BN(data.nftsMinted).toString(),
    goLiveDate: new BN(data.goLiveDate).toString(),
    creators: data.creators.map(c => ({
      address: new PublicKey(c.address),
      verified: c.verified,
      share: c.share
    })),
    symbol: data.symbol,
    sellerFeeBasisPoints: data.sellerFeeBasisPoints,
    maxSupply: new BN(data.maxSupply).toString(),
    collectionMintKey: new PublicKey(data.collectionMintKey)
  }
}