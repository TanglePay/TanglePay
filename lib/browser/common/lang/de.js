const DE = {
    account: {
        title: '##TanglePay## Wallet',
        subTitle: `IOTA Tangle\nWeit mehr als eine Blockchain`,
        create: 'Erstelle eine neue Wallet',
        hasWallet: 'Ich habe bereits eine Wallet',
        intoTitle1: 'Wiederherstellungsphrase importieren',
        intoTitle2: 'Stronghold Backup importieren',
        mnemonicTips: 'Lass zwischen den Wörtern jeweils ein Leerzeichen frei',
        intoSelectFile: 'Wähle eine .Stronghold Datei',
        intoName: 'Gib der Wallet einen Namen ',
        intoNameTips: 'Bitte gib einen Namen ein ',
        intoPassword: 'Passwort deiner Wallet',
        intoPasswordTips: '8 - 20 Buchstaben und Zahlen',
        intoRePasswordTips: 'Bitte wiederhole dein Passwort',
        intoAgree: 'Ich habe die ##Term of Service## and ##Privacy Policy## gelesen und akzeptiere diese',
        term: 'Term of Service',
        policy: 'Privacy Policy',
        intoBtn: 'Importiere Wallet',
        intoFilePassword: 'Passwort',
        intoFilePasswordTips: 'Bitte gib das Passwort deiner .Stronghold Datei ein',

        createTitle: 'Erstelle Wallet',
        passwordOptional: 'Setze Passwort',

        backupTitle: 'Backup Wallet',
        backupTips: 'Backup Tipps',
        backupTipsContent: `Die 24 Wörter sind der Schlüssel zu deinen digitalen Assets.
        
Du kannst ausschließlich mit den 24 Wörtern deine Wallet wieder herstellen.

Bitte schreib dir daher deine 24 Wörter auf und verstaue sie an einem sicheren Ort. Dein PC ist kein sicherer Ort.`,
        next: 'Weiter',

        backupScreenshoptTitle: 'Machen Sie keine Bildschirmaufnahme',
        backupScreenshoptTips:
            'Mach bitte keine Bildschirmaufnahme, Sie könnte von Angreifern genutzt werden und dich deine Vermögenswerte kosten',
        backupScreenshoptBtn: 'Verstanden',

        mnemonicTitle: 'Wiederherstellungsphrase',
        mnemonicAggre: 'I have stored my mnemonic in safe and isolated it from network.',
        gotoWallet: 'Go to the wallet',

        mnemonicSubTitle:
            'Diese 24 Wörter sind dein privater Schlüssel. Notiere sie dir unbedingt in der korrekten Reihenfolge.  ',
        mnemonicPhraseTips1: `Wenn du deine Wiederherstellungsphrase und deine .Stronghold Backup inklusive Passwort verloren hast kann dir niemand helfen.
            
Bitte verwahre deine Wiederherstellungsphrase und ein Backup an einem sicheren Ort, isoliert vom Internet.
            `,
        mnemonicPhraseTips2: 'Teile deine Wiederherstellungsphrase oder .Stronghold Backup niemals über das Internet.',
        mnemonicBtn: 'Überprüfe meine Eingabe',
        mnemonicExp: 'Mnemonic Import Example',

        registerSucc: `Erlaube Tanglepay Nutzerdaten zu sammeln, um das Nutzungserlebnis der App zu verbessern.


<##TanglePay wird##>

es dir immer erlauben Einstellungen abzulehnen 

anonyme Nutzerdaten zu Seitenaufrufen sammeln 

Informationen zu ihrer Position (Land, Region, Stadt) übermitteln. Dabei findet keine genaue Ortung ihrer Position statt. 

<##TanglePay wird niemals##>

dein Passwort, Adressen, Transaktionen, Guthaben oder andere persönliche Informationen auswerten. 

deine IP Adresse speichern

deine Nutzerdaten für Profit verkaufen

Um den Anforderungen der Verordnung (EU) 2016/679 über den Schutz personenbezogener Daten zu erfüllen werden Daten anonymisiert erfasst. Weitere Informationen über unsere Datenschutzpraktiken finden Sie in unserer Datenschutzrichtlinie
`,
        start: 'Start',

        mnemonicError: 'Die Wiederherstellungsphrase besteht aus {len} englischen Wörtern',

        unopen: 'Noch nicht verfügbar',

        testBackup: 'Teste dein Backup',
        checkPasswrod: 'Die eingegebenen Passwörter stimmen nicht überein. Bitte versuche es erneut.',
        mnemonicWordError:
            'Die Wiederherstellungsphrase enthält ein Wort das nicht in der BIP39 Wortliste enthalten ist: {word}',
        mnemonicOtherError: 'Fehlerhafte Wiederherstellungsphrase. Bitte versuche es erneut.',

        dearFam: '##TanglePay## Wallet',
        betaReady: `IOTA Tangle Technology
Going Beyond Blockchain`,
        changeTips:
            'Bitte wähle zunächst ein Netzwerk. Du kannst jederzeit noch weitere Netzwerke deiner Wallet hinzufügen.',
        devnet: 'IOTA Devnet',
        mainnet: 'IOTA Mainnet',
        evmnet: 'IOTA EVM',
        selectNode: 'Netzwerk auswählen',
        exportKey: 'Private Key exportieren',
        showKey: 'Private Keys anzeigen',
        showKeyInputPassword: 'Gib dein Passwort für {name} ein',
        copyKeyTips: 'Dies ist dein Private Key (klicken zum Kopieren)',
        showKeyTips:
            'Achtung: Teile deinen Private Key niemals mit anderen Personen. Jeder mit deinem Private Key könnte die Assets von deinem Konto stehlen.',
        done: 'Fertig',
        viewInExplorer: 'Account im Explorer anzeigen',
        or: 'oder',
        importDuplicate: 'Diese Wallet existiert bereits',
        privateKeyImport: 'Private Key importieren',
        inputPrivateKey: 'Bitte gib deinen Private Key ein',
        removeTitle: 'Wallet entfernen',
        removeTips: `Diese Wallet wird von deinem Gerät entfernt.
Bitte stelle sicher, dass du im Besitz der dazugehörigen
Wiederherstellungsphrase oder des Private Keys bist, bevor du fortfährst.`,
        removeName: 'Name',
        removeAddress: 'Address',
        nevermind: 'Abort',
        remove: 'Entfernen',

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
        myAssets: 'Meine Assets',
        send: 'Versenden',
        receive: 'Empfangen',
        assets: 'Assets',
        activity: 'Historie',
        search: 'Suche',
        myWallets: 'Meine Wallets',
        addWallets: 'Wallets hinzufügen',
        copied: 'kopiert',
        currency: 'Währung',
        receiver: 'Empfänger',
        receiverTips: 'Gib eine Adresse an, oder kopier sie hier hin',
        amount: 'Anzahl',
        amountTips: 'Anzahl an Token die verschickt werden soll',
        balance: 'Guthaben',
        password: 'Passwort',
        passwordTips: 'Gib dein Passwort ein',
        confirm: 'Bestätigen',

        scanQRcode: 'QR-Code Teilen um Zahlungen zu erhalten ',
        copy: 'Kopieren',
        share: 'Teilen',

        addAssets: 'Assets hinzufügen',
        addAssetsTips: 'Gib den Token Namen oder die Smart Contract Adresse ein',

        scanTitle: 'Scanne den QR-Code',
        scanPermissionsTitle: 'Erlaube TanglePay auf deine Kamera zuzugreifen',
        scanPermissionsTips: 'TanglePay braucht Zugriff auf deine Kamera um den QR-Code zu scannen',
        scanTips: 'Bitte richte deine Kamera auf den QR-Code',
        scanError: 'Kein Zugriff auf die Kamera, kann QR-Code nicht scannen',

        noWallet: 'Du hast noch keine Wallet hinzugefügt',

        sendSucc: 'Transaktion erfolgreich.',
        sendSuccRestake: 'Transaktion erfolgreich. Beachte dass du nun erneut staken musst.',
        sendError: 'Transaktion fehlgeschlagen. Bitte überprüfe die Adresse des Empfängers',
        passwordError: 'Bitte gib das korrekte Passwort ein.',
        balanceError: 'Nicht genügend Guthaben.',
        balanceStakeError: 'Zu wenig Guthaben. Bitte unstake zuerst.',
        sendErrorInsufficient: `Error: Insufficient fund to carry out the transaction.
Send {token} amount: {amount} 
Estimated storage deposit: {deposit} SMR 
Available {token} balance: {balance1} 
Available SMR balance: {balance2} 
Locked SMR balance: {balance3}`,

        requestAssets: 'Lade Asset Daten.',
        requestHis: 'Lade Historie.',

        receivedSucc: 'Du hast {num} {unit} {token} erhalten!',

        album: 'Album',
        readFail: 'QR-Code-Erkennung fehlgeschlagen',
        residueBelow1Tips:
            'Der Restbetrag auf deiner Wallet kann nicht kleiner als 1 Miota betragen. Bitte ändere die Anzahl.',
        sendBelow1Tips: 'Der zu versendende Betrag kann nicht kleiner als 1 Miota betragen. Bitte ändere die Anzahl',
        evmGasNotSufficient:
            'The {token} in the address is not sufficient for the transaction gas fee. Please deposit.',
        sendSuccRestakeTips: 'Transaction succeeded. Restaking...',
        restakeSuccTips: 'Restaking succeeded.',
        tradingList: 'Trading List',
        tradingFrom: 'From',
        tradingTitle: 'Transaction',
        acceptTitle: 'Accept The Transaction',
        storageDeposit: 'Storage Deposit',
        standard: 'Standard',
        tokenID: 'Token ID',
        dismissTips:
            'Please confirm if you want to dismiss the transaction and fund will go back to the sending address after expiration.',
        acceptSucc: 'Claimed successfully',
        unlockError: 'There is not enough SMR in the address to claim this token.',
        locked: 'locked',
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
        inputRightContract: '请输入有效的合约地址',
        customTokens: 'Custom Tokens',
        importBtn: 'Import',
        estimateGasFee: 'Estimate Gas Fee',
        editPriority: 'Edit Priority',
        gasFee: 'Gas Fee',
        gasLimit: 'Gas Limit',
        maxFee: 'Max Fee',
        edit: 'Edit'
    },
    user: {
        me: 'Profil',
        manageWallets: 'Wallet verwalten',
        setting: 'Einstellung',
        network: 'Netzwerk',
        privacy: 'Privacy',
        privacyTips: 'Participate TangleMetrics',
        aboutUs: 'Über uns',
        language: 'Sprache',
        biometrics: 'Biometrisch',
        enableBiometrics: 'Biometrischen Authentifizierung',
        bioVerification: 'Biometrische Überprüfung',
        noPrompt: 'No longer prompt',
        biometricsSucc: 'Biometric authentication successfully',
        biometricsFailed: 'Biometric authentication failed',
        biometriceDialog:
            'To enable biometrics in Settings, there is no need to enter a password in subsequent transactions.',
        goSetting: 'Go settings',
        manage: 'Bearbeite',
        backupWallet: 'Backup Wallet',
        backupWalletTips: `In eine .Stronghold Datei exportieren - eine komplett verschlüsselte Backup Datei ihrer Wallet inklusive Transaktionshistorie`,
        export: 'Exportieren',
        resetPassword: 'Passwort zurücksetzen',
        old: 'alt',
        oldTips: 'Bitte gib dein aktuelles Passwort ein',
        new: 'neu',
        newTips: 'Bitte gib dein neues Passwort ein',
        repeatPassword: 'Passwort wiederholen',
        exportNewFile: 'Exportiere eine neue .Stronghold Datei',

        nodeError: 'Die Node ist nicht synchronisiert',
        passwordError: 'Das aktuelle Passwort ist fehlerhaft',
        passwordSucc: 'Dein Passwort wurde erfolgreich zurückgesetzt',

        curVersion: 'Aktuelle Version ',
        versionUpdate: 'Neue Updates',
        versionNew: 'Neuste',
        website: 'Webseite',
        telegramGroup: 'Telegram Gruppe',
        discord: 'Discord',
        groupEmail: 'Email',

        latestVersion: 'Neuste Version bereits installiert.'
    },
    staking: {
        title: 'Staking',
        preStake: 'Pre-Staking',
        his: 'Staking Historie',
        stake: 'Stake',
        airdrops: 'Airdrops',
        startAt: 'Beginnt um',
        amount: 'Anzahl',
        available: 'Verfügbar',
        availableToStake: 'zum Staken verfügbar',
        estimatedReceived: 'geschätzte Airdrop-Belohnung',
        airdropsList: 'Airdrops Liste',
        add: 'Hinzufügen',
        unstake: 'unterbrechen',
        staked: 'Gestaked',
        enterAmount: 'Anzahl eingeben',
        max: 'Max',
        password: 'Passwort',
        confirm: 'Bestätigen',
        addAirdropTitle: 'Füge Airdrop {name} hinzu',
        token: 'Token',
        viewAll: 'Zeige alle',
        addAmount: 'Füge Anzahl hinzu',
        addAirdrop: 'Füge Airdrop hinzu',
        noAvailableTips: 'Deine Wallet ist leer. Transferiere Guthaben in deine Wallet um zu Staken.',
        stakeBelow1Tips: 'Anzahl kann nicht geringer als 1 Mi sein, bitte versuche es erneut.',
        soon: 'soon',
        limitAmount: 'Du benötigst mindestens {num} MIOTA um am Staking für {token} teilzunehmen zu können.',
        restake: 'Automatic Restake'
    },
    apps: {
        title: 'Dapps',
        sendFrom: 'von ',
        sendFor: 'über ',
        send: `Zahlungsaufforderung #merchant# #item_desc# an die folgende Adresse,
#address#
Die Rechnung beträgt #amount# #unit#.
Bitte gib dein Passwort ein um die Bestellung abzuschließen.`,
        sign: `Aufforderung zur Signatur von #merchant#
Sie unterschreiben:
#content#`,
        execute: 'Bestätigen',
        cancel: 'Abbrechen',
        reject: 'Reject',
        signLabel: 'TanglePay.Sign',
        connect: `#origin#
Verbinde mit
#address#
Erlaube der Seite: Adressen und Kontostände einsehen
`,
        ConnectBtn: 'Verbinde',
        approve: `By granting permission, you are allowing the following contract to access your funds.
#address#
Permission: #contractAmount# #unit#
Transaction fee: #fee#
`,
        contractFunc: `function: #abiFunc#,
params: #abiParams#
`
    },
    nft: {
        collectibles: 'NFTs',
        zeroTips: 'du besitzt kein {name} ',
        clearCache: 'Leere deinen Cache',
        goBuy: 'Jetzt kaufen!',
        permissions: 'Bitte erlaube TanglePay Dateien und Medien von deinen NFT auf deinem Gerät zu speichern.',
        saved: 'Gespeichert.'
    },
    discover: {
        title: 'Entdecken',
        buyIota: 'IOTA kaufen',
        addressCopy: 'Adresse kopiert'
    },
    shimmer: {
        network: 'Shimmer Mainnet',
        claimStakingReward: 'Claim Staking Reward',
        chooseAWallet: 'Choose a Wallet to Claim ##SMR Staking Rewards##',
        claimStakingRewards: 'Claim SMR Staking Rewards',
        importTips: 'Please ##Import your IOTA wallet## in TanglePay to claim the staking reward.',
        claim: 'Claim',
        claimingFailed: 'Claiming Failed',
        claimingFailedTips: 'There is no SMR staking rewards available in your IOTA wallet ##{name} {address}##',
        understand: 'I Understand',
        smrClaimStakingReward: 'SMR Staking Rewards Claimed',
        smrAmount: 'SMR Amount: ',
        createTips:
            'The new Shimmer wallet has the same mnemonics and password as your IOTA wallet ##{name} {address}.##',
        createSuccTips:
            'For the safetly of your assets, we suggest you to change the wallet password or transfer fund into a new Shimmer wallet.',
        tradingList: 'Trading List',
        conditionsClaim: 'Conditions to claim:',
        transaction: 'Transaction',
        acceptTransaction: 'Accept The Transaction',
        accept: 'Accept',
        dismiss: 'Dismiss',
        sendFailTips: 'The transaction is loading. The Shimmer node synchronization is currently slow.',
        sendCancel: 'Cancel',
        sendTips: 'We will support sending features on Shimmer Beta soon.'
    }
}

export default DE
