import { Platform, NativeModules } from 'react-native'

const deviceLanguageRaw = // "he"
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
        "ProfileName": "פרופיל",
        "SelectProfileTitle": "בחר פרופיל",
        "SelectButtonTitle": "בחר כפתור",
        "ProfileNoName": "ללא שם",
        "NoItemsFound": "אין",
        "SetProfileName": "קביעת שם לפרופיל",
        "RenameProfile": "שנה שם הפרופיל",
        "InvalidName": "שם לא חוקי. אין להשתמש בתווים הבאים: {1}",
        "buttonExists": "כפתור בשם זה כבר קיים",
        "ProfileExists": "פרופיל בשם זה כבר קיים",
        "Cancel": "ביטול",
        "Overwrite": "המשך",
        "Save": "שמור",
        "ProfileSuccessRenamed": "שם הפרופיל שונה בהצלחה",
        "ProfileSuccessfulyCreated": "הפרופיל נוצר בהצלחה",
        "ProfileExistsTitle": "פרופיל קיים",
        "ProfileSaveFailed": "שמירת הפרופיל נכשלה",
        "ButtonSaved": "כפתור נשמר בהצלחה",
        "ButtonExistsTitle": "כפתור קיים",
        "ButtonSaveFailed": "שמירת הכפתור נכשלה",

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
        "ProfileNoName": "NONAME",
        "SelectProfileTitle": "Select a Profile",
        "SelectButtonTitle": "Select a Button",
        "ProfileName": "Profile",
        "NoItemsFound": "Empty",
        "SetProfileName": "Set Profile Name",
        "RenameProfile": "Rename Profile",
        "InvalidName": "Illigal name. Don't use these charachters: {1}",
        "buttonExists": "Button with that name already exists",
        "ProfileExists": "Profile with that name already exists",
        "Cancel": "Cancel",
        "Overwrite": "Overwrite",
        "Save": "Save",
        "ProfileSuccessRenamed": "Profile Renamed Successfully",
        "ProfileSuccessfulyCreated": "Profile Created Successfully",
        "ProfileExistsTitle": "Profile Exists",
        "ProfileSaveFailed": "Failed to save profile",
        "ButtonSaved": "Button Saved Successfully",
        "ButtonExistsTitle": "Button exists",
        "ButtonSaveFailed": "Failed to save the button",
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
        "Vibrate": "اهتزاز",

        "ProfileNoName": "بدون اسم",
        "SelectProfileTitle": "اختر ملف تعريف",
        "SelectButtonTitle": "اختر زر",
        "ProfileName": "ملف التعريف",
        "NoItemsFound": "فارغ",
        "SetProfileName": "تعيين اسم ملف التعريف",
        "RenameProfile": "إعادة تسمية ملف التعريف",
        "InvalidName": "اسم غير قانوني. لا تستخدم هذه الأحرف: {1}",
        "buttonExists": "يوجد زر بهذا الاسم بالفعل",
        "ProfileExists": "يوجد ملف تعريف بهذا الاسم بالفعل",
        "Cancel": "إلغاء",
        "Overwrite": "استبدال",
        "Save": "حفظ",
        "ProfileSuccessRenamed": "تم إعادة تسمية ملف التعريف بنجاح",
        "ProfileSuccessfulyCreated": "تم إنشاء ملف التعريف بنجاح",
        "ProfileExistsTitle": "ملف التعريف موجود",
        "ProfileSaveFailed": "فشل في حفظ ملف التعريف",
        "ButtonSaved": "تم حفظ الزر بنجاح",
        "ButtonExistsTitle": "الزر موجود",
        "ButtonSaveFailed": "فشل في حفظ الزر"
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