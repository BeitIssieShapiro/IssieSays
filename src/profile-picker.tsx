import { Fragment, useEffect, useState } from "react";
import { Folders, ListElements } from "./profile";
import FadeInView from "./FadeInView";
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { isRTL, translate } from "./lang";
//import Icon from 'react-native-vector-icons/AntDesign';
import { MyCloseIcon } from "./common/icons";
import { colors, gStyles, menuActionIcon } from "./common/common-style";
import { RadioButton } from "./common/radio-button";
import { IconButton } from "./common/components";

export const DefaultProfileName = "DefaultProfile";


function Seperator({ width }: { width: string }) {
    return <View
        // @ts-ignore
        style={{
            width,
            marginTop: 4,
            borderBottomColor: 'gray',
            borderBottomWidth: 1,
        }}
    />
}



interface ButtonInfo {
    name?: string;
    icon?: string;
    type?: "MCI" | "Ionicon";
}


interface ProfilePickerProps {
    open: boolean;
    currentProfile: string;
    loadButton: ButtonInfo;
    editButton?: ButtonInfo;
    exportButton?: ButtonInfo;
    height: number | string;
    onClose: () => void;
    onSelect: (item: string) => void;
    exclude?: string;
    folder: Folders
    onDelete?: (name: string, afterDelete: () => void) => void;
    onEdit?: (name: string, afterSave: () => void) => void;
    onCreate?: () => void;
    onExport?: (name: string) => void;
    isNarrow?: boolean;
}

interface ProfileItem {
    key: string;
    name: string;
}

export function ProfilePicker({ open, height, onClose, onSelect, exclude, folder, onDelete, onEdit, onCreate,
    isNarrow,
    currentProfile,
    onExport }: ProfilePickerProps) {
    const [list, setList] = useState<ProfileItem[]>([]);
    const [revision, setRevision] = useState<number>(0);
    console.log("prof Picker", currentProfile)
    useEffect(() => {
        if (open) {
            ListElements(folder).then(list => {
                setList(list.filter(l => !exclude || l != exclude).map(l => {
                    return {
                        key: l,
                        name: l == DefaultProfileName ? translate(l) : l,
                    }
                }));
            })
        }
    }, [open, exclude, revision]);

    const create = onCreate && <IconButton icon={{ name: "plus", color: colors.titleBlue }} onPress={() => onCreate()} text={translate("Create")} />
    return <FadeInView height={open ? height : 0} style={[gStyles.pickerView]} onClose={onClose}>
        <View style={[gStyles.pickerTitleHost, { direction: isRTL() ? "rtl" : "ltr" }]}>
            <Text allowFontScaling={false} style={gStyles.pickerTitleText} >{
                translate("SelectProfileTitle")
            }</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                {!isNarrow && create}
                <MyCloseIcon onClose={onClose} />
            </View>
        </View>
        {isNarrow && <View style={{}} >{create}</View>}

        <View style={gStyles.horizontalSeperator} />

        {!list || list.length == 0 ?
            <Text allowFontScaling={false} style={{ fontSize: 25, margin: 25 }}>{translate("NoItemsFound")}</Text> :
            <ScrollView
                style={{ width: "100%" }}
                contentContainerStyle={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                }}
            >
                {list.map(item => (
                    <View key={item.key} style={[styles.itemRow, { direction: isRTL() ? "rtl" : "ltr" }]}>
                        <Pressable
                            style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                            onPress={() => onSelect(item.key)}
                        >
                            <RadioButton selected={currentProfile == item.key} />
                            <Text
                                allowFontScaling={false}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={{
                                    fontSize: 22,
                                    paddingHorizontal: 10,
                                    color: currentProfile == item.key ? colors.titleBlue : "black",
                                }}
                            >
                                {item.name}
                            </Text>
                        </Pressable>

                        {item.key !== DefaultProfileName && (
                            <View style={{ flexDirection: "row" }}>
                                {onDelete && (
                                    <IconButton
                                        icon={{ name: "delete", ...menuActionIcon }}
                                        onPress={() => onDelete(item.key, () => setRevision(prev => prev + 1))}
                                    />
                                )}
                                {onEdit && (
                                    <IconButton
                                        icon={{ name: "edit", ...menuActionIcon }}
                                        onPress={() => onEdit(item.key, () => setRevision(prev => prev + 1))}
                                    />
                                )}
                                {onExport && (
                                    <IconButton
                                        icon={{ name: "share-social-outline", type: "Ionicons", ...menuActionIcon }}
                                        onPress={() => onExport(item.key)}
                                    />
                                )}
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        }
    </FadeInView>
}



interface ButtonPickerProps {
    open: boolean;
    height: number | string;
    onClose: () => void;
    onSelect: (item: string) => void;
    exclude?: string;
    folder: Folders
    onDelete?: (name: string, afterDelete: () => void) => void;
    onEdit?: (name: string, afterSave: () => void) => void;

}
export function ButtonPicker({ open, height, onClose, onSelect, exclude, folder, onDelete, onEdit }: ButtonPickerProps) {
    const [profiles, setProfiles] = useState<string[]>([]);
    const [revision, setRevision] = useState<number>(0);

    useEffect(() => {
        if (open) {
            ListElements(folder).then(list => {
                setProfiles(list.filter(l => !exclude || l != exclude));
            })
        }
    }, [open, exclude, revision]);


    return <FadeInView height={open ? height : 0}
        style={[styles.pickerView, { bottom: 0, left: 0, right: 0 }]}>
        <Text allowFontScaling={false} style={{ fontSize: 28, margin: 25 }}>{
            folder == Folders.Profiles ?
                translate("SelectProfileTitle") : translate("SelectButtonTitle")
        }</Text>
        <Seperator width="100%" />
        <View style={styles.closeButton}>
            <MyCloseIcon onClose={onClose} />

        </View>
        {!profiles || profiles.length == 0 ?
            <Text allowFontScaling={false} style={{ fontSize: 25, margin: 25 }}>{translate("NoItemsFound")}</Text> :
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 40,
                }}
            >
                {profiles.map(pName => (
                    <Fragment key={pName}>
                        <View
                            style={styles.itemRow}
                        >
                            <Text
                                allowFontScaling={false}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={styles.itemText}
                            >
                                {pName}
                            </Text>

                            <View style={styles.actionRow}>
                                <IconButton
                                    icon={{ name: "upload", ...menuActionIcon }}
                                    onPress={() => onSelect(pName)}
                                    text={translate("LoadBtn")}
                                />
                                {onDelete && (
                                    <IconButton
                                        icon={{ name: "delete", ...menuActionIcon }}
                                        onPress={() => onDelete(pName, () => setRevision(prev => prev + 1))}
                                        text={translate("Delete")}
                                    />
                                )}
                                {onEdit && (
                                    <IconButton
                                        icon={{ name: "edit", ...menuActionIcon }}
                                        onPress={() => onEdit(pName, () => setRevision(prev => prev + 1))}
                                        text={translate("Rename")}
                                    />
                                )}
                            </View>
                        </View>

                        <View style={styles.separator} />
                    </Fragment>
                ))}
            </ScrollView>
        }
    </FadeInView>
}

const styles = StyleSheet.create({
    closeButton: {
        position: "absolute",
        right: 10,
        top: 10,
        zIndex: 100
    },
    itemHost: {
        width: "100%",
        paddingVertical: 10,
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        paddingVertical: 10,
        borderBottomColor: "#ddd",
        borderBottomWidth: 1,
    },
    pickerView: {
        flexDirection: 'column',
        position: 'absolute',
        //backgroundColor: '#EBEBEB',
        backgroundColor: "white",
        zIndex: 99999,
        left: 0,
        borderColor: 'gray',
        borderBottomColor: "transparent",
        borderWidth: 1,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 2,
        alignItems: 'center',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.35,
        shadowRadius: 3.84,
    },
    listItem: {
        paddingLeft: "10%",
        paddingRight: "10%",
        flex: 1,
    },
    listHost: {
        padding: 20,
        width: "100%",
    },
    itemText: {
        flex: 1,
        fontSize: 26,
        paddingHorizontal: 10,
        textAlign: "left",
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5, // RN 0.71+ supports gap
    },
    separator: {
        height: 1,
        backgroundColor: "#ddd",
        width: "100%",
    },
});