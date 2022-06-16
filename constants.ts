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
  '8VWkHD4LHMtHz4Er1AVkGvAnJbtLYrbC13JCHNyvDDYL'
);

export const FARM_PUBLIC_KEY = new PublicKey(
  'NTfXMGdZz9cdTxkKAydXGN19FEJ9GkHX1PSE89djkdv'
);

export const FARM_PROGRAM_ID = new PublicKey(
  'BbNeEhJmVCyXHc28TvFowCJgZuTUsCszjcwMhQ7uxjQs'
);

export const DEFAULT_TIMEOUT = 30000;
