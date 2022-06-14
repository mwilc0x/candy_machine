use {
    anchor_lang::prelude::*,
};
use instructions::*;
use state::*;
// use error::*;
// use constants::*;
// use utils::*;

pub mod instructions;
pub mod state;
pub mod error;
pub mod constants;
pub mod utils;

declare_id!("C1f5CTDEJ1ujVQoaB6ySCAXDWPS4BQnsRgCmW5KiQVRP");

#[program]
pub mod farm {
    use super::*;

    pub fn set_collection(ctx: Context<SetCollection>) -> Result<()> {
        handle_set_collection(ctx)
    }

    pub fn mint_nft(ctx: Context<MintNFT>, nft_name: String, nft_uri: String) -> Result<()> {
        handle_mint_nft(ctx, nft_name, nft_uri)
    }

    pub fn initialize_farm(ctx: Context<InitializeFarm>, data: FarmData) -> Result<()> {
        handle_initialize_farm(ctx, data)
    }
}
