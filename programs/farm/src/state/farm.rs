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
pub struct Farm {
    pub authority: Pubkey,
    pub bump: u8,
    pub data: FarmData,

    /// authorizes funders, whitelists mints/creators, sets farm config params
    /// can update itself to another Pubkey
    pub farm_manager: Pubkey,

    /// used for collecting any fees earned by the farm
    // pub farm_treasury: Pubkey,

    /// signs off on treasury payouts and on any operations related to the bank
    /// (configured as bank manager)
    pub farm_authority: Pubkey,

    pub farm_authority_seed: Pubkey,

    pub farm_authority_bump_seed: [u8; 1],

    pub bank: Pubkey,
}

impl Farm {
    pub fn farm_seeds(&self) -> [&[u8]; 2] {
        [
            self.farm_authority_seed.as_ref(),
            &self.farm_authority_bump_seed,
        ]
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Debug)]
pub struct FarmData {
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
    pub farm: Pubkey,
}

/* seeds of the PDA, can be anything you want */
/* remember to change them on the JS too (utils.ts file) */
pub static PREFIX: &str = "hard-glass-bookshelf";
