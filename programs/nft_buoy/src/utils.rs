use std::str::from_utf8_unchecked;

use solana_program::{
  program_memory::sol_memcmp,
  pubkey::{Pubkey, PUBKEY_BYTES},
};

pub fn cmp_pubkeys(a: &Pubkey, b: &Pubkey) -> bool {
  sol_memcmp(a.as_ref(), b.as_ref(), PUBKEY_BYTES) == 0
}

// string is 6 bytes long, can be any valid utf8 char coming in.
// feature_index is between 0 and 5, inclusive. We set it to an array of utf8 "0"s first
pub fn set_feature_flag(uuid: &mut String, feature_index: usize) {
  let mut bytes: [u8; 6] = [b'0'; 6];
  uuid.bytes().enumerate().for_each(|(i, byte)| {
      if i == feature_index || byte == b'1' {
          bytes[i] = b'1';
      }
  });

  // unsafe is fine because we know for a fact that the array will only
  // contain valid UTF8 bytes since we fully ignore user inputted UUID and set
  // it to an array of only valid bytes (b'0') and then only modify the bytes in
  // that valid utf8 byte array to other valid utf8 characters (b'1')
  // This saves a bit of compute from the overhead of using the from_utf8 or
  // other similar methods that need to ensure that the bytes are valid
  unsafe {
      uuid.replace_range(.., from_utf8_unchecked(&bytes));
  }
}
