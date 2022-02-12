# Tangle Pay
![Tangle Pay](https://tanglepay.com/image/TanglePayLogo.png "Tangle Pay")

## Intro
[TanglePay](https://www.tanglepay.com) is an open-source IOTA wallet that manages your IOTA token and explore the IOTA ecosystem
in one secure interface on your mobile or browser.

This repo hosts the source code of TanglePay mobile version that supports iOS and Android.

### Secure
Your private keys are encrypted and never leave your device. You have full control of your funds.

### Anonymous
There are no accounts, verification or required KYC for basic features in the wallet.

### Accessible
You can access TanglePay anywhere at any time with mobile app or chrome app.

### Open
TanglePay is an open gateway to IOTA ecosystem, supporting Defi, NFTs and IoT in the coming update of IOTA.

## Installation
Download from official [TanglePay](https://www.tanglepay.com) website.

## Contributing
Help out the TanglePay project by filing a bug report, making a feature request or opening a pull request. 

Major projects
- [Shared Libraries](https://github.com/TanglePay/TanglePay)
- [Mobile](https://github.com/TanglePay/TanglePay-Mobile)
- [Browser Extensions](https://github.com/TanglePay/TanglePay-Extension)
- [DeepLink](https://github.com/TanglePay/TanglePay-DeepLink)

## Joining the discussion
- [Telegram](https://t.me/tanglepay)
- [Twitter](https://twitter.com/tanglepaycom)
- [Discord](https://discord.gg/5yMCwbdjZ3)
- Email:support@tanglepay.com 

## Development
### Build
```
yarn build-app
yarn build-browser
```

### Install
```
yarn add tanglepay
```
``` javascript
// app
import {Base, I18n, IotaSDK, ...} from 'tanglepay/lib/app/common';
import {useStore, ...} from 'tanglepay/lib/app/store'
import { useAddWallet } from 'anglepay/lib/app/store/common'
// browser
import {Base, I18n, IotaSDK, ...} from 'tanglepay/lib/browser/common';
import {useStore, ...} from 'tanglepay/lib/browser/store'
import { useAddWallet } from 'anglepay/lib/browser/store/common'
```