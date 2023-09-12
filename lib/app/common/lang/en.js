const EN = {
    account: {
        needPinToTurnoffPassword: 'You need to set a PIN to disable the payment password',
        typeYourPin: 'Type your PIN',
        welcomeBack: 'Welcome back!',
        invalidPassword: 'Invalid password',
        passwordDisabled: 'Password Disabled',
        enterCurrentPassword: 'Enter Current Password',
        passwordEnabled: 'Password Enabled',
        walletPasswordTitle: 'Enable payment password',
        disableWalletPassword: 'Disable payment password',
        enterNewPassword: 'Enter new password',
        retypeNewPassword: 'Retype new password',
        passwordMismatch: 'Passwords do not match',
        confirm: 'Confirm',
        toggleWalletPassword: 'Payment Password',
        pinResetSuccess: 'PIN reset successfully',
        pinSetSuccess: 'PIN set successfully',
        invalidOldPin: 'Invalid old PIN',
        pinMismatch: 'New PIN and retyped PIN do not match',
        setPinTitle: 'Set PIN',
        newPin: 'New PIN',
        enterNewPin: 'Enter your new PIN',
        retypePin: 'Retype PIN',
        retypeNewPin: 'Retype your new PIN',
        setPinButton: 'Set PIN',
        resetPinTitle: 'Reset PIN',
        oldPin: 'Old PIN',
        enterOldPin: 'Enter your old PIN',
        resetPinButton: 'Reset PIN',
        title: '##TanglePay## Wallet',
        subTitle: `IOTA Tangle Technology\nGoing Beyond Blockchain`,
        create: 'Create a new account',
        hasWallet: 'Already have an account',
        intoTitle1: 'Mnemonic Import',
        intoTitle2: 'Backup File Import',
        mnemonicTips: 'Enter mnemonic phrases SEPARATED by spaces',
        intoSelectFile: 'Select the stronghold file',
        intoName: 'Set account name ',
        intoNameTips: 'Please enter a name ',
        intoPassword: 'Set Password',
        intoPin: 'Set PIN Code',
        intoPasswordTips: '8 to 20 numbers & letters',
        intoPinTips: '8 to 20 numbers & letters',
        pinTryLeft: '${left} times lefted',
        pinCanNotTryUntil: 'Can not try until ${time}',
        intoRePasswordTips: 'Please repeat the password',
        intoRePin: 'Please repeat the pin',
        intoAgree: 'I have read and agree ##Terms of Service## and ##Privacy Policy##',
        term: 'Terms of Service',
        policy: 'Privacy Policy',
        intoBtn: 'Import Account',
        intoFilePassword: 'Password',
        intoFilePasswordTips: 'Please enter the stronghold file password',

        createTitle: 'Create Account',
        passwordOptional: 'Set Password',

        backupTitle: 'Backup Account',
        backupTips: 'Backup Tips',
        backupTipsContent: `Obtaining mnemonic equals owning all assets.

Assests will not be recovered once the mnemonic words are lost. Please store your mnemonic in safe and isolate it from network.

Do not share or store mnemonic through network, such as screenshots, email, social media, etc.`,
        next: 'Next',

        backupScreenshoptTitle: 'Do Not Take Screenshot',
        backupScreenshoptTips: 'Please do not take screenshorts of the mnemonic, it may be collected by third-parties, resulting in the loss of assets',
        backupScreenshoptBtn: 'Understood',

        mnemonicTitle: 'Backup Mnemonic Phrase',

        mnemonicAggre: 'I have stored my mnemonic in safe and isolated it from network.',
        gotoWallet: 'Go to the account',

        mnemonicSubTitle: 'These mnemonic words are for recovering your account. Please record them in the correct order. ',
        mnemonicPhraseTips1: 'Assests will not be recovered once the mnemonic words are lost. Please store your mnemonic in safe and isolate it from network.',
        mnemonicPhraseTips2: 'Do not share or store mnemonic through the network, such as in screenshots, emails, social media, etc.',
        mnemonicBtn: 'Verify Now',
        mnemonicExp: 'Mnemonic Import Example',

        registerSucc: `Allow TanglePay to collect your data and help us to continue improving the user experience of the product.


<##TanglePay will##>
always allow you to sign out through “setting” 

Send anonymous clicks and page viewing event

Send the information of the city, country, and region (specific addresses will not be included).


<##TanglePay will NEVER##>
collect your password, address, trades, balance, or any personal information 

collect your IP address

Sell your data for profit

This data has been aggregated to comply with the requirements of EU Regulation 2016/679 General Data Protection Regulation and is therefore anonymous. For more information about our privacy protection practices, please refer to our privacy policy`,
        start: 'Start',

        mnemonicError: 'There are {len} words in the Mnemonic',

        unopen: 'Not yet available',

        testBackup: 'Test your backup',
        checkPin: 'The PIN you entered do not match, please try again.',
        checkPasswrod: 'The passwords you entered do not match, please try again.',
        mnemonicWordError: 'The mnemonic contains a word not in the wordlist {word}',
        mnemonicOtherError: 'Invalid mnemonic. Please enter the correct mnemonic phrase.',

        dearFam: '##TanglePay## Account',
        betaReady: `IOTA Tangle Technology
Going Beyond Blockchain`,
        changeTips: 'Please choose the network you want to use first and you can always add other network in the wallet.',
        devnet: 'IOTA Devnet',
        mainnet: 'IOTA Mainnet',
        evmnet: 'IOTA EVM',
        selectNode: 'Select network',
        exportKey: 'Export Private Key',
        showKey: 'Show Private Key',
        showKeyInputPassword: 'Type your {name} password',
        copyKeyTips: 'This is your private key (click to copy)',
        showKeyTips: 'Warning: Never disclose this key. Anyone with your private key can steal any assets held in your account.',
        done: 'Done',
        viewInExplorer: 'View account in explorer',
        or: 'or',
        importDuplicate: 'The account was already imported',
        privateKeyImport: 'Private Key Import',
        inputPrivateKey: 'Please enter your private key',
        removeTitle: 'Remove Account',
        removeTips: `This account will be removed from your device.
Please make sure you have the original
Secret Recovery Phrase or private key for this account before continuing.`,
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
        collectSuccTips: 'Output Concentration is done. Please remember to restake.',
        hardwareWallet: '️Connect Hardware Wallet',
        connectLedger: 'Connect Ledger',
        lederImport: 'Ledger Import'
    },
    assets: {
        sentTo: 'You will pay',
        myAssets: 'My Assets',
        send: 'Send',
        receive: 'Receive',
        assets: 'Assets',
        activity: 'Activity',
        search: 'Search',
        myWallets: 'My Accounts',
        addWallets: 'Add Accounts',
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
        scanPermissionsTitle: 'Allow TanglePay to Access your camera',
        scanPermissionsTips: 'TanglePay needs to acces your camera to scan QR code',
        scanTips: 'Please point the camera at the QR code',
        scanError: 'No access to the camera, cannot scan the QR code',

        noWallet: 'You have not yet added an account',

        sendSucc: 'Transaction succeeded.',
        sendSuccRestake: 'Transaction succeeded. Please remember to restake.',
        sendError: "Transaction failed. Please check the receiver's address",
        passwordError: 'Please enter the password correctly.',
        balanceError: 'Insufficient balance.',
        balanceStakeError: 'Insufficient fund. Please unstake first.',
        sendErrorInsufficient: `Error: Insufficient fund to carry out the transaction.
Send {token} amount: {amount} 
Estimated storage deposit: {deposit} SMR 
Available {token} balance: {balance1} 
Available SMR balance: {balance2} 
Locked SMR balance: {balance3}`,

        requestAssets: 'Loading asset data.',
        requestHis: 'Loading transaction history.',

        receivedSucc: '{num} {unit} {token} has been received!',

        album: 'album',
        readFail: 'QR code recognition failed',
        residueBelow1Tips: 'The remaining amount cannot be a decimal number below 1. Please enter the amount again.',
        sendBelow1Tips: 'Sending amount cannot be less than 1 Mi, please enter the amount again.',
        evmGasNotSufficient: 'The {token} in the address is not sufficient for the transaction gas fee. Please deposit.',
        sendSuccRestakeTips: 'Transaction succeeded. Restaking...',
        restakeSuccTips: 'Restaking succeeded.',
        restakeFailTips: 'Restaking failed.',
        tradingList: 'Trading List',
        tradingFrom: 'From',
        tradingTitle: 'Transaction',
        acceptTitle: 'Accept The Transaction',
        storageDeposit: 'Storage Deposit',
        standard: 'Standard',
        tokenID: 'Token ID',
        dismissTips: 'Please confirm if you want to dismiss the transaction and fund will go back to the sending address after expiration.',
        acceptSucc: 'Claimed successfully',
        unlockError: 'There is not enough SMR in the address to claim this token.',
        locked: 'locked',
        unlockTime: 'Unlock Time',
        tokenName: 'Name',
        tokenDetail: 'Token Detail',
        nftInfo: 'NFT Info',
        nftDetail: 'NFT Detail',
        collectionID: 'Collection ID',
        nftProperties: 'Properties',
        importToken: 'Import Token',
        tokenContractAddress: 'Token Contract Address',
        inputContractAddress: 'Input or paste address',
        tokenSymbol: 'Token Symbol',
        inputTokenSymbol: 'Input or paste symbol',
        tokenDecimal: 'Token Decimal',
        inputTokenDecimal: 'Input or paste decimal',
        inputRightContract: 'Please enter a valid contract address',
        customTokens: 'Custom Tokens',
        searchToken: 'Search Tokens',
        importBtn: 'Import',
        estimateGasFee: 'Estimate Gas Fee',
        editPriority: 'Edit Priority',
        gasFee: 'Gas Fee',
        gasLimit: 'Gas Limit',
        maxFee: 'Max Fee',
        edit: 'Edit',
        getAssetsFail: 'Asset synchronization failed, please scroll down to refresh',
        getActivityFail: 'Transaction record synchronization failed, please scroll down to refresh',
        sendConfirmation: 'Send Confirmation',
        sendConfirmationTips: 'Please confirm the sending of this transaction'
    },
    user: {
        me: 'Me',
        manageWallets: 'Manage Account',
        setting: 'Settings',
        network: 'Network',
        privacy: 'Privacy',
        privacyTips: 'Participate TangleMetrics',
        aboutUs: 'About Us',
        language: 'Language',
        biometrics: 'Biometrics',
        enableBiometrics: 'Biometric Authentication',
        bioVerification: 'Biometric verification',
        noPrompt: 'Don’t remind me again',
        biometricsSucc: 'Biometric authentication successfully',
        biometricsFailed: 'Biometric authentication failed',
        biometriceDialog: 'Once biometrics are enabled, there is no need to enter a password in subsequent transactions.',
        goSetting: 'Go to settings',
        manage: 'Manage',
        backupWallet: 'Backup Account',
        backupWalletTips: `Export to a stronghold file - a complete 
encrypleted backup of your account and latest transaction history`,
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
        limitAmount: 'You need at least {num} MIOTA to join the {token} staking.',
        restake: 'Automatic Restake'
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
        refresh: 'Refresh',
        reject: 'Reject',
        signLabel: 'TanglePay.Sign',
        connect: `#origin#
Connect to
#address#
Allow the site to: See address, account balance
`,
        ConnectBtn: 'Connect',
        approve: `By granting permission, you are allowing the following contract to access your funds.
#address#
Permission: #contractAmount# #unit#
Transaction fee: #fee#
`,
        contractFunc: `function: #abiFunc#`
    },
    nft: {
        collectibles: 'NFTs',
        zeroTips: 'You have no {name} ',
        clearCache: 'Clear your cache',
        goBuy: 'Get one',
        permissions: 'Please allow TanglePay to save NFT picture on your phone.',
        saved: 'Saved.',
        continueCombine: 'Continue to combine',
        nftAdd: 'Add',
        totalNum: 'Total {num}',
        selectHero: 'Select the Hero Tier'
    },
    discover: {
        title: 'Discover',
        buyIota: 'Buy IOTA',
        addressCopy: 'Address copied'
    },
    shimmer: {
        network: 'Shimmer Mainnet',
        claimStakingReward: 'Claim Staking Reward',
        chooseAWallet: 'Choose an Account to Claim ##SMR Staking Rewards##',
        claimStakingRewards: 'Claim SMR Staking Rewards',
        importTips: 'Please ##Import your IOTA account## in TanglePay to claim the staking reward.',
        claim: 'Claim',
        claimingFailed: 'Claiming Failed',
        claimingFailedTips: 'There is no SMR staking rewards available in your IOTA account ##{name} {address}##',
        understand: 'I Understand',
        smrClaimStakingReward: 'SMR Staking Rewards Claimed',
        smrAmount: 'SMR Amount: ',
        createTips: 'The new Shimmer account has the same mnemonics and password as your IOTA account ##{name} {address}##.',
        createSuccTips: 'For the safety of your assets, we suggest that you change the account password or transfer funds to a new Shimmer account.',
        tradingList: 'Trading List',
        conditionsClaim: 'Conditions to claim:',
        transaction: 'Transaction',
        acceptTransaction: 'Accept The Transaction',
        accept: 'Accept',
        dismiss: 'Dismiss',
        sendFailTips: 'The transaction is loading. The Shimmer node synchronization is currently slow.',
        sendCancel: 'Cancel',
        sendTips: 'We will support sending features on Shimmer Testnet soon.'
    }
}

export default EN
