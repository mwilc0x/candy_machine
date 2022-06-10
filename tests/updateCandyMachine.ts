import { updateCandyMachine } from '../scripts/updateCandyMachine';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
const argv: any = yargs(hideBin(process.argv)).argv;

describe('will update the candy machine', () => {
  it('can update the candy machine', async () => {
    const keypair = argv.keypair;
    await updateCandyMachine({ keypair })
  });
});
