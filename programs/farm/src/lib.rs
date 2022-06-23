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

declare_id!("EjGZ21k9e6jYm5HCVTPVjNBgG7DJhoVtmman7dDrqLoZ");

#[program]
pub mod farm {
    use super::*;

    // pub fn set_collection(ctx: Context<SetCollection>) -> Result<()> {
    //     handle_set_collection(ctx)
    // }

    // pub fn update_farm_collection(ctx: Context<UpdateFarm>, collection_mint_key: Option<Pubkey>) -> Result<()> {
    //     handle_update_farm_collection(ctx, collection_mint_key)
    // }

    pub fn mint_nft(
        ctx: Context<MintNFT>,
        bump_auth: u8, 
    ) -> Result<()> {
        handle_mint_nft(ctx, bump_auth)
    }

    pub fn init_farm(
        ctx: Context<InitFarm>, 
        bump_auth: u8,
        data: FarmData
    ) -> Result<()> {
        instructions::init_farm::handler(ctx, bump_auth, data)
    }

    // pub fn add_uri(
    //     ctx: Context<AddUri>, 
    //     uri: Vec<u8>,
    // ) -> Result<()> {
    //     instructions::add_uri::handler(ctx, uri)
    // }
}
