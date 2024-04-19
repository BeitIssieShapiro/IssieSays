import { TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';


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

export function RectView({ children, width, height }: any) {
    const isFour = Array.isArray(children) && children.length === 4;
    return <View style={{
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-around",
        alignContent: "center",
        width,
        height,

    }}>
        {isFour ?
            <View style={{ flexDirection: "column" }}>
                <View style={{ flexDirection: "row" }}>
                    {children[0]}
                    <Spacer w={width / 10} />
                    {children[1]}
                </View>

                <View style={{ flexDirection: "row" }}>
                    {children[2]}
                    <Spacer w={width / 10} />
                    {children[3]}
                </View>
            </View>
            : children}
    </View>

}




export function isTooWhite(color: string) {
    try {
        const limit = 210;
        let borderStyle = {};
        const bigint = parseInt(color.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        return (r > limit && g > limit && b > limit);
    } catch (e) {
    }
    return false;
}