import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, gStyles } from "./common/common-style";
import { IconButton, LabeledIconButton } from "./common/components";
import { fTranslate, isRTL, translate } from "./lang";
import { MainButton, Spacer } from "./uielements";
import { AlreadyExists, Button, deleteButton, Folders, InvalidCharachters, InvalidFileName, loadButton2, saveButton, saveButton2 } from "./profile";
import { SearchImage, SelectFromGallery } from "./search-image";
import { RecordButton } from "./recording";
import { Checkbox } from "./common/check-box";
import { MyColorPicker } from "./color-picker";
import { ButtonPicker } from "./profile-picker";
import Toast from "react-native-toast-message";


interface EditButtonProps {
    onClose: () => void;
    isNarrow: boolean;
    button: Button;
    onDone: (editedButton: Button) => void;
    index: number;
    windowSize: { width: number, height: number }
}

export type EditedButton = Button & {
    audioName?: string;
};

export function EditButton({ onClose, isNarrow, button, onDone, index, windowSize }: EditButtonProps) {
    const safeAreaInsets = useSafeAreaInsets();

    const [localButton, setLocalButton] = useState<EditedButton>({ ...button });
    const [colorPickerOpen, setColorPickerOpen] = useState<boolean>(false);
    const [imageSearchOpen, setImageSearchOpen] = useState<boolean>(false);
    const [openLoadButton, setOpenLoadButton] = useState<boolean>(false);

    const updateButton = (updates: Partial<EditedButton>) => {
        setLocalButton(prev => ({ ...prev, ...updates }));
    };

    const colorWidth = Math.min(windowSize.width, windowSize.height);
    const isLandscape = windowSize.height < windowSize.width;

    const handleButtonDelete = async (name: string, afterDelete: () => void, force = false) => {

        if (!force) {
            Alert.alert(translate("DeleteButtonTitle"), fTranslate("DeleteButtonWarnning", name), [
                { text: translate("Cancel"), style: "cancel" },
                { text: translate("Delete"), style: "destructive", onPress: () => handleButtonDelete(name, afterDelete, true) }
            ]);
            return;
        }

        await deleteButton(name);
        afterDelete();
    }


    const handleSaveButton = (btn: EditedButton, index: number) => {
        if (!btn.name || btn.name.trim().length == 0) {
            Alert.alert(translate("ButtonMissingName"), "", [{ text: translate("OK") }]);
            return;
        }
        saveButton2(btn, index)
            .then(() => {
                Toast.show({
                    autoHide: true,
                    type: 'success',
                    text1: translate("ButtonSaved")
                });
            })
            .catch(err => {
                if (err instanceof AlreadyExists) {
                    Alert.alert(translate("ButtonExistsTitle"), fTranslate("ButtonExists", btn.name),
                        [
                            {
                                text: translate("Overwrite"), onPress: () => {
                                    saveButton2(btn, index, true)
                                        .then(() => {
                                            Toast.show({
                                                // autoHide: true,
                                                type: 'success',
                                                text1: translate("ButtonSaved")
                                            });
                                        })
                                }
                            },
                            { text: translate("Cancel") }
                        ])
                } else if (err instanceof InvalidFileName) {
                    Alert.alert(fTranslate("InvalidName", InvalidCharachters));
                } else {
                    Toast.show({
                        autoHide: true,
                        type: 'error',
                        text1: translate(translate("ButtonSaveFailed"))
                    })
                }
            })
    }

    const preview = <View>
        <Spacer h={20} />
        <MainButton
            name={localButton.name}
            fontSize={22}
            showName={localButton.showName}
            width={180}
            raisedLevel={10}
            color={localButton.color}
            imageUrl={localButton.imageUrl}
            appBackground={"white"}
            showProgress={false}
            recName={""}
        />
        {localButton.showName || <Spacer h={26} />}
        <Spacer h={20} />
    </View>

    const txtEdit = <View style={styles.section}>
        <Text allowFontScaling={false} style={styles.label}>{translate("Name")}</Text>
        <View>
            <TextInput
                style={[
                    styles.input,
                ]}

                placeholderTextColor="gray"
                defaultValue={localButton.name}
                autoCapitalize="none"
                autoCorrect={false}

                onChangeText={(newText) => {
                    updateButton({ name: newText })
                }}
                autoFocus
                allowFontScaling={false}
            />
            <Spacer h={15} />
            <Checkbox
                size={30}
                caption={translate("ShowName")}
                checked={localButton.showName}
                onToggle={() => updateButton({ showName: !localButton.showName })}
            />
        </View>
    </View>;




    return (
        <View style={[gStyles.screenContainer, { top: safeAreaInsets.top, direction: isRTL() ? "rtl" : "ltr" }]}>
            {/* Header */}
            <View style={[gStyles.screenTitle, { justifyContent: "center" }, isNarrow && { height: 140 }]}>
                <Text allowFontScaling={false} style={gStyles.screenTitleText}>
                    {translate("EditButtonTitle")}
                </Text>
                <View style={[styles.buttons, isNarrow && { bottom: -5, left: 10, alignItems: "center" }]}>
                    <IconButton
                        text={translate("Save")}
                        onPress={() => onDone(localButton)}
                        backgroundColor={colors.titleButtonsBG}
                        icon={{ name: "check" }}
                    />
                    <IconButton
                        text={translate("Cancel")}
                        onPress={onClose}
                        backgroundColor={colors.titleButtonsBG}
                        icon={{ name: "close" }}
                    />
                </View>
            </View>


            {colorPickerOpen && <MyColorPicker
                open={colorPickerOpen}
                title={localButton.name}
                top={100}
                height={250}
                width={colorWidth}
                color={localButton.color}
                isScreenNarrow={isNarrow}
                onSelect={(color: string) => {
                    updateButton({ color });
                    setColorPickerOpen(false);
                }}
                onClose={() => setColorPickerOpen(false)}
                onHeightChanged={(height: number) => {
                }}
                maxHeight={500} />
            }
            <SearchImage open={imageSearchOpen} onClose={() => setImageSearchOpen(false)}
                onSelectImage={(url: string) => {
                    updateButton({ imageUrl: url })
                    setImageSearchOpen(false);
                }}
                isScreenNarrow={isNarrow}
            />
            <ButtonPicker
                folder={Folders.Buttons}
                open={openLoadButton}
                height={windowSize.height * .6}
                onSelect={async (buttonName: string) => {
                    console.log("selected button", buttonName)
                    if (openLoadButton) {
                        setOpenLoadButton(false);
                        const loadedBtn = await loadButton2(buttonName);
                        updateButton(loadedBtn);
                    }
                }}
                onClose={() => setOpenLoadButton(false)}
                onDelete={handleButtonDelete}

            />


            {/* Preview */}
            <View style={[styles.row, { justifyContent: isLandscape ? "space-around" : "center" }]}>
                {isLandscape && txtEdit}
                {isLandscape && <View style={gStyles.verticalSeperator} />}
                {preview}
            </View>

            <View style={gStyles.horizontalSeperator} />

            {!isLandscape && txtEdit}
            {!isLandscape && <View style={gStyles.horizontalSeperator} />}

            {/* Appearance */}
            <View style={styles.section}>
                <Text allowFontScaling={false} style={styles.label}>{translate("Appearance")}</Text>
                <View style={styles.row}>
                    <LabeledIconButton
                        type="MDI"
                        icon="palette-outline"
                        label={translate("ButtonBackgroundColor")}
                        color={colors.defaultIconColor}
                        onPress={() => setColorPickerOpen(true)}
                        size={50}
                    />
                    <Spacer w={25} />
                    <LabeledIconButton
                        type="MDI"
                        icon="image-search-outline"
                        label={translate("SearchImage")}
                        color={colors.defaultIconColor}
                        onPress={() => setImageSearchOpen(true)}
                        size={50}
                    />
                    <Spacer w={25} />
                    <LabeledIconButton
                        type="MDI"
                        icon="view-gallery-outline"
                        label={translate("Gallery")}
                        color={colors.defaultIconColor}
                        onPress={async () => {
                            const url = await SelectFromGallery();
                            if (url) updateButton({ imageUrl: url });
                        }}
                        size={50}
                    />
                    <Spacer w={25} />
                    <LabeledIconButton
                        type="MDI"
                        icon="close"
                        label={translate("RemoveImage")}
                        color={"red"}
                        onPress={() => updateButton({ imageUrl: "" })}
                        size={50}
                    />
                </View>
            </View>

            <View style={gStyles.horizontalSeperator} />

            {/* Text and Voice */}
            <View style={styles.section}>
                <Text allowFontScaling={false} style={styles.label}>{translate("Voice")}</Text>

                <RecordButton
                    onSave={(tmpName) => {
                        updateButton({ audioName: tmpName })
                    }}
                    name={localButton.audioName != undefined ? localButton.audioName : index + ""}
                    backgroundColor={"#013D76"}
                    size={50}
                    height={60}
                    revision={0}
                />
            </View>
            <View style={gStyles.horizontalSeperator} />
            <Spacer h={10} />
            <View style={styles.row}>
                <IconButton text={translate("LoadFromList")} icon={{ name: "list", type: "Ionicons" }} onPress={() => setOpenLoadButton(true)} />
                <IconButton text={translate("SaveToList")} onPress={() => handleSaveButton(localButton, index)} icon={{ name: "save" }} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    buttons: {
        position: "absolute",
        right: 10,
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
    },
    section: {
        marginVertical: 20,
        paddingHorizontal: 20,
        justifyContent: "center",
        alignItems: "center"
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10,
        color: "#000000",
    },
    label: {
        fontSize: 24,
        fontWeight: "bold",
        margin: 10,
    },
    input: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        textAlign: "right",
        width: 400,
        fontSize: 24,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
    },
    nameInput: {
        flex: 1,
        fontSize: 20,
        borderBottomWidth: 1,
        borderColor: "#ccc",
        padding: 8,
        textAlign: "right",
    },
});