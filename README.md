### Hi there 👋

<!--
**TanglePay/TanglePay** is a ✨ _special_ ✨ repository because its `README.md` (this file) appears on your GitHub profile.

Here are some ideas to get you started:

- 🔭 I’m currently working on ...
- 🌱 I’m currently learning ...
- 👯 I’m looking to collaborate on ...
- 🤔 I’m looking for help with ...
- 💬 Ask me about ...
- 📫 How to reach me: ...
- 😄 Pronouns: ...
- ⚡ Fun fact: ...
-->

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