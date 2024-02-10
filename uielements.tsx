import { View } from "react-native";


export function Spacer({h, w, bc}: {h?:Number, w?:Number, bc?:string}) {
    return <View style={{height:h, width:w, backgroundColor:bc}}/>
}