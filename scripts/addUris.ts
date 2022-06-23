import { FARM_PUBLIC_KEY } from '../constants';
import {
    farmProgram,
    loadWalletKey
} from '../utils';
import collectionUrls from './collection_urls.json';

export const addUris = async () => {
    const sales = loadWalletKey("/Users/mike/.config/solana/test/art_farm/devnet/sales.json");

    const accounts = {
        farm: FARM_PUBLIC_KEY,
        authority: sales.publicKey,
    };

    const keys = Object.keys(collectionUrls);
    keys.sort();

    let imageManifestUriList = [];
    for (let i = 0; i < 1337; i++) {
        let item = collectionUrls[i];
        let split = item.manifestUrl.split('/');
        const utf8encoded = Buffer.from(split[4]);
        imageManifestUriList.push(utf8encoded);
    }

    for (let i = 0; i < imageManifestUriList.length; i++) {
        const result = await farmProgram.methods
            .addUri(imageManifestUriList[i])
            .accounts(accounts)
            .signers([sales])
            .rpc();

        console.log(`uri ${i} added:`, result);
    }
}
