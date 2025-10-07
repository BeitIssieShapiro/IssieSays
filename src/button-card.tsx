import { StyleSheet, Text, View } from "react-native";
import { Switch } from "@rneui/themed";
import { isRTL, translate } from "./lang";
import { Button } from "./profile";
import { colors, gStyles } from "./common/common-style";
import { MainButton, Spacer } from "./uielements";
import { IconButton } from "./common/components";
import { MyIcon } from "./common/icons";

interface ButtonCardProps {
    width: number,
    height: number
    button: Button;
    onSetActive: (active: boolean) => void;
    onEditButton: () => void;
    recName: string;
}

export function ButtonCard({ width, height, button, onSetActive, onEditButton, recName }: ButtonCardProps) {

    const isMobile = width < 280 || height < 280;
    const isNarrow = width < 280;

    const dirStyle: any = { flexDirection: (isRTL() ? "row-reverse" : "row") }

    return <View style={[gStyles.card, { width, height,  padding:10 }]}>
        <View style={[gStyles.cardTitle, dirStyle]}>
            <Text allowFontScaling={false} style={[styles.textValue, { textAlign: isRTL() ? "right" : "left" }]}>
                {button.name}
            </Text>
            {/* <Switch
                value={true}
                onValueChange={(active) => onSetActive(active)}
                color={colors.switchColor}
            /> */}
        </View>
        <View style={gStyles.cardBody}>
            <Spacer h={isMobile ? 5 : 20} />
            <MainButton
                name={""}
                fontSize={22}
                showName={true}
                width={width /3}
                raisedLevel={10}
                color={button.color}
                imageUrl={button.imageUrl}
                appBackground={'white'}
                showProgress={true}
                recName={recName}
            />
        </View>
        <View style={[gStyles.cardFooter, { flexDirection: "row", justifyContent: isNarrow ? "space-between" : "flex-start", alignItems: "center", direction: (isRTL() ? "rtl" : "ltr") }]}>
            <IconButton icon={{ name: "edit", type: "MI", size: 25, color: colors.titleBlue }} text={isMobile ? "" : translate("EditButton")} onPress={onEditButton} />
        </View>
    </View>

}

const styles = StyleSheet.create({
    settingsRow: {
        flexDirection: "row",
        alignItems: "center"
    },
    cubeTitle: {
        fontSize: 25,
        fontWeight: "bold",
        color: "black",
        marginEnd: 20,
    },

    buttonPreview: {
        alignItems: "center",
        justifyContent: "center",
        height: 80,
        width: 80,
        borderWidth: 2,
        borderStyle: "solid",
        borderRadius: 40,
        marginBottom: 5,
    },
    previewIcon: {
        width: 65,
        height: 65
    },

    numberSelector: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        height: "100%"
    },

    textValue: {
        marginEnd: 10,
        marginStart: 10,
        fontSize: 25,
        color: "black"
    },
});