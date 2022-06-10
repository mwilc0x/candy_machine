import { getCandyMachineState } from '../scripts/getCandyMachineState';

describe('Candy Machine State', () => {
  it('returns the candy machine state', async () => {
    await getCandyMachineState()
    return true;
  });
});
