import { PublicKey } from '@solana/web3.js';
import {
  farmProgram,
} from '../utils';

export const fetchFarmAcc = async (farm: PublicKey) => {
  console.log('Fetching farm for', farm.toString());
  const result = await farmProgram.account.farm.fetch(farm);
  console.log('Here is the result');
  console.log(result);
}
