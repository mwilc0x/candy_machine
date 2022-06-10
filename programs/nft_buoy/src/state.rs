use anchor_lang::prelude::*;

#[repr(C)]
#[derive(AnchorDeserialize, AnchorSerialize, PartialEq, Debug, Clone)]
pub struct Creator {
    pub address: Pubkey,
    pub verified: bool,
    pub share: u8,
}

#[account]
#[derive(Default, Debug)]
pub struct CandyMachine {
    pub authority: Pubkey,
    pub bump: u8,
    pub data: CandyMachineData,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Debug)]
pub struct CandyMachineData {
    pub price: u64,
    pub nfts_minted: u64,
    pub go_live_date: Option<i64>,
    pub creators: Vec<Creator>,
    pub symbol: String,
    pub seller_fee_basis_points: u16,
    pub max_supply: Option<u64>,
    pub collection_mint_key: Option<Pubkey>,
}

/// Collection PDA account
#[account]
#[derive(Default, Debug)]
pub struct CollectionPDA {
    pub mint: Pubkey,
    pub candy_machine: Pubkey,
}

/* seeds of the PDA, can be anything you want */
/* remember to change them on the JS too (utils.ts file) */
pub static PREFIX: &str = "hard-glass-bookshelf";

