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
export const CANDY_MACHINE_PUBLIC_KEY = new PublicKey(
  'Ax2XcEju3HYbsxtKeBUPrP7r1zvq44wayNcemNXFG5zw'
);

export const CANDY_MACHINE_PROGRAM_ID = new PublicKey(
  '7FU1DwsTzUheVH4rQBy4ZM89fMMDwJeS5wBVh1dpRVyC'
);

export const DEFAULT_TIMEOUT = 30000;
