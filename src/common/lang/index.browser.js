import zh from './zh'
import en from './en'
import de from './de'
import I18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

I18next.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: en
            },
            zh: {
                translation: zh
            },
            de: {
                translation: de
            }
        },
        fallbackLng: 'en',
        debug: true,
        interpolation: {
            escapeValue: false
        }
    })

export default I18next
