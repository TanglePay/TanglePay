import I18n from 'i18n-js'
import * as RNLocalize from 'react-native-localize'
import zh from './zh'
import en from './en'

const locales = RNLocalize.getLocales()
const systemLanguage = locales[0]?.languageCode // user language preferences

if (systemLanguage && ['en', 'zh'].includes(systemLanguage)) {
    I18n.locale = systemLanguage
} else {
    I18n.locale = 'en' // default language
}

I18n.fallbacks = true
I18n.translations = {
    zh,
    en
}

export default I18n
