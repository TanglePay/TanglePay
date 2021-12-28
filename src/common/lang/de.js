const DE = {
    account: {
        title: 'Tangle Pay Wallet',
        subTitle: `IOTA Tangle\n
Weit mehr als eine Blockchain`,
        create: 'Erstelle eine neue Wallet',
        hasWallet: 'Ich habe bereits eine Wallet',
        intoTitle1: 'Wiederherstellungsphrase (24 Wörter) importieren',
        intoTitle2: '.Stronghold Backup importieren',
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
        
Du kannst ausschließlich mit den 24 Wörtern oder der .Stronghold Backup Datei und Passwort deine Wallet wieder herstellen.

Deine .Stronghold Backup Datei ist verschlüsselt und benötigt das zugehörige Passwort zum Wiederherstellen deiner Wallet.

Bitte schreib dir daher deine 24 Wörter auf und verstaue sie an einem sicheren Ort. Dein PC ist kein sicherer Ort.

        `,
        next: 'Weiter',

        backupScreenshoptTitle: 'Machen Sie keine Bildschirmaufnahme',
        backupScreenshoptTips:
            'Mach bitte keine Bildschirmaufnahme, Sie könnte von Angreifern genutzt werden und dich deine Vermögenswerte kosten',
        backupScreenshoptBtn: 'Verstanden',

        mnemonicTitle: 'Wiederherstellungsphrase',
        mnemonicSubTitle:
            'Diese 24 Wörter sind dein privater Schlüssel. Notiere sie dir unbedingt in der korrekten Reihenfolge.  ',
        mnemonicPhraseTips1:
            `Wenn du deine Wiederherstellungsphrase und deine .Stronghold Backup inklusive Passwort verloren hast kann dir niemand helfen.
            
Bitte verwahre deine Wiederherstellungsphrase und ein Backup an einem sicheren Ort, isoliert vom Internet.
            `,
        mnemonicPhraseTips2:
            'Teile deine Wiederherstellungsphrase oder .Stronghold Backup niemals über das Internet.',
        mnemonicBtn: 'Überprüfe meine Eingabe',

        registerSucc: `Erlaube Tanglepay Nutzerdaten zu sammeln, um das Nutzungserlebnis der App zu verbessern.


Tangle Pay wird

es dir immer erlauben Einstellungen abzulehnen 

anonyme Nutzerdaten zu Seitenaufrufen sammeln 

Informationen zu ihrer Position (Land, Region, Stadt) übermitteln. Dabei findet keine genaue Ortung ihrer Position statt. 

Tangle Pay wird niemals

dein Passwort, Adressen, Transaktionen, Guthaben oder andere persönliche Informationen auswerten. 

deine IP Adresse speichern

deine Nutzerdaten für Profit verkaufen

Um den Anforderungen der Verordnung (EU) 2016/679 über den Schutz personenbezogener Daten zu erfüllen werden Daten anonymisiert erfasst. Weitere Informationen über unsere Datenschutzpraktiken finden Sie in unserer Datenschutzrichtlinie
`,
        start: 'Start',

        mnemonicError: 'Die Wiederherstellungsphrase besteht aus 24 englischen Wörtern',

        unopen: 'Noch nicht verfügbar',

        testBackup: 'Teste dein Backup',
        checkPasswrod: 'Die eingegebenen Passwörter stimmen nicht überein. Bitte versuche es erneut.',
        mnemonicWordError: 'Die Wiederherstellungsphrase enthält ein Wort das nicht in der BIP39 Wortliste enthalten ist: {word}',
        mnemonicOtherError: 'Fehlerhafte Wiederherstellungsphrase. Bitte versuche es erneut.',

        dearFam: 'Liebe IOTA Familie,',
        betaReady: `TanglePay Beta Version ist Startklar!
Es wäre uns eine Ehre dich einzuladen Tangle Pay auszuprobieren um uns Feedback für die Weiterentwicklung zu geben.`,
        changeTips: 'Bitte wähle das Netzwerk aus welches du nutzen möchtest. Du kannst es jederzeit in den Netzwerkeinstellungen ändern',
        devnet: 'Chrysalis devnet',
        mainnet: 'Chrysalis mainnet'
    },
    assets: {
        myAssets: 'Meine Assets',
        send: 'Versenden',
        receive: 'Empfangen',
        assets: 'Assets',
        activity: 'Verlauf',
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
        scanPermissionsTitle: 'Erlaube Tangle Pay auf deine Kamera zuzugreifen',
        scanPermissionsTips: 'Tangle Pay braucht Zugriff auf deine Kamera um den QR-Code zu scannen',
        scanTips: 'Bitte richte deine Kamera auf den QR-Code',
        scanError: 'Kein Zugriff auf die Kamera, kann QR-Code nicht scannen',

        noWallet: 'Du hast noch keine Wallet hinzugefügt',

        sendSucc: 'Transaktion erfolgreich',
        sendError: "Transaktion fehlgeschlagen. Bitte überprüfe die Adresse des Empfängers",
        passwordError: 'Bitte gib das korrekte Passwort ein.',
        balanceError: 'Nicht genügend Guthaben.',

        requestAssets: 'Lade Asset Daten.',
        requestHis: 'Lade Verlauf.',

        receivedSucc: 'Du hast {num} Mi IOTA erhalten!',

        album: 'Album',
        readFail: 'QR-Code-Erkennung fehlgeschlagen'
    },
    user: {
        me: 'Ich',
        manageWallets: 'Wallets verwalten',
        setting: 'Einstellung',
        network: 'Netzwerk',
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

        latestVersion: 'Neuste Version ist bereits installiert.'
    }
}

export default DE
