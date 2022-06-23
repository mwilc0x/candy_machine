import { initializeFarm } from '../scripts/initializeFarm';

describe('setup the farm', () => {
  it('can initialize a farm', async () => {
    const price = 1.0;
    const symbol = 'KALE';
    const maxSupply = 1337;
    const sellerFeeBasisPoints = 750;
    const goLiveDate = 1640889000;
    const collectionMintKey = null;

    await initializeFarm({
      maxSupply, price, sellerFeeBasisPoints,
      symbol, goLiveDate, collectionMintKey
    })
  });
});
