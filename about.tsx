import { ScrollView, StyleSheet, Text, View } from "react-native";
import Icon from 'react-native-vector-icons/AntDesign';


export function About({ onClose }: { onClose: () => void }) {
    return <View>
        <View style={{ position: "absolute", top: 30, right: 10 }}>
            <Icon name="close" color='black' size={40} onPress={(e) => onClose()} />
        </View>
        
        <ScrollView style={{ margin: 30, marginTop: 50, width:"80%" }}>
            <Text style={styles.textHE}>IssieSays היא אפליקציה המשמשת כפלט קולי ומאפשרת הקלטה מהיר של מסר והשמעתו באמצעות לחיצה על המסך.
            </Text>
            <View style={{ height: 10 }} />
            <Text style={styles.textHE}>האפליקציה פותחה במיוחד עבור אנשים עם צרכים תקשורתיים מורכבים (CCN), היכולים להשתמש באפליקציה להבעת מסר מהיר וקבוע או לשיתוף בחוויה.
            </Text>
            <View style={{ height: 10 }} />
            <Text style={styles.textHE}>האפליקציה פותחה על ידי המרכז הטכנולוגי בבית איזי שפירא בשיתוף מעבדות SAP ישראל והיא חלק ממארז אפליקציות שפותחו והותאמו לצרכים התקשורתיים, החברתיים והלימודיים של ילדים ובוגרים עם מוגבלות.
            </Text>
            <View style={{ height: 10 }} />
            <Text style={styles.textHE}>
                תודה מיוחדת למתנדבים במעבדות SAP ישראל, שקשובים לכל צורך חינוכי וטיפולי העולה מן השטח ומפתחים לנו אפליקציות משנות חיים.
            </Text>
            <View style={{ height: 40 }} />


            <Text style={styles.textEN}>IssieSays is an application that serves as a voice output and allows you to quickly record a message and play it by clicking on the screen.
            </Text>
            <View style={{ height: 10 }} />
            <Text style={styles.textEN}>The application was developed especially for people with complex communication needs (CCN), who can use the application to express a quick and regular message or to share an experience.
            </Text>
            <View style={{ height: 10 }} />
            <Text style={styles.textEN}>The application was developed by the Beit Issie Shapiro Technology Center in collaboration with SAP Labs Israel and is part of a package of applications developed and adapted to the communicative, social and educational needs of children and adults with disabilities.
            </Text>
            <View style={{ height: 10 }} />
            <Text style={styles.textEN}>Special thanks to the volunteers at the SAP Labs Israel, who are attentive to every educational and therapeutic need that arises from the field and develop life-changing applications with us.
            </Text>


        </ScrollView>

    </View >
}



const styles = StyleSheet.create({
    textHE: {
        width: "100%",
        fontSize: 25,
        alignSelf: 'flex-start',
        writingDirection: "rtl"
    },
    textEN: {
        width: "100%",
        fontSize: 25,
        alignSelf: 'flex-start',
        writingDirection: "ltr"
    }
})