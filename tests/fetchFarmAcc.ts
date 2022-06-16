import { fetchFarmAcc } from '../scripts/getFarmData';

import { 
  loadWalletKey,
} from '../utils';

const payer = loadWalletKey("/Users/mike/.config/solana/test/art_farm/devnet/farm.json");

fetchFarmAcc(payer.publicKey);