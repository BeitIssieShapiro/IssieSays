import { TouchableOpacity, Text, StyleSheet, Pressable } from "react-native";
import { isRTL } from "../lang";
import { IconProps, IconType, MyIcon } from "./icons";
import { gStyles } from "./common-style";

// export function IconButton({ icon, onPress, text }: { icon?: string, text: string, onPress: () => void }) {

//     return <TouchableOpacity style={[styles.iconButton, { flexDirection: isRTL() ? "row" : "row-reverse", justifyContent: "center" }]} onPress={onPress} >
//         <Text allowFontScaling={false} style={{ fontSize: 22, marginInlineStart: 5, marginInlineEnd: 5 }}>{text}</Text>
//         {icon && <MyIcon info={{ type: "AntDesign", size: 30, name: icon }} />}
//     </TouchableOpacity>
// }


export function IconButton({ icon, onPress, text, backgroundColor, borderWidth }:
    { icon?: IconProps, text?: string, backgroundColor?: string, onPress: () => void, type?: undefined | "Ionicon" | "MCI", borderWidth?: number }) {

    return <TouchableOpacity style={
        [styles.iconButton, { flexDirection: "row", direction: isRTL() ? "rtl" : "ltr" },
        backgroundColor && { backgroundColor },
        !text && { borderWidth: 0, padding: 0, maxWidth: styles.iconButton.maxHeight },
        borderWidth != undefined && { borderWidth }
        ]} onPress={onPress} >

        {icon && <MyIcon info={icon} />}
        {!!text && <Text allowFontScaling={false} style={{ fontSize: 22, marginInlineStart: 5, marginInlineEnd: 5, textAlign: icon ? "left" : "center" }}>{text}</Text>}
    </TouchableOpacity >
}

export function LabeledIconButton({ type, icon, label, onPress, size = 40, color = "black" }:
    {
        type?: IconType,
        icon: string,
        label: string,
        onPress: () => void,
        size?: number,
        color?: string,
    }) {

    return <Pressable onPress={onPress} style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", width: size * 3 }}>
        <MyIcon info={{ type, name: icon, size, color }} />
        <Text allowFontScaling={false} style={gStyles.labeledIconText}>{label}</Text>
    </Pressable>
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
