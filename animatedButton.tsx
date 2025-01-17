import { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import Icon from 'react-native-vector-icons/AntDesign';
import { INSTALL } from "./settings";
import { Settings } from "./setting-storage";
import { fTranslate } from "./lang";

export function AnimatedButton({ duration, icon, onPress, size, color }: any) {
    const [progress, setProgress] = useState(false);
    const [openIn, setOpenIn] = useState<number>(0)
    const interval = useRef<NodeJS.Timeout | undefined>(undefined);
    const ignoreDelay = Settings.getBoolean(INSTALL.firstTimeSettings, true);
    console.log("first time settings?", ignoreDelay)


    if (duration === 0 || ignoreDelay)
        return <Icon size={size} name={icon} color={color} onPress={() => onPress()} />;
    console.log("setting button color", color)
    return (<TouchableOpacity activeOpacity={1} style={{
        flexDirection: "row",
        zIndex: 1000, width: size * 1.2, height: size * 1.2, alignItems: "center", justifyContent: "center"
    }}
        delayLongPress={duration}
        onLongPress={() => {
            setProgress(false);
            if (interval.current) {
                clearInterval(interval.current);
                interval.current = undefined
            }
            onPress()
        }}
        onPressIn={() => {
            if (duration > 0) {
                setProgress(true);
                setOpenIn(Math.floor(duration/1000));
                if (interval.current) {
                    clearInterval(interval.current);
                }
                interval.current = setInterval(() => setOpenIn(prev => prev - 1), 1000);
            }
        }}
        onPressOut={() => {
            setProgress(false)
            if (interval.current) {
                clearInterval(interval.current);
                interval.current = undefined
            }
        }}

    >
        {progress && <AnimatedCircularProgress
            style={{ position: "absolute", top: 0, left: 0, width: size, height: size }}
            duration={duration}
            rotation={0}
            size={size * 1.2}
            width={7}
            fill={100}
            tintColor={color == "black" ? "white" : "black"}
            onAnimationComplete={() => console.log('onAnimationComplete')}
            backgroundColor={color}
        />}
        <Icon size={size} name={icon} color={color} />

        {progress && <Text style={{ position: "absolute", left: -100 }}>{fTranslate("OpenIn" , openIn)}</Text>}
    </TouchableOpacity>


    );

}

const styles = StyleSheet.create({
    circle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 15,
        borderColor: 'blue',
    },
});
/*  <TouchableOpacity style={{width:100, height:100}}>
           <AnimatedCircularProgress
                style={{ position: "absolute", top: 0, left: 0 }}
                duration={duration}
                rotation={0}
                size={55}
                width={55}
                fill={100}
                tintColor="#00e0ff"
                onAnimationComplete={() => console.log('onAnimationComplete')}
                backgroundColor="#3d5875" /> 

            

         </TouchableOpacity> */