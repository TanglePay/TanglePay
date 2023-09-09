const DE = {
    account: {
        needPinToTurnoffPassword: 'Sie müssen eine PIN einrichten, um das Zahlungspasswort zu deaktivieren',
        typeYourPin: 'Geben Sie Ihre PIN ein',
        welcomeBack: 'Willkommen zurück!',
        invalidPassword: 'Ungültiges Passwort',
        passwordDisabled: 'Passwort deaktiviert',
        enterCurrentPassword: 'Aktuelles Passwort eingeben',
        passwordEnabled: 'Passwort aktiviert',
        walletPasswordTitle: 'Zahlungspasswort aktivieren',
        disableWalletPassword: 'Zahlungspasswort deaktivieren',
        enterNewPassword: 'Neues Passwort eingeben',
        retypeNewPassword: 'Neues Passwort erneut eingeben',
        passwordMismatch: 'Passwörter stimmen nicht überein',
        toggleWalletPassword: 'Zahlungspasswort',
        pinResetSuccess: 'PIN erfolgreich zurückgesetzt',
        pinSetSuccess: 'PIN erfolgreich zurückgesetzt',
        invalidOldPin: 'Ungültige alte PIN',
        pinMismatch: 'Neue PIN und wiederholte PIN stimmen nicht überein',
        setPinTitle: 'PIN festlegen',
        newPin: 'Neue PIN',
        enterNewPin: 'Geben Sie Ihre neue PIN ein',
        retypePin: 'PIN erneut eingeben',
        retypeNewPin: 'Geben Sie Ihre neue PIN erneut ein',
        setPinButton: 'PIN festlegen',
        resetPinTitle: 'PIN zurücksetzen',
        oldPin: 'Alte PIN',
        enterOldPin: 'Geben Sie Ihre alte PIN ein',
        resetPinButton: 'PIN zurücksetzen',
        title: '##TanglePay## Wallet',
        subTitle: `IOTA Tangle\nWeit mehr als eine Blockchain`,
        create: 'Neuen Account erstellen',
        hasWallet: 'Bereits einen Account haben',
        intoTitle1: 'Wiederherstellungsphrase importieren',
        intoTitle2: 'Stronghold Backup importieren',
        mnemonicTips: 'Lass zwischen den Wörtern jeweils ein Leerzeichen frei',
        intoSelectFile: 'Wähle eine .Stronghold Datei',
        intoName: 'Accountname festlegen',
        intoNameTips: 'Bitte gib einen Namen ein ',
        intoPassword: 'Passwort festlegen',
        intoPin: 'PIN-Code festlegen',
        intoPasswordTips: '8 - 20 Buchstaben und Zahlen',
        intoPinTips: '8 - 20 Buchstaben und Zahlen',
        pinTryLeft: '${left} Versuche übrig',
        pinCanNotTryUntil: '"Kann nicht versuchen bis ${time}',
        intoRePasswordTips: 'Bitte wiederhole dein Passwort',
        intoRePin: 'Bitte wiederholen Sie die PIN.',
        intoAgree: 'Ich habe die ##Terms of Service## and ##Privacy Policy## gelesen und akzeptiere diese',
        term: 'Terms of Service',
        policy: 'Privacy Policy',
        intoBtn: 'Account importieren',
        intoFilePassword: 'Passwort',
        intoFilePasswordTips: 'Bitte gib das Passwort deiner .Stronghold Datei ein',

        createTitle: 'Account erstellen',
        passwordOptional: 'Setze Passwort',

        backupTitle: 'Account sichern',
        backupTips: 'Backup Tipps',
        backupTipsContent: `Das Erlangen eines Mnemonics entspricht dem Besitz aller Vermögenswerte.
        
Sobald die Mnemonic-Wörter verloren sind, können die Vermögenswerte nicht wiederhergestellt werden. Bitte bewahren Sie Ihre Mnemonic sicher auf und isolieren Sie sie vom Netzwerk.

Teilen oder speichern Sie die Mnemonic nicht über das Netzwerk, wie zum Beispiel durch Screenshots, E-Mail, soziale Medien usw.`,
        next: 'Weiter',

        backupScreenshoptTitle: 'Machen Sie keine Bildschirmaufnahme',
        backupScreenshoptTips: 'Bitte machen Sie keine Bildschirmaufnahme, sie könnte von Angreifern genutzt werden und könnte Sie Ihre Vermögenswerte kosten.',
        backupScreenshoptBtn: 'Verstanden',

        mnemonicTitle: 'Wiederherstellungsphrase',
        mnemonicAggre: 'I have stored my mnemonic in safe and isolated it from network.',
        gotoWallet: 'Zum Account gehen',

        mnemonicSubTitle: 'Diese 24 Wörter sind dein privater Schlüssel. Notiere sie dir unbedingt in der korrekten Reihenfolge.  ',
        mnemonicPhraseTips1: `Wenn du deine Wiederherstellungsphrase und deine .Stronghold Backup inklusive Passwort verloren hast kann dir niemand helfen.
            
Bitte verwahre deine Wiederherstellungsphrase und ein Backup an einem sicheren Ort, isoliert vom Internet.
            `,
        mnemonicPhraseTips2: 'Teilen oder speichern Sie die Wiederherstellungsphrase nicht über das Netzwerk, z. B. in Screenshots, E-Mails, sozialen Medien, usw.',
        mnemonicBtn: 'Überprüfe meine Eingabe',
        mnemonicExp: 'Beispiel für den Import von Mnemonics',

        registerSucc: `Erlauben Sie TanglePay, Ihre Daten zu sammeln und helfen Sie uns, die Benutzerfreundlichkei des Produkts weiter zu verbessern.


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
        checkPin: 'Die eingegebene PIN stimmt nicht überein, bitte versuchen Sie es erneut.',
        checkPasswrod: 'Die eingegebenen Passwörter stimmen nicht überein. Bitte versuche es erneut.',
        mnemonicWordError: 'Die Wiederherstellungsphrase enthält ein Wort das nicht in der BIP39 Wortliste enthalten ist: {word}',
        mnemonicOtherError: 'Fehlerhafte Wiederherstellungsphrase. Bitte versuche es erneut.',

        dearFam: '##TanglePay## Wallet',
        betaReady: `IOTA Tangle Technology
Going Beyond Blockchain`,
        changeTips: 'Bitte wähle zunächst ein Netzwerk. Du kannst jederzeit noch weitere Netzwerke deiner Wallet hinzufügen.',
        devnet: 'IOTA Devnet',
        mainnet: 'IOTA Mainnet',
        evmnet: 'IOTA EVM',
        selectNode: 'Netzwerk auswählen',
        exportKey: 'Private Key exportieren',
        showKey: 'Private Key anzeigen',
        showKeyInputPassword: 'Gib dein Passwort für {name} ein',
        copyKeyTips: 'Dies ist dein Private Key (klicken zum Kopieren)',
        showKeyTips: 'Achtung: Geben Sie Ihren Private Key niemals weiter. Jeder mit Ihrem Private Key könnte die Assets von Ihrem Account stehlen.',
        done: 'Fertig',
        viewInExplorer: 'Account im Explorer anzeigen',
        or: 'oder',
        importDuplicate: 'Dieser Account wurde bereits importiert',
        privateKeyImport: 'Private Key importieren',
        inputPrivateKey: 'Bitte gib deinen Private Key ein',
        removeTitle: 'Account entfernen',
        removeTips: `Dieser  Account  wird von Ihrem Gerät entfernt.
        Bitte stellen Sie sicher, dass Sie die originale
        Wiederherstellungsphrase oder das Private Key haben, bevor Sie fortfahren.`,
        removeName: 'Name',
        removeAddress: 'Address',
        nevermind: 'Abort',
        remove: 'Entfernen',

        walletDetail: 'Adressdetails',
        seedAddresses: 'Adresse unter diesem Seed',
        exportExcel: 'Exportieren',
        address: 'Addresse',
        outputNum: 'Ausgangsnummer',
        iotaNum: 'Miota',
        totalNum: 'Gesamtbetrag',
        outputCollect: 'Ausgangskonzentration',
        collectTips: `erklären: Die Ausgangskonsolidierung aggregiert Ihre Vermögenswerte aus mehreren Adressen und UTXOs (Unspent Transaction Outputs) zu einem vereinheitlichten UTXO auf Ihrer HAUPT-Adresse, was die Leistung zukünftiger Aktivitäten verbessert, z.B. Guthabenabfrage, Staking und Wertübertragung.`,
        pendingNum: 'Ausgang fortsetzen',
        processedNum: 'Fortgeführter Ausgang',
        collectTermination: 'Abschließen',
        collectSuccTips: 'Die Ausgangskonzentration ist abgeschlossen. Sie könnten jetze das Staking erneuern.',
        hardwareWallet: '️Connect Hardware Wallet',
        connectLedger: 'Connect Ledger',
        lederImport: 'Ledger Import'
    },
    assets: {
        sentTo: 'du wirst zahlen',
        myAssets: 'Meine Assets',
        send: 'Versenden',
        receive: 'Empfangen',
        assets: 'Assets',
        activity: 'Historie',
        search: 'Suche',
        myWallets: 'Meine Accounts',
        addWallets: 'Accounts hinzufügen',
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

        noWallet: 'Sie haben noch keine Account hinzugefügt',

        sendSucc: 'Transaktion erfolgreich.',
        sendSuccRestake: 'Transaktion erfolgreich. Beachte dass du nun erneut staken musst.',
        sendError: 'Transaktion fehlgeschlagen. Bitte überprüfe die Adresse des Empfängers',
        passwordError: 'Bitte gib das korrekte Passwort ein.',
        balanceError: 'Nicht genügend Guthaben.',
        balanceStakeError: 'Zu wenig Guthaben. Bitte unstake zuerst.',
        sendErrorInsufficient: `Fehler: Unzureichende Mittel für die Transaktion.
Betrag {Token}: {Betrag}
EGeschätzte Speicherkaution: {Kaution} SMR
Verfügbares {Token}-Guthaben: {Guthaben1}
Verfügbares SMR-Guthaben: {Guthaben2}
Gesperrtes SMR-Guthaben: {Guthaben3}Send {token} amount: {amount}`,

        requestAssets: 'Lade Asset Daten.',
        requestHis: 'Lade Historie.',

        receivedSucc: 'Du hast {num} {unit} {token} erhalten!',

        album: 'Album',
        readFail: 'QR-Code-Erkennung fehlgeschlagen',
        residueBelow1Tips: 'Der Restbetrag darf keine Dezimalzahl unter 1 sein. Bitte änderen die Anzahl.',
        sendBelow1Tips: 'Der zu versendende Betrag kann nicht kleiner als 1 Miota betragen. Bitte ändere die Anzahl',
        evmGasNotSufficient: 'Das {Token} auf der Adresse ist nicht ausreichend für die Transaktionsgebühr. Bitte einzahlen.',
        sendSuccRestakeTips: 'Transaktion erfolgreich. Restaking...',
        restakeSuccTips: 'Restaking erfolgreich.',
        restakeFailTips: 'Restaking failed.',
        tradingList: 'Tradingliste',
        tradingFrom: 'Von',
        tradingTitle: 'Transaktion',
        acceptTitle: 'Transaktion akzeptieren',
        storageDeposit: 'Storage Deposit',
        standard: 'Standard',
        tokenID: 'Token-ID',
        dismissTips: 'Please confirm if you want to dismiss the transaction and fund will go back to the sending address after expiration.',
        acceptSucc: 'Claimed successfully',
        unlockError: 'There is not enough SMR in the address to claim this token.',
        locked: 'locked',
        unlockTime: 'Unlock Time',
        tokenName: 'Name',
        tokenDetail: 'Token-Details',
        nftInfo: 'NFT-Info',
        nftDetail: 'NFT-Details',
        collectionID: 'Collection-ID',
        nftProperties: 'Eigenschaften',
        importToken: 'Token importieren',
        tokenContractAddress: 'Token-Vertragsadresse',
        inputContractAddress: 'Adresse eingeben oder einfügen',
        tokenSymbol: 'Token-Symbol',
        inputTokenSymbol: 'Symbol eingeben oder einfügen',
        tokenDecimal: 'Token-Dezimalstelle',
        inputTokenDecimal: 'Dezimalstelle eingeben oder einfügen',
        inputRightContract: 'Bitte geben Sie eine gültige Vertragsadresse ein.',
        customTokens: 'Benutzerdefinierte Tokens',
        searchToken: 'Tokens durchsuchen.',
        importBtn: 'Importieren',
        estimateGasFee: 'Geschätzte Gas Fee',
        editPriority: 'Priorität bearbeiten',
        gasFee: 'Gas Fee',
        gasLimit: 'Gaslimit',
        maxFee: 'Maximale Gebühr',
        edit: 'Bearbeiten',
        getAssetsFail: 'Die Synchronisation des Vermögenswerts ist fehlgeschlagen. Bitte scrollen Sie nach unten, um zu aktualisieren.',
        getActivityFail: 'Die Synchronisation des Transaktionsverlaufs ist fehlgeschlagen. Bitte scrollen Sie nach unten, um zu aktualisieren.',
        sendConfirmation: 'Send Confirmation',
        sendConfirmationTips: 'Please confirm the sending of this transaction'
    },
    user: {
        me: 'Profil',
        manageWallets: 'Accounts verwalten',
        setting: 'Einstellung',
        network: 'Netzwerk',
        privacy: 'Privacy',
        privacyTips: 'Participate TangleMetrics',
        aboutUs: 'Über uns',
        language: 'Sprache',
        biometrics: 'Biometrie',
        enableBiometrics: 'Biometrische Authentifizierung',
        bioVerification: 'Biometrische Überprüfung',
        noPrompt: 'Nicht mehr abfragen',
        biometricsSucc: 'Biometrische Authentifizierung erfolgreich.',
        biometricsFailed: 'Biometrische Authentifizierung fehlgeschlagen',
        biometriceDialog: 'Sobald die biometrische Authentifizierung aktiviert ist, ist es in nachfolgenden Transaktionen nicht mehr erforderlich, ein Passwort einzugeben.',
        goSetting: 'Einstellungen',
        manage: 'Bearbeite',
        backupWallet: 'Account sichern',
        backupWalletTips: `In eine .Stronghold Datei exportieren - eine komplett verschlüsselte Backup Datei ihres Accounts und der neuesten Transaktionshistorie`,
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
        noAvailableTips: 'Es stehen keine IOTA zum Staken zur Verfügung. Bitte einzahlen, um zu staken.',
        stakeBelow1Tips: 'Anzahl kann nicht geringer als 1 Mi sein, bitte versuche es erneut.',
        soon: 'soon',
        limitAmount: 'Du benötigst mindestens {num} MIOTA um am Staking für {token} teilzunehmen zu können.',
        restake: 'Automatic Restaken'
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
        refresh: 'Refresh',
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
        contractFunc: `function: #abiFunc#`
    },
    nft: {
        collectibles: 'NFTs',
        zeroTips: 'du besitzt kein {name} ',
        clearCache: 'Leere deinen Cache',
        goBuy: 'Jetzt kaufen!',
        permissions: 'Bitte erlaube TanglePay Dateien und Medien von deinen NFT auf deinem Gerät zu speichern.',
        saved: 'Gespeichert.',
        continueCombine: 'Weiter kombinieren',
        nftAdd: 'Hinzufügen',
        totalNum: 'Insgesamt {num} Elemente',
        selectHero: 'Hero-Tier auswählen'
    },
    discover: {
        title: 'Entdecken',
        buyIota: 'IOTA kaufen',
        addressCopy: 'Adresse kopiert'
    },
    shimmer: {
        network: 'Shimmer Mainnet',
        claimStakingReward: 'Staking-Belohnungen beanspruchen',
        chooseAWallet: 'Wählen Sie ein Account aus, um Ihre ##SMR Staking Belohnungen## zu beanspruchen.',
        claimStakingRewards: 'SMR-Staking-Belohnungen beanspruchen',
        importTips: 'Bitte ##importieren Sie Ihre IOTA-Account## in TanglePay, um die Staking-Belohnung zu beanspruchen.',
        claim: 'Beanspruchen',
        claimingFailed: 'Fehler beim Beanspruchen',
        claimingFailedTips: 'Keine SMR-Staking-Belohnungen in Ihrer IOTA-Account##{name} {address}## verfügbar.',
        understand: 'Ich bin einverstanden',
        smrClaimStakingReward: 'SMR-Staking-Belohnungen beansprucht',
        smrAmount: 'SMR-Betrag: ',
        createTips: 'Das neue Shimmer-Account hat dieselben Mnemonics und dasselbe Passwort wie Ihre IOTA-Account ##{name} {address}##.',
        createSuccTips: 'Zur Sicherheit Ihrer Vermögenswerte empfehlen wir Ihnen, das Passwort ihres Accounts zu ändern oder Gelder in eine neue Shimmer-Account zu übertragen.',
        tradingList: 'Tradingliste',
        conditionsClaim: 'Bedingungen zum Beanspruchen:',
        transaction: 'Transaktion',
        acceptTransaction: 'Transaktion akzeptieren',
        accept: 'Akzeptieren',
        dismiss: 'Verwerfen',
        sendFailTips: 'The transaction is loading. The Shimmer node synchronization is currently slow.',
        sendCancel: 'Cancel',
        sendTips: 'Die Versandfunktionen werden bald auf dem Shimmer Testnetz unterstützt.'
    }
}

export default DE
