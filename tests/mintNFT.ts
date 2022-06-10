import { mintNFT } from '../scripts/mintNFT';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
const argv: any = yargs(hideBin(process.argv)).argv;

describe('will mint NFT', () => {
  it('can mint an NFT', async () => {
    const keypair = argv.keypair;
    await mintNFT({ keypair })
    return true;
  });
});
