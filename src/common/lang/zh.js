const ZH = {
    account: {
        title: 'TanglePay Wallet',
        subTitle: `IOTA Tangle Technology\n
Going Beyond Blockchain`,
        create: '創建新錢包',
        hasWallet: '登陸錢包',
        intoTitle1: '助記詞導入',
        intoTitle2: '備份文件導入',
        mnemonicTips: '請填入助記詞，詞與詞間用空格隔開',
        intoSelectFile: '選擇Stronghold文件',
        intoName: '設置錢包名稱',
        intoNameTips: '請填入名稱',
        intoPassword: '設置密碼',
        intoPasswordTips: '8到20位數字和字母的組合',
        intoRePasswordTips: '請再次輸入密碼',
        intoAgree: '我已閱讀並理解 ##Term of Service## 和 ##Privacy Policy##',
        term: 'Term of Service',
        policy: 'Privacy Policy',
        intoBtn: '導入錢包',
        intoFilePassword: '密碼',
        intoFilePasswordTips: '請輸入Stronhold文件密碼',

        createTitle: '創建錢包',
        passwordOptional: '設置密碼',

        backupTitle: '備份錢包',
        backupTips: '備份提示',
        backupTipsContent: `獲得助記符等於擁有錢包內所有資產

助記符是找回錢包的唯一途徑

助記詞由英文單詞組成，請抄錄並妥善保管`,
        next: '下一步',

        backupScreenshoptTitle: '請勿截屏',
        backupScreenshoptTips: '請勿截屏助記詞，該操作可能帶來由第三方獲取助記詞而引起的資產損失',
        backupScreenshoptBtn: '我已理解',

        mnemonicTitle: '備份助記詞',
        mnemonicSubTitle: '助記詞可用於找回錢包，請務必按順序妥善記錄並保管',
        mnemonicPhraseTips1: '助記詞一旦丟失則資產無法找回，請務必將記錄好的助記詞在線下妥善保管',
        mnemonicPhraseTips2: '請勿在線上存儲或分享助記詞，如截屏、郵件、社交媒體等',
        mnemonicBtn: '已完成備份，現在驗證',

        registerSucc: `允許 Tanglepay 收集您的數據並幫助我們持續改善產品的用戶體驗。


<##Tangle Pay 將##>
始終允許您通過「設置」退出 

發送匿名點擊和頁面查看事件

發送城市、國家、地區信息（不包含具體地址）


<##Tangle Pay 永遠不會##>
收集您的密碼、地址、交易、余額或任何個人信息

收集您的 IP 地址

出售您的數據以獲取利潤

此數據處理滿足歐盟法規 2016/679 通用數據保護條例的要求，因此是匿名的。有關我們隱私保護實踐的更多信息，請參閱我們的隱私政策`,
        start: '開始',

        mnemonicError: '助記詞長度為{len}個單詞',

        unopen: '暫未開放',
        testBackup: '助記詞驗證',

        checkPasswrod: '兩次輸入的密碼不一致，請重新輸入',
        mnemonicWordError: '助記詞中包含無法識別的單詞{word}',
        mnemonicOtherError: '助記詞錯誤，請重新輸入',

        dearFam: '親愛的##IOTA##支持者，',
        betaReady: `歡迎使用TanlgePay，TanglePay 是一款 IOTA 代幣和NFT的錢包，同時支持其他EVM鏈，很快我們將可以支持 Shimmer 網絡以及 Shimmer EVM。請選擇您所使用的網絡。`,
        changeTips: '請選擇您將要首先使用的網絡。您可以在登陸錢包後隨時添加其他網絡。',
        devnet: 'IOTA 測試網',
        mainnet: 'IOTA 主網',
        evmnet: 'IOTA EVM',
        selectNode: '選擇網絡',
        exportKey: '導出私鑰',
        showKey: '顯示私鑰',
        showKeyInputPassword: '請輸入 {name} 的密碼',
        copyKeyTips: '這是您的私鑰（點擊復製）',
        showKeyTips: '提示：請永遠不要泄漏您的私鑰，任何人擁有您的私鑰就可以控製您的賬戶。',
        done: '已完成',
        viewInExplorer: '查看explorer',
        or: '或',
        importDuplicate: '該錢包已完成導入',
        privateKeyImport: '私鑰導入',
        inputPrivateKey: '請填入私鑰',
        removeTitle: '移除錢包',
        removeTips: `該錢包將會從您的設備中移除。請確保您已經將助記詞或私鑰妥善保管。`,
        removeName: '賬戶名',
        removeAddress: '地址',
        nevermind: '取消',
        remove: '移除',

        walletDetail: '錢包詳情',
        seedAddresses: '該seed下的地址',
        exportExcel: '導出',
        address: '地址',
        outputNum: 'Output數',
        iotaNum: '金額 MIOTA',
        totalNum: '總額',
        outputCollect: 'output歸集',
        collectTips: `說明：Output合併會將您的資產從多個地址和 UTXO（未使用的交易輸出）聚合到您的主地址上的統一 UTXO 中，這將提高後續活動的性能，包括但不限於獲得餘額和轉幣。`,
        pendingNum: '待處理output條數',
        processedNum: '已處理的條數',
        collectTermination: '終止',
        collectSuccTips: 'Output歸集已完成，請重新stake'
    },
    assets: {
        myAssets: '我的資產',
        send: '發送',
        receive: '收取',
        assets: '資產',
        activity: '操作記錄',
        search: '搜索',
        myWallets: '我的錢包',
        addWallets: '添加錢包',
        copied: '已復製',
        currency: '幣種',
        receiver: '收款地址',
        receiverTips: '添加或粘貼地址',
        amount: '數量',
        amountTips: '添加轉賬數量',
        balance: '余額',
        password: '密碼',
        passwordTips: '輸入密碼',
        confirm: '確認',

        scanQRcode: '通過掃碼收款',
        copy: '復製',
        share: '分享',

        addAssets: '添加資產',
        addAssetsTips: '輸入代幣名稱或合約地址',

        scanTitle: '掃碼',
        scanPermissionsTitle: '申請攝像頭權限',
        scanPermissionsTips: '應用想使用你的攝像頭掃描二維碼',
        scanTips: '將二維碼放入框內，即可自動掃描',
        scanError: '未開啟攝像頭權限，無法掃描二維碼',

        noWallet: '您還沒有添加錢包哦',

        sendSucc: '發送成功',
        sendSuccRestake: '發送成功',
        sendError: '發送失敗，請檢查收取地址是否正確',
        passwordError: '錢包密碼錯誤',
        balanceError: '余額不足',
        balanceStakeError: '資金不足。請先unstake。',

        requestAssets: '正在獲取資產數據',
        requestHis: '正在獲取歷史交易記錄',

        receivedSucc: '成功接收IOTA {num} Mi',
        album: '相冊',
        readFail: '二維碼識別失敗',

        residueBelow1Tips: '剩余數量不能是小於1的小數，請重新輸入金額。',
        sendBelow1Tips: '發送金額不能少於1 Mi，請重新輸入金額。'
    },
    user: {
        me: '個人',
        manageWallets: '管理錢包',
        setting: '設置',
        network: 'Network',
        privacy: '隱私',
        privacyTips: '參加TangleMetrics',
        aboutUs: '關於我們',
        language: '語言',

        manage: '管理',
        backupWallet: '備份錢包',
        backupWalletTips: `導出到Stronghold文件 - 
一份您的錢包和最新交易歷史的完整加密備份`,
        export: '導出',
        resetPassword: '重置密碼',
        old: '舊的',
        oldTips: '請輸入您舊的密碼',
        new: '新的',
        newTips: '請輸入您新的密碼',
        repeatPassword: '再次輸入密碼',
        exportNewFile: '導出一份Stronghold文件',

        nodeError: '節點未同步',
        passwordError: '舊密碼輸入錯誤',
        passwordSucc: '密碼重置成功',

        curVersion: '當前版本 ',
        versionUpdate: '版本更新',
        versionNew: '最新',
        website: '官方網站',
        telegramGroup: 'Telegram Group',
        discord: 'Discord',
        groupEmail: '郵箱',

        latestVersion: '當前已是最新版本'
    },
    staking: {
        title: 'Staking',
        preStake: 'Pre-stake',
        his: 'Staking記錄',
        stake: 'Stake',
        airdrops: 'Airdrops',
        startAt: '開始於',
        amount: '數量',
        available: '可用',
        availableToStake: '可以stake',
        estimatedReceived: '預期已獲得收益',
        airdropsList: 'Airdrops列表',
        add: '添加',
        unstake: 'Unstake',
        staked: 'Staked',
        enterAmount: '添加數量',
        max: '最大化',
        password: '密碼',
        confirm: '確認',
        addAirdrop: '添加 {name} Airdrop',
        token: '代幣',
        viewAll: '查看全部',
        addAmount: '添加數量',
        addAirdrop: '添加 Airdrop',
        noAvailableTips: '您的賬戶沒有可用IOTA，請轉入IOTA參與空投。',
        stakeBelow1Tips: '數量不能少於1Mi，請重新輸入。',
        soon: '即將開始',
        limitAmount: '至少需要 {num} MIOTA 才可參與 {token} staking.'
    },
    apps: {
        title: 'Dapps',
        sendFrom: '來自',
        sendFor: '用於購買',
        send: `您有一個支付申請#merchant##item_desc#，將支付到以下地址，
#address#
支付金額為 #amount# #unit#。
請填寫密碼完成支付。`,
        sign: `來自 #merchant# 的簽名請求
您在簽名：
#content#`,
        execute: '確認',
        cancel: '取消',
        signLabel: 'TanglePay 簽名',
        connect: `#origin#
連接
#address#
允許網站: 查看地址, 錢包余額
`,
        ConnectBtn: '連接'
    },
    nft: {
        collectibles: '收藏品',
        zeroTips: '您暫時還沒有{name}',
        clearCache: '清理緩存',
        goBuy: '去購買',
        permissions: '請允許TanglePay保存NFT圖片到您的相冊',
        saved: '保存成功'
    },
    discover: {
        title: '發現',
        buyIota: '購買IOTA',
        addressCopy: '地址已復製'
    }
}

export default ZH
