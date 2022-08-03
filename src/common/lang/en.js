const EN = {
    account: {
        title: '##TanglePay## Wallet',
        subTitle: `IOTA Tangle Technology\nGoing Beyond Blockchain`,
        create: 'Create a new wallet',
        hasWallet: 'Already have a wallet',
        intoTitle1: 'Mnemonic Import',
        intoTitle2: 'Backup File Import',
        mnemonicTips: 'Enter mnemonic phrases SEPARATED by spaces',
        intoSelectFile: 'Select the stronghold file',
        intoName: 'Set wallet name ',
        intoNameTips: 'Please enter a name ',
        intoPassword: 'Set Password',
        intoPasswordTips: '8 to 20 numbers & letters',
        intoRePasswordTips: 'Please repeat the password',
        intoAgree: 'I have read and agree ##Term of Service## and ##Privacy Policy##',
        term: 'Term of Service',
        policy: 'Privacy Policy',
        intoBtn: 'Import Wallet',
        intoFilePassword: 'Password',
        intoFilePasswordTips: 'Please enter the stronghold file password',

        createTitle: 'Create Wallet',
        passwordOptional: 'Set Password',

        backupTitle: 'Backup Wallet',
        backupTips: 'Backup Tips',
        backupTipsContent: `Obtaining mnemonic equals owning all assets.

Mnemonic is the only way to recover your wallet.

The mnemonic consists of English words. Please transcribe and keep them in a safe place.`,
        next: 'Next',

        backupScreenshoptTitle: 'Do Not Take Screenshot',
        backupScreenshoptTips:
            'Please do not take screenshorts of the mnemonic, it may be collected by third-party, resulting in loss of assets',
        backupScreenshoptBtn: 'Understood',

        mnemonicTitle: 'Backup Mnemonic Phrase',
        mnemonicSubTitle:
            'These mnemonic words are for recovering your wallet. Please record them in the correct order. ',
        mnemonicPhraseTips1:
            'Assests will not be recovered once the mnemonic words are lost. Please store your mnemonic in safe and isolate it from network.',
        mnemonicPhraseTips2:
            'Do not share or store mnemonic through network, such as screenshots, email, social media, etc.',
        mnemonicBtn: 'Verify Now',

        registerSucc: `Allow Tanglepay to collect your data and help us to continue improving the user experience of the product.


<##Tangle Pay will##>
always allow you to sign out through “setting” 

Send anonymous clicks and page viewing event

Send the information of the city, country, and region (do not include a specific address)


<##Tangle pay will NEVER##>
collect your password, address, trades, balance, or any personal information 

collect your IP address

Sell your data for profit

This data has been aggregated to meet the requirements of EU Regulation 2016/679 General Data Protection Regulation and is therefore anonymous. For more information about our privacy protection practices, please refer to our privacy policy`,
        start: 'Start',

        mnemonicError: 'There are {len} words in the Mnemonic',

        unopen: 'Not yet available',

        testBackup: 'Test your backup',
        checkPasswrod: 'The passwords you entered do not match, please try again.',
        mnemonicWordError: 'The mnemonic contains a word not in the wordlist {word}',
        mnemonicOtherError: 'Invalid mnemonic. Please enter the correct mnemonic phrase.',

        dearFam: 'Dear ##IOTA## fam,',
        betaReady: `Welcome to use TanglePay,
the IOTA token and NFT wallet. Soon we will be able to support Shimmer network and Shimmer EVM all in one wallet interface. Please choose the network first.`,
        changeTips:
            'Please choose the network you want to use first and you can always add other network in the wallet.',
        devnet: 'IOTA Devnet',
        mainnet: 'IOTA Mainnet',
        evmnet: 'IOTA EVM',
        selectNode: 'Select network',
        exportKey: 'Export Private Key',
        showKey: 'Show Private Keys',
        showKeyInputPassword: 'Type your {name} password',
        copyKeyTips: 'This is your private key (click to copy)',
        showKeyTips:
            'Warning: Never disclose this key. Anyone with your private keys can steal any assets held in your account.',
        done: 'Done',
        viewInExplorer: 'View account in explorer',
        or: 'or',
        importDuplicate: 'The wallet was already imported',
        privateKeyImport: 'Import Private Key',
        inputPrivateKey: 'Please enter your private key',
        removeTitle: 'Remove Wallet',
        removeTips: `This wallet will be removed from your device.
Please make sure you have the original
Secret Recovery Phrase or private key for this wallet before continuing.`,
        removeName: 'Name',
        removeAddress: 'Address',
        nevermind: 'Cancel',
        remove: 'Remove',

        walletDetail: 'Address Details',
        seedAddresses: 'Address under this seed',
        exportExcel: 'Export',
        address: 'Address',
        outputNum: 'Output number',
        iotaNum: 'Miota',
        totalNum: 'Total Amount',
        outputCollect: 'Output Concentration',
        collectTips: `Note: Output consolidation will aggregate your assets from multiple addresses and UTXOs (Unspent Transaction Outputs) into a unified UTXO on your MAIN address, which will improve the performance of subsequent activities including but not limited to get balance, stake and value transfer.`,
        pendingNum: 'Output to proceed',
        processedNum: 'Proceeded output',
        collectTermination: 'Finish',
        collectSuccTips: 'Output Concentration is done. Please remember to restake.'
    },
    assets: {
        myAssets: 'My Assets',
        send: 'Send',
        receive: 'Receive',
        assets: 'Assets',
        activity: 'Activity',
        search: 'Search',
        myWallets: 'My Wallets',
        addWallets: 'Add Wallets',
        copied: 'copied',
        currency: 'Currency',
        receiver: 'Receiver',
        receiverTips: 'Input or paste address',
        amount: 'Amount',
        amountTips: 'Input transfer amount',
        balance: 'Balance',
        password: 'Password',
        passwordTips: 'Enter your password',
        confirm: 'Confirm',

        scanQRcode: 'Scan QR code to receive payment ',
        copy: 'Copy',
        share: 'Share',

        addAssets: 'Add Assets',
        addAssetsTips: 'Enter token name or token contract address',

        scanTitle: 'Scan the QR code',
        scanPermissionsTitle: 'Allow Tangle Pay to Access your camera',
        scanPermissionsTips: 'Tangle Pay needs to acces your camera to scan QR code',
        scanTips: 'Please point the camera at the QR code',
        scanError: 'No access to the camera, cannot scan the QR code',

        noWallet: 'You have not yet added a wallet',

        sendSucc: 'Transaction succeeded.',
        sendSuccRestake: 'Transaction succeeded. Please remember to restake.',
        sendError: "Transaction failed. Please check the receiver's address",
        passwordError: 'Please enter the password correctly.',
        balanceError: 'Insufficient balance.',
        balanceStakeError: 'Insufficient fund. Please unstake first.',

        requestAssets: 'Loading asset data.',
        requestHis: 'Loading transaction history.',

        receivedSucc: '{num} Mi IOTA has been received!',

        album: 'album',
        readFail: 'QR code recognition failed',
        residueBelow1Tips: 'The remaining amount cannot be a decimal number below 1. Please enter the amount again.',
        sendBelow1Tips: 'Sending amount cannot be less than 1 Mi, please enter the amount again.'
    },
    user: {
        me: 'Me',
        manageWallets: 'Manage Wallet',
        setting: 'Setting',
        network: 'Network',
        privacy: 'Privacy',
        privacyTips: 'Participate TangleMetrics',
        aboutUs: 'About Us',
        language: 'Language',

        manage: 'Manage',
        backupWallet: 'Backup Wallet',
        backupWalletTips: `Export to a stronghold file - a complete 
encrypleted backup of your wallet and latest transaction history`,
        export: 'Export',
        resetPassword: 'Reset Password',
        old: 'Old',
        oldTips: 'Please enter your old password',
        new: 'New',
        newTips: 'Please enter your new password',
        repeatPassword: 'Repeat Password',
        exportNewFile: 'Export a new stronghold file',

        nodeError: 'The node is not yet synchronized',
        passwordError: 'The old password was entered incorrectly',
        passwordSucc: 'Your password has been reset successfully',

        curVersion: 'Current Version ',
        versionUpdate: 'New Updates',
        versionNew: 'Newest',
        website: 'Website',
        telegramGroup: 'Telegram Group',
        discord: 'Discord',
        groupEmail: 'Email',

        latestVersion: 'Latest Version already installed.'
    },
    staking: {
        title: 'Staking',
        preStake: 'Pre-stake',
        his: 'Staking History',
        stake: 'Stake',
        airdrops: 'Airdrops',
        startAt: 'Start at',
        amount: 'Amount',
        available: 'Available',
        availableToStake: 'Available to stake',
        estimatedReceived: 'Estimated Airdrops Received',
        airdropsList: 'Airdrops List',
        add: 'Add',
        unstake: 'Unstake',
        staked: 'Staked',
        enterAmount: 'Enter Amount',
        max: 'Max',
        password: 'Password',
        confirm: 'Confirm',
        addAirdropTitle: 'Add {name} Airdrop',
        token: 'Token',
        viewAll: 'view all',
        addAmount: 'Add Amount',
        addAirdrop: 'Add Airdrop',
        noAvailableTips: 'There is no available IOTA to stake. Please deposit to stake.',
        stakeBelow1Tips: 'Staking amount cannot be less than 1 Mi, please enter the amount again.',
        soon: 'soon',
        limitAmount: 'You need at least {num} MIOTA to join the {token} staking.'
    },
    apps: {
        title: 'Dapps',
        sendFrom: 'from ',
        sendFor: 'for ',
        send: `Payment request #merchant# #item_desc# to the following address,
#address#
The payment amount is #amount# #unit#.
Please enter your password to complete the payment.`,
        sign: `Signature Request #merchant#
You are signing:
#content#`,
        execute: 'Confirm',
        cancel: 'Cancel',
        signLabel: 'TanglePay.Sign',
        connect: `#origin#
Connect to
#address#
Allow the site to: See address, account balance
`,
        ConnectBtn: 'Connect'
    },
    nft: {
        collectibles: 'Collectibles',
        zeroTips: 'You have no {name} ',
        clearCache: 'Clear your cache',
        goBuy: 'Get one',
        permissions: 'Please allow TanglePay to save NFT picture on your phone.',
        saved: 'Saved.'
    },
    discover: {
        title: 'Discover',
        buyIota: 'Buy IOTA',
        addressCopy: 'Address copied'
    }
}

export default EN
