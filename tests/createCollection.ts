import { Keypair, PublicKey } from '@solana/web3.js';
import { createCollection } from '../scripts/createCollection';
import { program } from '../utils';
import { CANDY_MACHINE_PUBLIC_KEY } from '../constants';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
const argv: any = yargs(hideBin(process.argv)).argv;

describe('Creating a collection', () => {
  it('create a collection NFT', async () => {
    const keypair = argv.keypair;
    const candyMachineAddress = new PublicKey(CANDY_MACHINE_PUBLIC_KEY);
    await createCollection({ 
      walletKeyPair: keypair,
      anchorProgram: program,
      candyMachineAddress
    })
  });
});
