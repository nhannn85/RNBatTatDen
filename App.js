import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import TurnOnOffLedScreen_Mqtt from
'./components/TurnOnOffLedScreen_Mqtt';
export default function App() {
return (
<View style={styles.container}>
<TurnOnOffLedScreen_Mqtt/>
</View>
);
}
const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#fff',
},
});