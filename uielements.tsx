import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import IconAnt from 'react-native-vector-icons/AntDesign';

import { isRTL } from "./lang";

export const BTN_COLOR = "#6E6E6E";

export function Spacer({ h, w, bc }: { h?: Number, w?: Number, bc?: string }) {
    return <View style={{ height: h, width: w, backgroundColor: bc }} />
}

export function ColorButton({ callback, color, size, icon, index, iconColor }: any) {
    let borderStyle = {}
    if (isTooWhite(color)) {
        borderStyle = { borderWidth: 1, borderColor: "gray" }
    }

    return <TouchableOpacity
        onPress={callback}
        activeOpacity={0.7}
        key={"" + index}
    >
        <View style={[{
            backgroundColor: color,
            borderRadius: size / 2,
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center'

        }, borderStyle]}
        >

            {icon && <Icon color={iconColor || "white"} size={size / 2} name={icon}></Icon>}
        </View>
    </TouchableOpacity>
}

export function getNumButtonsSelection(num: number, size: number) {
    const btnSize = (num == 1) ? size / 2 : size * .7 / 2
    return <RectView width={size} height={size}>
        {Array.from(Array(num).keys()).map((i: any) => (
            <View key={i} style={{ backgroundColor: "#2958af", borderRadius: btnSize / 2, width: btnSize, height: btnSize, margin: 5 }}>
            </View>
        ))}
    </RectView>
}

export function RectView({ children, width, height, buttonWidth, isLandscape }: any) {

    const space = buttonWidth / 3;
    console.log("rectview", height)
    return <View style={{
        flexDirection: "column",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        alignContent: "center",
        width,
        height: height < 450 ? 450 : height,

    }}>
        <View style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <View style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: !isLandscape && children.length < 3 ? "column" : (isRTL() ? "row-reverse" : "row") }}>
                {children[0]}
                {children.length > 1 && <Spacer w={space} h={space} />}
                {children.length > 1 && children[1]}
            </View>

            {children.length > 2 && <View style={{ flexDirection: (isRTL() ? "row-reverse" : "row") }}>
                {children[2]}
                {children.length > 3 && <Spacer w={space} h={space} />}
                {children.length > 3 && children[3]}
            </View>}

        </View>
    </View >

}




export function isTooWhite(color: string) {
    try {
        const limit = 210;
        const bigint = parseInt(color.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        return (r > limit && g > limit && b > limit);
    } catch (e) {
    }
    return false;
}
export function IconButton({ icon, onPress, text }: { icon: string, text: string, onPress: () => void }) {

    return <TouchableOpacity style={[styles.iconButton, { flexDirection: isRTL() ? "row" : "row-reverse" }]} onPress={onPress} >
        <Text allowFontScaling={false} style={{ fontSize: 22, marginInlineStart: 5, marginInlineEnd:5 }}>{text}</Text>
        <IconAnt name={icon} style={{ fontSize: 30, color: BTN_COLOR }} />
    </TouchableOpacity>
}


const styles = StyleSheet.create({

    iconButton: {
        
        marginInlineEnd: 10,
        maxHeight:39,
        alignItems: "center",
        justifyContent: "flex-end",
        borderColor: "gray",
        borderStyle: "solid",
        borderWidth: 1,
        padding: 4,
        borderRadius: 10,
    }
});