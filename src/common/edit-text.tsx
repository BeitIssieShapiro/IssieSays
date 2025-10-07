import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
} from "react-native";
import { IconButton } from "./components";
import { translate } from "../lang";


interface EditTextProps {
    label: string;
    initialText: string;
    onDone: (txt: string) => void;
    onClose: () => void;
    width: number;
    textWidth: number;
    textHeight: number;
    windowSize: { width: number, height: number };

}

export const EditText: React.FC<EditTextProps> = ({
    label, initialText,
    onDone, onClose, width, textWidth, textHeight, windowSize
}) => {
    const [text, setText] = useState(initialText);
    const top = windowSize.height < 400 ? 0 : "12%";

    return (
        <View style={[StyleSheet.absoluteFill, styles.overlay, { zIndex: 999999 }, { top }]}>
            <View style={[styles.container, { width: width || "90%" }]}>
                {/* Editable Text Input */}
                <View style={{ flexDirection: "column", alignItems: "center", }}>
                    <Text allowFontScaling={false} style={styles.label}>{label}</Text>

                    <TextInput
                        style={[
                            styles.input,
                            { width: textWidth, height: textHeight },

                            { fontSize: 25, color: "black", fontWeight: "normal" },

                        ]}
                        placeholderTextColor="gray"
                        defaultValue={text}
                        autoCapitalize="none"
                        autoCorrect={false}

                        onChangeText={(newText) => {
                            setText(newText);
                        }}
                        autoFocus
                        allowFontScaling={false}
                    />
                </View>


                <View style={styles.buttonRow}>
                    <IconButton text={translate("OK")} icon={{ name: "check" }} onPress={() => {
                        onDone(text)
                    }} />
                    <IconButton text={translate("Cancel")} icon={{ name: "close" }} onPress={onClose} />
                </View>
            </View>
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    overlay: {
        alignItems: "center",
        zIndex: 1200,
        shadowColor: '#171717',
        shadowOffset: { width: 3, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 7,
    },
    container: {
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        backgroundColor: "white",
    },
    label: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 10,
    },
    input: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        textAlign: "center",
    },
    toggleButton: {
        marginVertical: 10,
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "center",
        width: "100%",
        marginTop: 20,
    },
    button: {
        padding: 10,
        backgroundColor: "#ddd",
        borderRadius: 5,
        width: 150,
        alignItems: "center",
    },
    picker: {
        height: 50,
        // backgroundColor: "green",
        width: '100%',
        zIndex: 1900
    },
});