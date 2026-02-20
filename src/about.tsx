import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenTitle } from "./common/settings-elements";
import { colors, gStyles } from "./common/common-style";
import { gCurrentLang, strings, translate } from "./lang";

const languages = [
    { code: "he", label: "עברית", dir: "rtl" as const },
    { code: "en", label: "English", dir: "ltr" as const },
    { code: "ar", label: "العربية", dir: "rtl" as const },
];

const paragraphKeys = ["AboutP1", "AboutP2", "AboutP3", "AboutP4"];

export function About({ onClose }: { onClose: () => void }) {
    const [lang, setLang] = useState(gCurrentLang);
    const currentLang = languages.find(l => l.code === lang) || languages[1];
    const safeAreaInsets = useSafeAreaInsets();

    return (
        <View style={[gStyles.screenContainer, { top: safeAreaInsets.top }]}>
            <ScreenTitle
                title={translate("About")}
                onClose={onClose}
                icon={{ name: "close", type: "MDI", size: 30, color: colors.titleBlue }}
            />

            {/* Language toggle */}
            <View style={styles.toggleRow}>
                {languages.map(l => (
                    <TouchableOpacity
                        key={l.code}
                        style={[
                            styles.toggleButton,
                            lang === l.code && styles.toggleButtonActive,
                        ]}
                        onPress={() => setLang(l.code)}
                    >
                        <Text
                            allowFontScaling={false}
                            style={[
                                styles.toggleText,
                                lang === l.code && styles.toggleTextActive,
                            ]}
                        >
                            {l.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {paragraphKeys.map(key => (
                    <Text
                        key={key}
                        style={[
                            styles.paragraph,
                            { writingDirection: currentLang.dir },
                        ]}
                    >
                        {strings[lang]?.[key] || key}
                    </Text>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    toggleRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: "white",
    },
    toggleButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.titleBlue,
    },
    toggleButtonActive: {
        backgroundColor: colors.titleBlue,
    },
    toggleText: {
        fontSize: 18,
        color: colors.titleBlue,
    },
    toggleTextActive: {
        color: "white",
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 20,
    },
    paragraph: {
        fontSize: 22,
        lineHeight: 34,
        marginBottom: 16,
        color: "#333",
    },
});
