import { Platform, NativeModules } from 'react-native'

const deviceLanguage = //'he';
    Platform.OS === 'ios'
        ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
        : NativeModules.I18nManager.localeIdentifier;

export const gCurrentLang: string = deviceLanguage
console.log("Detected Language", deviceLanguage);
export const isRight2Left = gCurrentLang.startsWith("he");


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
        "BtnSearch":"חפש"
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
        "BtnSearch":"Search"
    }
};


const currStrings = isRight2Left ? strings["he"] : strings["en"];

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