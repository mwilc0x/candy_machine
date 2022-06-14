use anchor_lang::prelude::*;

#[error_code]
pub enum FarmError {
    #[msg("You don't have enough SOL to mint this NFT")]
    NotEnoughSOL,

    #[msg("The launch date has not come yet")]
    FarmNotLiveYet,

    #[msg("There are no more NFTs to mint in this collection")]
    FarmEmpty,

    #[msg("Mint Mismatch!")]
    MintMismatch,

    #[msg("Incorrect collection NFT authority")]
    IncorrectCollectionAuthority,

    #[msg("Numerical overflow error!")]
    NumericalOverflowError,
}
