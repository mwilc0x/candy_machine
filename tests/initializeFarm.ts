import { initializeFarm } from '../scripts/initializeFarm';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
const argv: any = yargs(hideBin(process.argv)).argv;

describe('setup the farm', () => {
  it('can initialize a farm', async () => {
    const keypair = argv.keypair;
    const price = 0.2;
    const symbol = 'ABC';
    const maxSupply = 500;
    const sellerFeeBasisPoints = 500;
    const goLiveDate = 1640889000;
    const collectionMintKey = null;

    await initializeFarm({ 
      keypair, maxSupply, price, sellerFeeBasisPoints,
      symbol, goLiveDate, collectionMintKey
    })
  });
});
