import { Fragment, useEffect, useState } from "react";
import { Folders, ListElements } from "./profile";
import FadeInView from "./FadeInView";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { isRTL, translate } from "./lang";
import Icon from 'react-native-vector-icons/AntDesign';


function Seperator() {
    return <View
        style={{
            width:"100%",
            marginTop: 4,
            borderBottomColor: 'gray',
            borderBottomWidth: 1,
        }}
    />
}

interface ProfilePickerProps {
    open: boolean;
    height: number | string;
    onClose: () => void;
    onSelect: (item: string) => void;
    exclude?: string;
    folder: Folders
}

export function ProfilePicker({ open, height, onClose, onSelect, exclude, folder }: ProfilePickerProps) {
    const [profiles, setProfiles] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
            ListElements(folder).then(list => {
                setProfiles(list.filter(l => !exclude || l != exclude));
            })
        }
    }, [open, exclude])


    return <FadeInView height={open ? height : 0}
        style={[styles.pickerView, { bottom: 0, left: 0, right: 0 }]}>
        <Text allowFontScaling={false} style={{ fontSize: 28, margin: 25 }}>{
            folder == Folders.Profiles ?
                translate("SelectProfileTitle") : translate("SelectButtonTitle")
        }</Text>
        <Seperator/>
        <View style={styles.closeButton}>
            <Icon name="close" size={45} onPress={onClose} />
        </View>
        {!profiles || profiles.length == 0 ?
            <Text allowFontScaling={false}>{translate("NoItemsFound")}</Text> :
            <ScrollView style={styles.listHost}>
                {profiles.map(pName => (
                    <Fragment key={pName}>
                        <TouchableOpacity style={styles.listItem} key={pName} onPress={() => onSelect(pName)}>
                            <Text allowFontScaling={false} style={{
                                textAlign: (isRTL() ? "right" : "left"),
                                fontSize: 28, paddingLeft: 30, paddingRight: 30
                            }}>{pName}</Text>
                        </TouchableOpacity>
                        <Seperator />
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
    },
    listItem: {
        width: "100%",
        paddingLeft: "10%",
        paddingRight: "10%",
    },
    listHost: {
        padding:20,
        width: "100%",
    }
});