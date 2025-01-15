import * as RNLocalize from 'react-native-localize';
const locales = RNLocalize.getLocales();
const bestLanguage = locales[0]?.languageTag || 'en';
const deviceLanguageRaw = bestLanguage;

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
        "NoButtonName": "ללא שם",
        "SelectProfileTitle": "פרופילים שמורים",
        "SelectButtonTitle": "כפתורים שמורים",
        "ProfileNoName": "אין פרופיל פעיל",
        "NoItemsFound": "אין",
        "SetProfileName": "שמור פרופיל בשם",
        "RenameProfile": "שנה שם הפרופיל",
        "InvalidName": "שם לא חוקי. אין להשתמש בתווים הבאים: {1}",
        "ButtonExists": "כפתור בשם ׳{1}׳ כבר קיים",
        "ProfileExists": "פרופיל בשם ׳{1}׳ כבר קיים",
        "Cancel": "ביטול",
        "Overwrite": "המשך",
        "Save": "שמירה",
        "Close": "סגירה",
        "Browse": "עיון",
        "Load": "טעינה...",
        "Create": "יצירה",
        "Rename": "ערוך שם",
        "Delete": "מחיקה",
        "ProfileSuccessRenamed": "שם הפרופיל שונה בהצלחה",
        "ProfileSuccessfulyCreated": "הפרופיל נוצר בהצלחה",
        "ProfileExistsTitle": "פרופיל קיים",
        "ProfileSaveFailed": "שמירת הפרופיל נכשלה",
        "ButtonSaved": "כפתור נשמר בהצלחה",
        "ButtonExistsTitle": "כפתור קיים",
        "ButtonSaveFailed": "שמירת הכפתור נכשלה",
        "ButtonMissingName": "יש לקבוע שם לכפתור",
        "DeleteProfileTitle": "מחיקת פרופיל",
        "DeleteCurrentProfileWarnning": "האם למחוק את הפרופיל ׳{1}׳? יש לשים לב: זהו הפרופיל הנוכחי",
        "DeleteProfileWarnning": "האם למחוק את הפרופיל ׳{1}׳?",
        "DeleteButtonTitle": "מחיקת כפתור שמור",
        "DeleteButtonWarnning": "האם למחוק את הכפתור השמור ׳{1}׳",
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
        "ProfileNoName": "No Active Profile",
        "SelectProfileTitle": "Saved Profiles",
        "SelectButtonTitle": "Saved Buttons",
        "ProfileName": "Profile",
        "NoButtonName": "No Name",
        "NoItemsFound": "Empty",
        "SetProfileName": "Save Profile As",
        "RenameProfile": "Rename Profile",
        "InvalidName": "Illigal name. Don't use these charachters: {1}",
        "ButtonExists": "Button '{1}' already exists",
        "ProfileExists": "Profile '{1}' already exists",
        "Cancel": "Cancel",
        "Overwrite": "Overwrite",
        "Save": "Save",
        "ProfileSuccessRenamed": "Profile Renamed Successfully",
        "ProfileSuccessfulyCreated": "Profile Created Successfully",
        "ProfileExistsTitle": "Profile Exists",
        "ProfileSaveFailed": "Failed to save profile",
        "ButtonSaved": "Button Saved Successfully",
        "ButtonExistsTitle": "Button Exists",
        "ButtonSaveFailed": "Failed to save the button",
        "Close": "Close",
        "Browse": "Browse",
        "Load": "Load...",
        "Create": "Create",
        "Rename": "Rename",
        "Delete": "Delete",
        "ButtonMissingName": "A Button Name Is Missing",
        "DeleteProfileTitle": "Delete Profile",
        "DeleteCurrentProfileWarnning": "Deleting Profile '{1}'. Are you sure? Note: it is the current profile",
        "DeleteProfileWarnning": "Deleting Profile '{1}'. Are you sure?",
        "DeleteButtonTitle": "Delete Saved Button",
        "DeleteButtonWarnning": "Deleting Saved Button '{1}'. Are you sure"
    },
    "ar": {
        "ButtonTitle": "زر {1}",
        "Settings": "الإعدادات",
        "About": "حول",
        "Load": "جارِ التحميل...",
        "NoButtonName": "بدون اسم",
        "BackgroundColor": "لون الخلفية",
        "Buttons": "الأزرار",
        "EnterSearchHere": "أدخل كلمات البحث",
        "ShowName": "إظهار الاسم",
        "SearchImageTitle": "البحث عن صورة",
        "BtnSearch": "بحث",
        "Vibrate": "اهتزاز",
        "ProfileNoName": "لا يوجد ملف شخصي نشط",
        "SelectProfileTitle": "الملفات الشخصية المحفوظة",
        "SelectButtonTitle": "الأزرار المحفوظة",
        "ProfileName": "الملف الشخصي",
        "NoItemsFound": "فارغ",
        "SetProfileName": "حفظ الملف الشخصي باسم",
        "RenameProfile": "إعادة تسمية الملف الشخصي",
        "InvalidName": "اسم غير قانوني. لا تستخدم هذه الأحرف: {1}",
        "ButtonExists": "يوجد زر '{1}' بالفعل",
        "ProfileExists": "يوجد ملف شخصي '{1}' بالفعل",
        "Cancel": "إلغاء",
        "Overwrite": "استبدال",
        "Save": "حفظ",
        "ProfileSuccessRenamed": "تمت إعادة تسمية الملف الشخصي بنجاح",
        "ProfileSuccessfulyCreated": "تم إنشاء الملف الشخصي بنجاح",
        "ProfileExistsTitle": "الملف الشخصي موجود",
        "ProfileSaveFailed": "فشل حفظ الملف الشخصي",
        "ButtonSaved": "تم حفظ الزر بنجاح",
        "ButtonExistsTitle": "الزر موجود",
        "ButtonSaveFailed": "فشل حفظ الزر",
        "Close": "إغلاق",
        "Browse": "تصفح",
        "Create": "إنشاء",
        "Rename": "إعادة تسمية",
        "Delete": "حذف",
        "ButtonMissingName": "اسم الزر مفقود",
        "DeleteProfileTitle": "حذف الملف الشخصي",
        "DeleteCurrentProfileWarnning": "حذف الملف الشخصي '{1}'. هل أنت متأكد؟ ملاحظة: هذا هو الملف الشخصي الحالي",
        "DeleteProfileWarnning": "حذف الملف الشخصي '{1}'. هل أنت متأكد؟",
        "DeleteButtonTitle": "حذف الزر المحفوظ",
        "DeleteButtonWarnning": "حذف الزر المحفوظ '{1}'. هل أنت متأكد؟"
    }
};

function findMissing() {
    let missing = ""
    //English
    console.log("Missing in English:")
    Object.entries(strings.he).forEach(([key, value]) => {
        if (!strings.en[key]) {
            missing += "\"" + key + "\":" + "\"" + value + "\",\n";
        }
    })
    console.log(missing);
    missing = "";
    console.log("\n\nMissing in Arabic:")
    Object.entries(strings.he).forEach(([key, value]) => {
        if (!strings.ar[key]) {
            missing += "\"" + key + "\":" + "\"" + value + "\",\n";
        }
    })
    console.log(missing);

    missing = "";
    console.log("\n\nMissing in Hebrew:")
    Object.entries(strings.en).forEach(([key, value]) => {
        if (!strings.he[key]) {
            missing += "\"" + key + "\":" + "\"" + value + "\",\n";
        }
    })
    console.log(missing);

}
//findMissing();


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