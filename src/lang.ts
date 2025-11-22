import * as RNLocalize from 'react-native-localize';
const locales = RNLocalize.getLocales();
const bestLanguage = locales[0]?.languageTag || 'en';
const deviceLanguageRaw =  //'he'
    bestLanguage;

const supportedLanguages = ['he', 'en', 'ar'];

// Extract the first two characters of the language code (e.g., 'en', 'he')
const deviceLanguage = deviceLanguageRaw.split(/[-_]/)[0];

// Check if the detected language is supported, otherwise default to 'en'
export const gCurrentLang: string = supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'en';

console.log("Detected Language", deviceLanguageRaw, "Using Language", gCurrentLang);
export const isRight2Left = gCurrentLang.startsWith("he") || gCurrentLang.startsWith("ar");


var strings: any = {
    "he": {
        "Welcome": "ברוכים הבאים",
        "Settings": "הגדרות",
        "About": "אודות",
        "BackgroundColor": "צבע רקע",
        "Buttons": "כמות כפתורים",
        "EnterSearchHere": "הכנסת מילות חיפוש",
        "ShowName": "הצג שם",
        "SearchImageTitle": "חפש תמונה",
        "BtnSearch": "חפש",
        "Vibrate": "רטט",
        "ProfileName": "שם פרופיל",
        "ListProfiles": "רשימה",
        "SelectProfileTitle": "בחירת פרופיל",
        "SelectButtonTitle": "ספריית כפתורי-שמע",
        "ProfileNoName": "אין פרופיל פעיל",
        "NoItemsFound": "אין",
        "SetProfileName": "שמור פרופיל בשם",
        "RenameProfile": "שנה שם הפרופיל",
        "InvalidName": "שם לא חוקי. אין להשתמש בתווים הבאים: {1}",
        "ButtonExists": "כפתור-שמע בשם ׳{1}׳ כבר קיים",
        "ProfileExists": "פרופיל בשם ׳{1}׳ כבר קיים",
        "Cancel": "ביטול",
        "OK": "אשר",
        "Overwrite": "המשך",
        "Save": "שמירה",
        "SaveToList": "שמירה לספרייה",
        "Close": "סגירה",
        "Browse": "עיון",
        "LoadFromList": "ספרייה",
        "LoadBtn": "טעינה",
        "Create": "יצירה",
        "Rename": "ערוך שם",
        "EditButton": "עריכה",
        "Delete": "מחיקה",
        "ProfileSuccessRenamed": "שם הפרופיל שונה בהצלחה",
        "ProfileSuccessfulyCreated": "הפרופיל נוצר בהצלחה",
        "ProfileExistsTitle": "פרופיל קיים",
        "DefaultProfile": "בית",
        "ReservedName": "שם שמור",
        "ProfileNameTitle": "שם הפרופיל",
        "ProfileEditNameTitle": "עריכת שם פרופיל",
        "ProfileSaveFailed": "שמירת הפרופיל נכשלה",
        "OneAfterTheOther": "אחד אחרי השני",
        "ResetButtons": "חוזר בעוד {1}",
        "ButtonSaved": "כפתור-שמע נשמר בהצלחה",
        "ButtonExistsTitle": "כפתור-שמע קיים",
        "ButtonSaveFailed": "שמירת כפתור-השמע נכשלה",
        "ButtonMissingName": "יש לקבוע שם לכפתור-השמע",
        "DeleteProfileTitle": "מחיקת פרופיל",
        "DeleteCurrentProfileWarnning": "האם למחוק את הפרופיל ׳{1}׳? יש לשים לב: זהו הפרופיל הנוכחי",
        "DeleteProfileWarnning": "האם למחוק את הפרופיל ׳{1}׳?",
        "DeleteButtonTitle": "מחיקת כפתור-שמע מהספרייה",
        "DeleteButtonWarnning": "האם למחוק את כפתור השמע מהספרייה ׳{1}׳",
        "OpenIn": "פתיחה בעוד {1} שניות",
        "NoResultsMsg": "לא נמצאו תמונות",
        "EditButtonTitle": "עריכת כפתור-שמע",
        "ButtonBackgroundColor": "צבע",
        "SearchImage": "חפש תמונה",
        "Gallery": "גלריה",
        "RemoveImage": "הסר תמונה",
        "Name": "שם",
        "Appearance": "עיצוב",
        "Voice": "הקלטה",
        "OneAfterTheOtherBtn": "אחד אחרי שני",
        "AllAtOnceBtn": "כולם יחד",
        "Backup": "גיבוי",
        "BackupAll": "גיבוי הכל",
        "ButtonsLayout": "סדר כפתורים",
        "ShareBackupWithTitle": "גיבוי",
        "ShareBackupEmailSubject": "קובץ גיבוי",
        "ShareProfileWithTitle": "ייצוא פרופיל",
        "ShareProfileEmailSubject": "קובץ פרופיל",
        "ShareSuccessful": "הקובץ נשלח בהצלחה",
        "SavedSuccessful":"הקובץ נשמר בהצלחה בתיקיית ההורדות",
        "ActionCancelled": "הפעולה בוטלה",
        "UnknownPackageType": "קובץ לא מתאים",
        "ImportedProfiles": "פרופילים שיובאו",
        "SkippedProfiles": "פרופילים קיימים (שלא יובאו)",
        "NoteSkippedItems": "הערה: אם ברצונך שהפרופילים המיובאים יחליפו את הקיימים, מחק את הגרסאות המקומיות עם אותו שם לפני הייבוא.",
        "ImportError": "יבוא נכשל",
        "SuccessfulImport": "יבוא הסתיים בהצלחה",
        "AboutToOverwriteButtonTitle": "שמירה לפני יבוא מהספרייה",
        "AboutToOverwriteButton": "האם לשמור את כפתור-השמע הנוכחי לפני טעינת כפתור-שמע מהספרייה?",
        "SaveFirst": "שמירה ואז טעינה",
        "ContinueWithoutSave": "טעינה ללא שמירה",
        "EditImage": "ערוך תמונה",
        "EditImageTitle": "ניתן להזיז ולשנות את הגודל",
        "AboutToReloadSameButtonTitle": "טעינה מחדש של אותו כפתור-שמע",
        "AboutToReloadSameButton": "טעינת אותו כפתור-שמע תדרוס את השינויים שנעשו בכפתור בפרופיל זה. להמשיך?",
        "Load": "טוען...",
        "ProfileSaveAsTitle": "שמירת '{1}' בשם",
    },
    "en": {
        "Welcome": "Welcome",
        "Settings": "Settings",
        "About": "About",
        "BackgroundColor": "Background Color",
        "Buttons": "Number Of Buttons",
        "EnterSearchHere": "Enter search keywords",
        "ShowName": "Show Name",
        "SearchImageTitle": "Search Image",
        "BtnSearch": "Search",
        "Vibrate": "Vibrate",
        "ProfileNoName": "No Active Profile",
        "SelectProfileTitle": "Saved Profiles",
        "SelectButtonTitle": "Voice-Button Templates",
        "ProfileName": "Profile",
        "NoItemsFound": "Empty",
        "SetProfileName": "Save Profile As",
        "RenameProfile": "Rename Profile",
        "InvalidName": "Illigal name. Don't use these charachters: {1}",
        "ButtonExists": "Voice-Button Template '{1}' already exists",
        "ProfileExists": "Profile '{1}' already exists",
        "Cancel": "Cancel",
        "Overwrite": "Overwrite",
        "Save": "Save",
        "ProfileSuccessRenamed": "Profile Renamed Successfully",
        "ProfileSuccessfulyCreated": "Profile Created Successfully",
        "ProfileExistsTitle": "Profile Exists",
        "ProfileSaveFailed": "Failed to save profile",
        "ButtonSaved": "Voice-Button Template Saved Successfully",
        "ButtonExistsTitle": "Voice-Button Template Exists",
        "ButtonSaveFailed": "Failed to save as template",
        "Close": "Close",
        "Browse": "Browse",
        "Load": "Load...",
        "Create": "Create",
        "Rename": "Rename",
        "Delete": "Delete",
        "ButtonMissingName": "Name Is Missing",
        "DeleteProfileTitle": "Delete Profile",
        "DeleteCurrentProfileWarnning": "Deleting Profile '{1}'. Are you sure? Note: it is the current profile",
        "DeleteProfileWarnning": "Deleting Profile '{1}'. Are you sure?",
        "DeleteButtonTitle": "Delete Voice-Button Template",
        "DeleteButtonWarnning": "Deleting Voice-Button Template '{1}'. Are you sure",
        "OpenIn": "Open In {1} seconds",
        "ListProfiles": "List",
        "OK": "OK",
        "SaveToList": "Save As Template",
        "ProfileSaveAsTitle": "Save '{1}' As",
        "AboutToReloadSameButtonTitle": "Reload Again The Same Voice-Button Template",
        "AboutToReloadSameButton": "Are you sure you want to reload the same template and loose change made to the button in this profile?",
        "LoadFromList": "Templates",
        "LoadBtn": "Load",
        "EditButton": "Edit",
        "DefaultProfile": "Home Profile",
        "ReservedName": "Reserved Name",
        "ProfileNameTitle": "Profile Name",
        "ProfileEditNameTitle": "Edit Profile Name",
        "OneAfterTheOther": "One After The Other",
        "ResetButtons": "Reset in {1}",
        "NoResultsMsg": "No Images found",
        "EditButtonTitle": "Edit Voice-Button",
        "ButtonBackgroundColor": "Color",
        "SearchImage": "Search Image",
        "Gallery": "Gallery",
        "RemoveImage": "Remove Image",
        "Name": "Name",
        "Appearance": "Appearance",
        "Voice": "Audio",
        "OneAfterTheOtherBtn": "Step By Step",
        "AllAtOnceBtn": "All Together",
        "Backup": "Backup",
        "BackupAll": "Backup All",
        "ButtonsLayout": "Buttons Layout",
        "ShareBackupWithTitle": "Backup",
        "ShareBackupEmailSubject": "Backup File",
        "ShareProfileWithTitle": "Profile Export",
        "ShareProfileEmailSubject": "Profile File",
        "ShareSuccessful": "File shared successfully",
        "SavedSuccessful":"File Saved Successfully In the Downloads folder",
        "ActionCancelled": "Action cancelled",
        "UnknownPackageType": "Unknown File",
        "ImportedProfiles": "Imported Profiles",
        "SkippedProfiles": "Existing Profile (skipped)",
        "ImportError": "Import Failed",
        "SuccessfulImport": "Import Completed Successfuly",
        "NoteSkippedItems": "Note: If you want the imported profiles to replace your existing ones, please delete the local versions with the same name before importing.",
        "AboutToOverwriteButtonTitle": "Save Before Loading a Template",
        "AboutToOverwriteButton": "Would you like to save the current voice-button before loading the template?",
        "SaveFirst": "Save and Load",
        "ContinueWithoutSave": "Load Without Save",
        "EditImage": "Edit Image",
        "EditImageTitle": "You may move and change size",

    },
    "ar": {
        "Welcome": "أهلًا وسهلًا",
        "Settings": "الإعدادات",
        "About": "حول التطبيق",
        "BackgroundColor": "لون الخلفية",
        "Buttons": "الأزرار",
        "EnterSearchHere": "أدخل كلمات البحث",
        "ShowName": "إظهار الاسم",
        "SearchImageTitle": "البحث عن صورة",
        "BtnSearch": "بحث",
        "Vibrate": "اهتزاز",
        "ProfileNoName": "لا يوجد ملف شخصي نشط",
        "SelectProfileTitle": "الملفات الشخصية المحفوظة",
        "SelectButtonTitle": "نماذج الأزرار",
        "ProfileName": "الملف الشخصي",
        "NoItemsFound": "فارغ",
        "SetProfileName": "حفظ الملف الشخصي باسم",
        "RenameProfile": "تغيير اسم الملف الشخصي",
        "InvalidName": "اسم غير صالح. لا تستخدم هذه الرموز: {1}",
        "ButtonExists": "نموذج الزر '{1}' موجود بالفعل",
        "ProfileExists": "الملف الشخصي '{1}' موجود بالفعل",
        "Cancel": "إلغاء",
        "Overwrite": "استبدال",
        "Save": "حفظ",
        "ProfileSuccessRenamed": "تم تغيير اسم الملف الشخصي بنجاح",
        "ProfileSuccessfulyCreated": "تم إنشاء الملف الشخصي بنجاح",
        "ProfileExistsTitle": "الملف الشخصي موجود بالفعل",
        "ProfileSaveFailed": "فشل في حفظ الملف الشخصي",
        "ButtonSaved": "تم حفظ نموذج الزر بنجاح",
        "ButtonExistsTitle": "نموذج الزر موجود بالفعل",
        "ButtonSaveFailed": "فشل في حفظ النموذج",
        "Close": "إغلاق",
        "Browse": "تصفح",
        "Load": "تحميل...",
        "Create": "إنشاء",
        "Rename": "تغيير الاسم",
        "Delete": "حذف",
        "ButtonMissingName": "الاسم مفقود",
        "DeleteProfileTitle": "حذف الملف الشخصي",
        "DeleteCurrentProfileWarnning": "يتم حذف الملف الشخصي '{1}'. هل أنت متأكد؟ ملاحظة: هذا هو الملف الشخصي الحالي",
        "DeleteProfileWarnning": "يتم حذف الملف الشخصي '{1}'. هل أنت متأكد؟",
        "DeleteButtonTitle": "حذف نموذج الزر",
        "DeleteButtonWarnning": "سيتم حذف نموذج الزر '{1}'. هل أنت متأكد؟",
        "OpenIn": "فتح في {1}",
        "ListProfiles": "القائمة",
        "OK": "موافق",
        "SaveToList": "حفظ كنموذج",
        "LoadFromList": "النماذج",
        "LoadBtn": "تحميل",
        "EditButton": "تعديل",
        "DefaultProfile": "الملف الرئيسي",
        "ReservedName": "اسم محجوز",
        "ProfileNameTitle": "اسم الملف الشخصي",
        "ProfileEditNameTitle": "تعديل اسم الملف الشخصي",
        "OneAfterTheOther": "واحد بعد الآخر",
        "ResetButtons": "إعادة الضبط بعد {1} ثوانٍ",
        "NoResultsMsg": "لم يتم العثور على صور",
        "EditButtonTitle": "تعديل الزر",
        "ButtonBackgroundColor": "اللون",
        "SearchImage": "البحث عن صورة",
        "Gallery": "المعرض",
        "RemoveImage": "إزالة الصورة",
        "Name": "الاسم",
        "Appearance": "المظهر",
        "Voice": "الصوت",
        "OneAfterTheOtherBtn": "واحد بعد الآخر",
        "AllAtOnceBtn": "الكل معًا",
        "Backup": "نسخ احتياطي",
        "BackupAll": "نسخ احتياطي كامل",
        "ButtonsLayout": "ترتيب الأزرار",
        "ShareBackupWithTitle": "نسخ احتياطي",
        "ShareBackupEmailSubject": "ملف النسخ الاحتياطي",
        "ShareProfileWithTitle": "تصدير ملف شخصي",
        "ShareProfileEmailSubject": "ملف الملف الشخصي",
        "ShareSuccessful": "تم إرسال الملف بنجاح",
        "SavedSuccessful":"تم حفظ الملف بنجاح في مجلد التنزيلات",
        "ActionCancelled": "تم إلغاء العملية",
        "UnknownPackageType": "الملف غير متوافق",
        "ImportedProfiles": "الملفات الشخصية التي تم استيرادها",
        "SkippedProfiles": "الملفات الشخصية الموجودة (لم يتم استيرادها)",
        "NoteSkippedItems": "ملاحظة: إذا كنت تريد استبدال الملفات الشخصية المستوردة بالموجودة، احذف النسخ المحلية التي تحمل نفس الاسم قبل الاستيراد.",
        "ImportError": "فشل الاستيراد",
        "SuccessfulImport": "تم الاستيراد بنجاح",
        "AboutToOverwriteButton": "هل تريد حفظ زر الصوت الحالي قبل تحميل زر صوت من المكتبة؟",
        "SaveFirst": "احفظ ثم قم بالتحميل",
        "ContinueWithoutSave": "تحميل بدون حفظ",
        "AboutToOverwriteButtonTitle": "حفظ قبل الاستيراد من المكتبة",
        "EditImage": "تحرير الصورة",
        "EditImageTitle": "يمكنك التحريك وتغيير الحجم",
        "AboutToReloadSameButtonTitle": "إعادة تحميل نفس زر الصوت",
        "AboutToReloadSameButton": "سيؤدي تحميل نفس زر الصوت إلى استبدال التغييرات التي أُجريت على الزر في هذا الملف الشخصي. هل تريد المتابعة؟",
        "ProfileSaveAsTitle": "حفظ '{1}' باسم",
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