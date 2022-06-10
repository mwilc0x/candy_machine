/* RENT TABLE */
/* use this to calculate the space necessary of your accounts */

/*
    bool	        1 byte	    1 bit rounded up to 1 byte.
    u8 or i8	    1 byte
    u16 or i16	    2 bytes
    u32 or i32	    4 bytes
    u64 or i64	    8 bytes
    u128 or i128	16 bytes
    [u16; 32]	    64 bytes	32 items x 2 bytes. [itemSize; arrayLength]
    PubKey	        32 bytes	Same as [u8; 32]
    vec<u16>	    Any multiple of 2 bytes + 4 bytes for the prefix	Need to allocate the maximum amount of item that could be required.
    String	        Any multiple of 1 byte + 4 bytes for the prefix	Same as vec<u8>
*/