import { PublicKey } from '@solana/web3.js';
import { bootstrapWallets } from '../scripts/bootstrapWallets';
import { farmProgram } from '../utils';
import { FARM_PUBLIC_KEY } from '../constants';
// import yargs from 'yargs/yargs';
// import { hideBin } from 'yargs/helpers';
// const argv: any = yargs(hideBin(process.argv)).argv;

describe('Bootstrapping wallets', () => {
    it('checks old wallets balances', async () => {
        await bootstrapWallets();
    });
});
