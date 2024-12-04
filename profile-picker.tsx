import { useEffect, useState } from "react";
import { ListProfiles, LoadProfile } from "./profile";
import FadeInView from "./FadeInView";
import { StyleSheet, Text, Touchable, TouchableOpacity, View } from "react-native";
import { translate } from "./lang";
import Icon from 'react-native-vector-icons/AntDesign';

interface ProfilePickerProps {
    open: boolean;
    height: number;
    onClose: (reload:boolean) => void;
    exclude: string;
}

export function ProfilePicker({ open, height, onClose, exclude }: ProfilePickerProps) {
    const [profiles, setProfiles] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
            ListProfiles().then((list) => {
                setProfiles(list.filter(l=>l != exclude));
            })
        }
    }, [open, exclude])

    console.log("profiles", profiles)

    return <FadeInView height={open ? height : 0}
        style={[styles.pickerView, { bottom: 0, left: 0, right: 0 }]}>
        <Text allowFontScaling={false} style={{ fontSize: 25, margin: 25 }}>{translate("Profiles")}</Text>
        <View style={styles.closeButton}>
            <Icon name="close" size={45} onPress={()=>onClose(false)} />
        </View>
        {!profiles || profiles.length == 0 ?
            <Text>{translate("NoProfiles")}</Text> :
            profiles.map(pName => (
                <TouchableOpacity  key={pName} onPress={async ()=>{
                    await LoadProfile(pName);
                    onClose(true);
                }}>
                <Text>{pName}</Text>
                </TouchableOpacity>
            ))}
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