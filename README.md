# Tangle Pay
![Tangle Pay](https://tanglepay.com/image/TanglePayLogo.png "Tangle Pay")

## Intro
[TanglePay](https://www.tanglepay.com) is A Web3 Talking Wallet powered by GroupFi protocol.

This repo hosts the source code of TanglePay mobile version that supports iOS and Android.

### *Secure*
Your private keys are encrypted and never leave your device. You have full control of your funds.

### *Anonymous*
There are no accounts, verification or required KYC for basic features in the wallet.

### *Accessible*
You can access TanglePay anywhere at any time with mobile app or chrome app.

### *Open*
TanglePay is an open gateway to IOTA ecosystem, supporting Defi, NFTs and IoT in the coming update of IOTA.

## Installation
### Download the app from one of below link for your preferred platform.
- All platforms: Official [TanglePay](https://www.tanglepay.com) website
- [Chrome Web Store](https://chrome.google.com/webstore/detail/tanglepay-iota-wallet/hbneiaclpaaglopiogfdhgccebncnjmc)
- [Apple App Store](https://apps.apple.com/us/app/tanglepay-iota-wallet/id1591026253)
- [Google Play](https://play.google.com/store/apps/details?id=com.cat.iota)
- [GitHub releases](https://github.com/TanglePay/TanglePay-Mobile/releases/)

### How to verify authenticity of downloaded app
Visit GitHub page for
- [Latest extension release](https://github.com/TanglePay/TanglePay-Extension/releases/latest)
- [Latest mobile release](https://github.com/TanglePay/TanglePay-Mobile/releases/latest)
- or any specific version match your downloads under release page.

Calculate your SHA256 checksums of downloaded package and compare with the one specified in the release notes.

For more details, please refer to see [Verify Download](docs/VerifyDownload.md).

### How to verify source code matches downloaded app
Checkout the code with matching release tags from source repositories.

Unpack the downloaded applications and compare with the local build output, there shouldn't be differences except signature, cert or hash due to build environment/platform discrepancies.

For local build instructions, pleaes refer to [Development](#Development) section.

## Contributing
Help out the TanglePay project by filing a bug report, making a feature request or opening a pull request. 

## Major projects
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
### *Build for TanglePay-Extension*
```
yarn
yarn build
```

### *Build for TanglePay-Mobile*
```
npm install
cd [your platform]
gradlew assembleRelease
```

### *Include TanglePay library into your own app*
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
