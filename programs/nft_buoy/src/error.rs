use anchor_lang::prelude::*;

#[error_code]
pub enum CandyError {
    #[msg("You don't have enough SOL to mint this NFT")]
    NotEnoughSOL,

    #[msg("The launch date has not come yet")]
    CandyMachineNotLiveYet,

    #[msg("There are no more NFTs to mint in this collection")]
    CandyMachineEmpty,

    #[msg("Mint Mismatch!")]
    MintMismatch,

    #[msg("Incorrect collection NFT authority")]
    IncorrectCollectionAuthority,

    #[msg("Numerical overflow error!")]
    NumericalOverflowError,
}
