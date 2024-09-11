import { Platform, NativeModules } from 'react-native'

const deviceLanguageRaw = //"he"
    Platform.OS === 'ios'
        ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13 and above
        : NativeModules.I18nManager.localeIdentifier;

const supportedLanguages = ['he', 'en', 'ar'];

// Extract the first two characters of the language code (e.g., 'en', 'he')
const deviceLanguage = deviceLanguageRaw.split(/[-_]/)[0];

// Check if the detected language is supported, otherwise default to 'en'
export const gCurrentLang: string = supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'en';

console.log("Detected Language", deviceLanguageRaw, "Using Language", gCurrentLang);
export const isRight2Left = gCurrentLang.startsWith("he") || gCurrentLang.startsWith("ar");


var strings: any = {
    "he": {
        "ButtonTitle": "כפתור {1}",
        "Settings": "הגדרות",
        "About": "אודות",
        "BackgroundColor": "צבע רקע",
        "Buttons": "כפתורים",
        "EnterSearchHere": "הכנסת מילות חיפוש",
        "ShowName": "הצג שם",
        "SearchImageTitle": "חפש תמונה",
        "BtnSearch": "חפש",
        "Vibrate": "רטט",
    },
    "en": {
        "ButtonTitle": "Button {1}",
        "Settings": "Settings",
        "About": "About",
        "BackgroundColor": "Background Color",
        "Buttons": "Buttons",
        "EnterSearchHere": "Enter search keywords",
        "ShowName": "Show Name",
        "SearchImageTitle": "Search Image",
        "BtnSearch": "Search",
        "Vibrate": "Vibrate",
    },
    "ar": {
        "ButtonTitle": "زر {1}",
        "Settings": "الإعدادات",
        "About": "حول",
        "BackgroundColor": "لون الخلفية",
        "Buttons": "الأزرار",
        "EnterSearchHere": "أدخل كلمات البحث",
        "ShowName": "إظهار الاسم",
        "SearchImageTitle": "البحث عن صورة",
        "BtnSearch": "بحث",
        "Vibrate": "اهتزاز"
    }
};


const currStrings = strings[deviceLanguage];

export function isRTL() {
    return isRight2Left;
}

export function translate(id: string) {
    return currStrings[id] || id;
}

export function fTranslate(id: string, ...args: any[]) {
    return replaceArgs(translate(id), args);
}

function replaceArgs(s: string, args: any) {
    return s.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number - 1] != 'undefined'
            ? args[number - 1]
            : match
            ;
    });
}