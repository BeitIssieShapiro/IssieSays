import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { isRTL } from "../lang";
import { IconProps, MyIcon } from "./icons";

// export function IconButton({ icon, onPress, text }: { icon?: string, text: string, onPress: () => void }) {

//     return <TouchableOpacity style={[styles.iconButton, { flexDirection: isRTL() ? "row" : "row-reverse", justifyContent: "center" }]} onPress={onPress} >
//         <Text allowFontScaling={false} style={{ fontSize: 22, marginInlineStart: 5, marginInlineEnd: 5 }}>{text}</Text>
//         {icon && <MyIcon info={{ type: "AntDesign", size: 30, name: icon }} />}
//     </TouchableOpacity>
// }


export function IconButton({ icon, onPress, text, backgroundColor }:
    { icon?: IconProps, text?: string, backgroundColor?: string, onPress: () => void, type?: undefined | "Ionicon" | "MCI" }) {

    return <TouchableOpacity style={
        [styles.iconButton, { flexDirection: "row", direction: isRTL() ? "rtl" : "ltr" },
        backgroundColor && { backgroundColor },
        !text && { borderWidth: 0, padding: 0, maxWidth: styles.iconButton.maxHeight }]} onPress={onPress} >

        {icon && <MyIcon info={icon} />}
        {!!text && <Text allowFontScaling={false} style={{ fontSize: 22, marginInlineStart: 5, marginInlineEnd: 5, textAlign: icon ? "left" : "center" }}>{text}</Text>}
    </TouchableOpacity >
}


const styles = StyleSheet.create({

    iconButton: {
        alignItems: "center",
        justifyContent: "center",
        margin: 10,
        paddingLeft: 10,
        paddingRight: 10,

        maxHeight: 40,
        minHeight: 40,
        minWidth: 39,
        borderColor: "gray",
        borderStyle: "solid",
        borderWidth: 1,
        padding: 2,
        borderRadius: 20,
    },

});
