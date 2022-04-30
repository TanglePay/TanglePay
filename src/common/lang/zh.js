const ZH = {
    account: {
        title: 'TanglePay Wallet',
        subTitle: `IOTA Tangle Technology\n
Going Beyond Blockchain`,
        create: '创建新钱包',
        hasWallet: '登陆钱包',
        intoTitle1: '助记词导入',
        intoTitle2: '备份文件导入',
        mnemonicTips: '请填入助记词，词与词间用空格隔开',
        intoSelectFile: '选择Stronghold文件',
        intoName: '设置钱包名称',
        intoNameTips: '请填入名称',
        intoPassword: '设置密码',
        intoPasswordTips: '8到20位数字和字母的组合',
        intoRePasswordTips: '请再次输入密码',
        intoAgree: '我已阅读并理解 ##Term of Service## 和 ##Privacy Policy##',
        intoBtn: '导入钱包',
        intoFilePassword: '密码',
        intoFilePasswordTips: '请输入Stronhold文件密码',

        createTitle: '创建钱包',
        passwordOptional: '设置密码',

        backupTitle: '备份钱包',
        backupTips: '备份提示',
        backupTipsContent: `获得助记符等于拥有钱包内所有资产

助记符是找回钱包的唯一途径

助记词由英文单词组成，请抄录并妥善保管`,
        next: '下一步',

        backupScreenshoptTitle: '请勿截屏',
        backupScreenshoptTips: '请勿截屏助记词，该操作可能带来由第三方获取助记词而引起的资产损失',
        backupScreenshoptBtn: '我已理解',

        mnemonicTitle: '备份助记词',
        mnemonicSubTitle: '助记词可用于找回钱包，请务必按顺序妥善记录并保管',
        mnemonicPhraseTips1: '助记词一旦丢失则资产无法找回，请务必将记录好的助记词在线下妥善保管',
        mnemonicPhraseTips2: '请勿在线上存储或分享助记词，如截屏、邮件、社交媒体等',
        mnemonicBtn: '已完成备份，现在验证',

        registerSucc: `允许 Tanglepay 收集您的数据并帮助我们持续改善产品的用户体验。


<##Tangle Pay 将##>
始终允许您通过“设置”退出 

发送匿名点击和页面查看事件

发送城市、国家、地区信息（不包含具体地址）


<##Tangle Pay 永远不会##>
收集您的密码、地址、交易、余额或任何个人信息

收集您的 IP 地址

出售您的数据以获取利润

此数据处理满足欧盟法规 2016/679 通用数据保护条例的要求，因此是匿名的。有关我们隐私保护实践的更多信息，请参阅我们的隐私政策`,
        start: '开始',

        mnemonicError: '助记词长度为24个单词',

        unopen: '暂未开放',
        testBackup: '助记词验证',

        checkPasswrod: '两次输入的密码不一致，请重新输入',
        mnemonicWordError: '助记词中包含无法识别的单词{word}',
        mnemonicOtherError: '助记词错误，请重新输入',

        dearFam: 'Dear IOTA fam,',
        betaReady: `TanglePay 已经上线！我们很荣幸邀请您使用并提供您的宝贵意见。`,
        changeTips: '请选择您希望使用的网络，您也可以在应用内随时切换。',
        devnet: 'Chrysalis 测试网',
        mainnet: 'Chrysalis 主网'
    },
    assets: {
        myAssets: '我的资产',
        send: '发送',
        receive: '收取',
        assets: '资产',
        activity: '操作记录',
        search: '搜索',
        myWallets: '我的钱包',
        addWallets: '添加钱包',
        copied: '已复制',
        currency: '币种',
        receiver: '收款地址',
        receiverTips: '添加或粘贴地址',
        amount: '数量',
        amountTips: '添加转账数量',
        balance: '余额',
        password: '密码',
        passwordTips: '输入密码',
        confirm: '确认',

        scanQRcode: '通过扫码收款',
        copy: '复制',
        share: '分享',

        addAssets: '添加资产',
        addAssetsTips: '输入代币名称或合约地址',

        scanTitle: '扫码',
        scanPermissionsTitle: '申请摄像头权限',
        scanPermissionsTips: '应用想使用你的摄像头扫描二维码',
        scanTips: '将二维码放入框内，即可自动扫描',
        scanError: '未开启摄像头权限，无法扫描二维码',

        noWallet: '您还没有添加钱包哦',

        sendSucc: '发送成功',
        sendError: '发送失败，请检查收取地址是否正确',
        passwordError: '钱包密码错误',
        balanceError: '余额不足',
        balanceStakeError: '资金不足。请先unstake。',

        requestAssets: '正在获取资产数据',
        requestHis: '正在获取历史交易记录',

        receivedSucc: '成功接收IOTA {num} Mi',
        album: '相册',
        readFail: '二维码识别失败',

        residueBelow1Tips: '剩余数量不能是小于1的小数，请重新输入金额。',
        sendBelow1Tips: '发送金额不能少于1 Mi，请重新输入金额。'
    },
    user: {
        me: '个人',
        manageWallets: '管理钱包',
        setting: '设置',
        network: 'Network',
        privacy: '隐私',
        privacyTips: '参加TangleMetrics',
        aboutUs: '关于我们',
        language: '语言',

        manage: '管理',
        backupWallet: '备份钱包',
        backupWalletTips: `导出到Stronghold文件 - 
一份您的钱包和最新交易历史的完整加密备份`,
        export: '导出',
        resetPassword: '重置密码',
        old: '旧的',
        oldTips: '请输入您旧的密码',
        new: '新的',
        newTips: '请输入您新的密码',
        repeatPassword: '再次输入密码',
        exportNewFile: '导出一份Stronghold文件',

        nodeError: '节点未同步',
        passwordError: '旧密码输入错误',
        passwordSucc: '密码重置成功',

        curVersion: '当前版本 ',
        versionUpdate: '版本更新',
        versionNew: '最新',
        website: '官方网站',
        telegramGroup: 'Telegram Group',
        discord: 'Discord',
        groupEmail: '邮箱',

        latestVersion: '当前已是最新版本'
    },
    staking: {
        title: 'Staking',
        preStake: 'Pre-stake',
        his: 'Staking记录',
        stake: 'Stake',
        airdrops: 'Airdrops',
        startAt: '开始于',
        amount: '数量',
        available: '可用',
        availableToStake: '可以stake',
        estimatedReceived: '预期已获得收益',
        airdropsList: 'Airdrops列表',
        add: '添加',
        unstake: 'Unstake',
        staked: 'Staked',
        enterAmount: '添加数量',
        max: '最大化',
        password: '密码',
        confirm: '确认',
        addAirdrop: '添加 {name} Airdrop',
        token: '代币',
        viewAll: '查看全部',
        addAmount: '添加数量',
        addAirdrop: '添加 Airdrop',
        noAvailableTips: '您的账户没有可用IOTA，请转入IOTA参与空投。',
        stakeBelow1Tips: '数量不能少于1Mi，请重新输入。',
        soon: '即将开始',
        limitAmount: '至少需要 {num} MIOTA 才可参与 {token} staking.'
    },
    apps: {
        title: 'Dapps',
        sendFrom: '来自',
        sendFor: '用于购买',
        send: `您有一个支付申请#merchant##item_desc#，将支付到以下地址，
#address#
支付金额为 #amount# MIOTA。
请填写密码完成支付。`,
        sign: `来自 #merchant# 的签名请求
您在签名：
#content#`,
        execute: '确认',
        cancel: '取消',
        signLabel: 'TanglePay 签名'
    },
    nft: {
        collectibles: '收藏品',
        zeroTips: '您暂时还没有{name}',
        clearCache: '清理缓存',
        goBuy: '去购买'
    }
}

export default ZH
