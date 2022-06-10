use {
    crate::state::{CandyMachineData},
    anchor_lang::prelude::*,
};

pub mod constants;
pub mod error;
pub mod state;
pub mod utils;
pub mod collection;
pub mod mint;
pub mod candy_machine;

use collection::*;
use mint::*;
use candy_machine::*;

declare_id!("7FU1DwsTzUheVH4rQBy4ZM89fMMDwJeS5wBVh1dpRVyC");

#[program]
pub mod nft_buoy {
    use super::*;

    pub fn set_collection(ctx: Context<SetCollection>) -> Result<()> {
        handle_set_collection(ctx)
    }

    pub fn mint_nft(ctx: Context<MintNFT>, nft_name: String, nft_uri: String) -> Result<()> {
        handle_mint_nft(ctx, nft_name, nft_uri)
    }

    pub fn initialize_candy_machine(ctx: Context<InitializeCandyMachine>, data: CandyMachineData) -> Result<()> {
        handle_initialize_candy_machine(ctx, data)
    }

    pub fn update_candy_machine_collection(ctx: Context<UpdateCandyMachine>, collection_mint_key: Option<Pubkey>) -> Result<()> {
        handle_update_candy_machine_collection(ctx, collection_mint_key)
    }

    pub fn get_candy_machine_state(ctx: Context<GetCandyMachineState>) -> Result<CandyMachineData> {
        handle_get_candy_machine_state(ctx)
    }
}
