use mpl_token_metadata::state::{
  MAX_CREATOR_LEN, MAX_CREATOR_LIMIT, MAX_NAME_LENGTH, MAX_SYMBOL_LENGTH, MAX_URI_LENGTH,
};
use solana_program::pubkey::Pubkey;

pub const EXPIRE_OFFSET: i64 = 10 * 60;
pub const BLOCK_HASHES: Pubkey =
  solana_program::pubkey!("SysvarRecentB1ockHashes11111111111111111111");
pub const PREFIX: &str = "candy_machine";
pub const COLLECTIONS_FEATURE_INDEX: usize = 0;
pub const CONFIG_LINE_SIZE: usize = 4 + MAX_NAME_LENGTH + 4 + MAX_URI_LENGTH;
pub const COLLECTION_PDA_SIZE: usize = 8 + 64;
pub const A_TOKEN: Pubkey = solana_program::pubkey!("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
pub const CONFIG_ARRAY_START: usize = 8 + // key
  32 +  // authority
  8 + // price YEHA
  8 + // nfts_minted YEHA
  4 + MAX_CREATOR_LIMIT*MAX_CREATOR_LEN + 
  2 + // seller fee basis points
  8 + // max supply
  9 + // go live
  4 + MAX_SYMBOL_LENGTH +
  4 + 6 + // uuid
  1 + 32; // collection