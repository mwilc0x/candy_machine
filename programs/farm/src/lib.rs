use {
    anchor_lang::prelude::*,
};
use instructions::*;
use state::*;

pub mod instructions;
pub mod state;
pub mod error;
pub mod constants;
pub mod utils;

declare_id!("BbNeEhJmVCyXHc28TvFowCJgZuTUsCszjcwMhQ7uxjQs");

#[program]
pub mod farm {
    use super::*;

    pub fn set_collection(ctx: Context<SetCollection>) -> Result<()> {
        handle_set_collection(ctx)
    }

    pub fn update_farm_collection(ctx: Context<UpdateFarm>, collection_mint_key: Option<Pubkey>) -> Result<()> {
        handle_update_farm_collection(ctx, collection_mint_key)
    }

    pub fn mint_nft(
        ctx: Context<MintNFT>,
        bump_auth: u8, 
        nft_name: String, 
        nft_uri: String
    ) -> Result<()> {
        handle_mint_nft(ctx, bump_auth, nft_name, nft_uri)
    }

    pub fn init_farm(
        ctx: Context<InitFarm>, 
        bump_auth: u8,
        data: FarmData
    ) -> Result<()> {
        instructions::init_farm::handler(ctx, bump_auth, data)
    }
}
