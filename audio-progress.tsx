import { View } from "react-native";

const baseColor = "lightgray";
const filledColor = "green";

export function AudioWaveForm({height, color, progress, infiniteProgress}:any) {
    const wave = [15, 30, 15, 15, 30, 15, 15, 30, 15, 15, 30, 15];

    return <View style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        maxHeight: height || 100,
        minHeight:height || 100,
    }}>
        {wave.map((w, i) => (<View key={i}
            style={{
                height: w,
                width: 7,
                backgroundColor: progress > 0 ?
                    (wave.length * progress > i ? color || filledColor : baseColor) :
                    infiniteProgress > 0 ?
                        infiniteProgress % wave.length == i ? color || filledColor : baseColor :
                        baseColor,
                marginLeft: 5,
                marginRight: 5,
                borderRadius: 2,
            }}
        />))}
    </View>
}