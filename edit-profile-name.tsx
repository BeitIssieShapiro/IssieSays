

import { useEffect, useState } from "react";
import { AlreadyExists, readCurrentProfile, renameProfile, SaveProfile, verifyProfileNameFree } from "./profile";
import FadeInView from "./FadeInView";
import { Alert, Button, Settings, StyleSheet, Text, TextInput, View } from "react-native";
import { isRTL, translate } from "./lang";
import Icon from 'react-native-vector-icons/AntDesign';
import { CURRENT_PROFILE, getSetting } from "./settings";

interface NamePickerProps {
    open: boolean;
    height: number;
    onClose: () => void
}

export function NameEditor({ open, height, onClose }: NamePickerProps) {
    const [name, setName] = useState<string>(getSetting(CURRENT_PROFILE.name, ""));

    useEffect(() => {
        if (open) {
            setName(getSetting(CURRENT_PROFILE.name, ""));
        }
    }, [open])

    const isRename = getSetting(CURRENT_PROFILE.name, "") != "";

    return <FadeInView height={open ? height : 0}
        style={[styles.pickerView, { bottom: 0, left: 0, right: 0 }]}>
        <Text allowFontScaling={false} style={{ fontSize: 25, margin: 25 }}>{isRename ? translate("RenameProfile") : translate("SetProfileName")}</Text>
        <View style={styles.closeButton}>
            <Icon name="close" size={45} onPress={onClose} />
        </View>
        <TextInput
            allowFontScaling={false}
            autoFocus={true}
            style={{
                width: "75%",
                marginStart: 5,
                fontSize: 30,
                textAlign: isRTL() ? "right" : "left",
                backgroundColor: "lightgray",
                direction: isRTL() ? "rtl" : "ltr",
            }}
            onChange={(e) => setName(e.nativeEvent.text)}
            value={name}
        >
        </TextInput>
        <View style={{ flexDirection: "row" }}>
            <Button onPress={() => {
                // todo validate name
                const previousName = getSetting(CURRENT_PROFILE.name, "");
                let promise
                if (previousName == "") {
                    // new profile
                    // const p = readCurrentProfile();
                    promise = verifyProfileNameFree(name);
                    Settings.set({ [CURRENT_PROFILE.name]: name });
                } else {
                    // rename profile
                    promise = renameProfile(previousName, name);
                }

                promise.then(() => {
                    Settings.set({ [CURRENT_PROFILE.name]: name });
                    Alert.alert(translate("SaveSuccess"))
                    onClose()
                })
                .catch((err) => {
                    if (err instanceof AlreadyExists) {
                        // todo overwrite
                    } else {
                        Alert.alert(translate("SaveFailed"), err.message);
                    }
                });
            }} title={translate("Save")} />
            <Button onPress={onClose} title={translate("Cancel")} />
        </View>
    </FadeInView>
}

const styles = StyleSheet.create({
    closeButton: {
        position: "absolute",
        right: 10,
        top: "4%",
        zIndex: 100
    },
    pickerView: {
        flexDirection: 'column',
        position: 'absolute',
        backgroundColor: '#FAFAFA',
        zIndex: 99999,
        left: 0,
        borderColor: 'gray',
        borderBottomColor: "transparent",
        borderWidth: 1,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 2,
        alignItems: 'center',
    }
});


