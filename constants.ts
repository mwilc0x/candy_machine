import { PublicKey } from '@solana/web3.js';

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
);

/* metaplex program */
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

/* seed of the PDA, can be anything you want */
/* remember to change them on the contract too (state.rs file) */
export const PREFIX = 'hard-glass-bookshelf';

/* replace the following with your own pubkeys */
export const BANK_PUBLIC_KEY = new PublicKey(
  'BFvcMZ1RxhbMu5xJ2xxaejYJa3LX8rswYr4rbj3Yzzns'
);

export const BANK_PROGRAM_ID = new PublicKey(
  '5EMuxVuRsFDq9dNZzsPz6BFuY1CzndU9HW6dX7VWB3ez'
);

export const FARM_PUBLIC_KEY = new PublicKey(
  '4uTxBimC5EkHf45Lh82ggY3A6BxCoPNmuwLrWcmY1JAE'
);

export const FARM_PROGRAM_ID = new PublicKey(
  'EjGZ21k9e6jYm5HCVTPVjNBgG7DJhoVtmman7dDrqLoZ'
);

export const DEFAULT_TIMEOUT = 30000;
