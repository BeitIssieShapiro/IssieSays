import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';


export function SettingsButton({ onPress }: { onPress: () => void }) {
    return <View style={styles.settingButtonHost}>
        <Icon name="cog" size={45} onPress={(e) => onPress()} />
    </View>
}

export function Settings({ onAbout, onClose }: { onAbout: () => void, onClose: () => void }) {
    return <View style={{ position: "absolute", width: "100%", height: "100%" }}
    //onTouchStart={() => onClose()}
    >
        <View style={{
            position: "absolute", right: 0, width: "40%", height: "100%", backgroundColor: "white",
            zIndex: 1000, paddingTop: 150
        }}>
            <View style={styles.settingButtonHost}>
                <Icon name="close" size={45} onPress={() => onClose()} />
            </View>
            <TouchableOpacity onPress={() => onAbout()} style={{ flexDirection: "row-reverse", alignItems: "center", margin: 25 }}>
                <Icon name="info-circle" color='black' size={35} />
                <Text style={{ margin: 10, fontSize: 25 }}>About - אודות</Text>
            </TouchableOpacity>
        </View>
    </View>
}


const styles = StyleSheet.create({
    settingButtonHost: {
        position: "absolute",
        right: 50,
        top: 50
    }
})