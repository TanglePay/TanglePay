const DE = {
    account: {
        title: 'TanglePay Wallet',
        subTitle: `IOTA Tangle\n
Weit mehr als eine Blockchain`,
        create: 'Erstelle eine neue Wallet',
        hasWallet: 'Ich habe bereits eine Wallet',
        intoTitle1: 'Wiederherstellungsphrase (24 Wörter) importieren',
        intoTitle2: 'Stronghold Backup importieren',
        mnemonicTips: 'Lass zwischen den 24 Wörtern jeweils ein Leerzeichen frei',
        intoSelectFile: 'Wähle eine .Stronghold Datei',
        intoName: 'Gib der Wallet einen Namen ',
        intoNameTips: 'Bitte gib einen Namen ein ',
        intoPassword: 'Passwort deiner Wallet',
        intoPasswordTips: '8 - 20 Buchstaben und Zahlen',
        intoRePasswordTips: 'Bitte wiederhole dein Passwort',
        intoAgree: 'Ich habe die ##Term of Service## and ##Privacy Policy## gelesen und akzeptiere diese',
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
        mnemonicSubTitle:
            'Diese 24 Wörter sind dein privater Schlüssel. Notiere sie dir unbedingt in der korrekten Reihenfolge.  ',
        mnemonicPhraseTips1: `Wenn du deine Wiederherstellungsphrase und deine .Stronghold Backup inklusive Passwort verloren hast kann dir niemand helfen.
            
Bitte verwahre deine Wiederherstellungsphrase und ein Backup an einem sicheren Ort, isoliert vom Internet.
            `,
        mnemonicPhraseTips2: 'Teile deine Wiederherstellungsphrase oder .Stronghold Backup niemals über das Internet.',
        mnemonicBtn: 'Überprüfe meine Eingabe',

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

        dearFam: 'Liebe IOTA Familie,',
        betaReady: `Willkommen bei TanglePay, 
der all-in-one Wallet für IOTA Token und NFTs.Bald werdet ihr in der Lage sein das Shimmer Netzwerk und die Shimmer-EVM in unserer Wallet zu benutzen.
Bitte wähle dafür zunächst ein Netzwerk.`,
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
        viewInExplorer: 'Account im Explorer anzeigen'
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

        sendSucc: 'Transaktion erfolgreich. Beachte dass du nun erneut staken musst.',
        sendError: 'Transaktion fehlgeschlagen. Bitte überprüfe die Adresse des Empfängers',
        passwordError: 'Bitte gib das korrekte Passwort ein.',
        balanceError: 'Nicht genügend Guthaben.',
        balanceStakeError: 'Zu wenig Guthaben. Bitte unstake zuerst.',

        requestAssets: 'Lade Asset Daten.',
        requestHis: 'Lade Historie.',

        receivedSucc: 'Du hast {num} Mi IOTA erhalten!',

        album: 'Album',
        readFail: 'QR-Code-Erkennung fehlgeschlagen',
        residueBelow1Tips:
            'Der Restbetrag auf deiner Wallet kann nicht kleiner als 1 Miota betragen. Bitte ändere die Anzahl.',
        sendBelow1Tips: 'Der zu versendende Betrag kann nicht kleiner als 1 Miota betragen. Bitte ändere die Anzahl'
    },
    user: {
        me: 'Profil',
        manageWallets: 'Wallets verwalten',
        setting: 'Einstellung',
        network: 'Netzwerk',
        privacy: 'Privacy',
        privacyTips: 'Participate TangleMetrics',
        aboutUs: 'Über uns',
        language: 'Sprache',

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
        unstake: 'Staking unterbrechen',
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
        limitAmount: 'Du benötigst mindestens {num} MIOTA um am Staking für {token} teilzunehmen zu können.'
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
        signLabel: 'TanglePay.Sign',
        connect: `#origin#
Verbinde mit
#address#
Erlaube der Seite: Adressen und Kontostände einsehen
`,
        ConnectBtn: 'Verbinde'
    },
    nft: {
        collectibles: 'NFT-Kunst',
        zeroTips: 'du besitzt kein {name} ',
        clearCache: 'Leere deinen Cache',
        goBuy: 'Jetzt kaufen!',
        permissions: 'Bitte erlaube TanglePay Dateien und Medien von deinen NFT auf deinem Gerät zu speichern.',
        saved: 'Gespeichert.'
    }
}

export default DE
