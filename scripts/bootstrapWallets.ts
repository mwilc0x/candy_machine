import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import * as web3 from '@solana/web3.js';
const __dirname = path.resolve();

const config = {
    wallets: [
        'bank',
        'creator',
        'farm',
        'manager',
        'payer',
        'sales',
        'testBuyer'
    ],
    poolWallet: 'pool',
    walletPath: process.env.WALLET_PATH
}

export const bootstrapWallets = () => {
    // we are making a connection to solana devnet
    const connection = new web3.Connection(
        web3.clusterApiUrl('devnet'),
        'confirmed',
    );

    // const wallets = config.wallets;
    // wallets.forEach(async (wallet) => {
    //     await checkWalletAndDelete(wallet);
    // });

    // // Generate key pair
    // var fromWallet = web3.Keypair.generate();

    // console.log('connection', connection);
    // console.log(fromWallet.publicKey.toString());
    // console.log(fromWallet.secretKey);
}

function checkWalletAndDelete(walletFileName) {
    return new Promise((resolve) => {
        try {
            const directoryPath = path.join(__dirname, `${walletFileName}.json`);
            if (fs.existsSync(directoryPath)) {
                //file exists
            }
            console.log(directoryPath);
        } catch (error) {
            console.log(error);
            resolve(false);
        }
    });
}
