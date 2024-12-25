import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import init from "react_native_mqtt";

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  sync: {},
});

const options = {
  host: "broker.emqx.io",
  port: 8083,
  path: "/nhomNN",
  id: "id_" + parseInt(Math.random() * 100000),
};

const client = new Paho.MQTT.Client(options.host, options.port, options.path);

const TurnOnOffLedScreen_Mqtt = () => {
  const [msg, setMsg] = useState("No message");
  const [statusLed, setStatusLed] = useState("off");
  const [doorStatus, setDoorStatus] = useState("closed");
  const [temperature, setTemperature] = useState("N/A");
  const [humidity, setHumidity] = useState("N/A");

  useEffect(() => {
    connect();
    client.onMessageArrived = onMessageArrived;
  }, []);

  const connect = () => {
    client.connect({
      onSuccess: () => {
        console.log("connect MQTT broker ok!");
        subscribeTopic();
      },
      useSSL: false,
      timeout: 5,
      onFailure: () => {
        console.log("connect fail");
        connect();
        console.log("reconnect ...");
      },
    });
  };

  const publishTopic = (topic, payload) => {
    const message = new Paho.MQTT.Message(payload);
    message.destinationName = topic;
    client.send(message);
  };

  const subscribeTopic = () => {
    client.subscribe("nhomNN/v1/device/led/rpc", { qos: 0 });
    client.subscribe("nhomNN/v1/device/dht/rpc", { qos: 0 });
    client.subscribe("nhomNN/v1/device/door/rpc", { qos: 0 }); // Subscribe to Door control topic
  };

  const onMessageArrived = async (message) => {
    console.log("onMessageArrived: " + message.payloadString);
    setMsg(message.payloadString);

    try {
      const jsondata = JSON.parse(message.payloadString);
      if (jsondata.name === "led") {
        setStatusLed(jsondata.status);
      } else if (jsondata.name === "dht") {
        setTemperature(jsondata.temp);
        setHumidity(jsondata.humid);
      } else if (jsondata.name === "door") {
        setDoorStatus(jsondata.status);
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  };

  const handleTurnOnLed = () => {
    console.log("turn on led...");
    publishTopic("nhomNN/v1/device/led/rpc", '{"message":"turn on led","name":"led","status":"on"}');
  };

  const handleTurnOffLed = () => {
    console.log("turn off led...");
    publishTopic("nhomNN/v1/device/led/rpc", '{"message":"turn off led","name":"led","status":"off"}');
  };

  const handleOpenDoor = () => {
    console.log("open door...");
    publishTopic("nhomNN/v1/device/door/rpc", '{"message":"open door","name":"door","status":"open"}');
  };

  const handleCloseDoor = () => {
    console.log("close door...");
    publishTopic("nhomNN/v1/device/door/rpc", '{"message":"close door","name":"door","status":"closed"}');
  };

  return (
    <View style={styles.containerLedView}>
      <View style={styles.header}>
        <Ionicons name="home" size={64} color="orange" />
        <Text style={styles.title}>Smart Home</Text>
        <Text style={styles.subTitle}>ON / OFF LIGHT</Text>
      </View>

      <View style={styles.main}>
        {/* LED Status */}
        {statusLed === "on" ? (
          <View style={styles.boxLightOn}>
            <Ionicons name="bulb" size={64} color="orange" />
          </View>
        ) : (
          <View style={styles.boxLightOff}>
            <Ionicons name="bulb" size={64} color="grey" />
          </View>
        )}

        <View style={styles.controlGroup}>
          <TouchableOpacity style={[styles.btnOff, styles.btn]} onPress={handleTurnOffLed}>
            <Text style={styles.btnText}>OFF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnOn, styles.btn]} onPress={handleTurnOnLed}>
            <Text style={styles.btnText}>ON</Text>
          </TouchableOpacity>
        </View>

        {/* Door Control */}
        <Text style={styles.subTitle}>DOOR CONTROL</Text>
        <View style={styles.controlGroup}>
          <TouchableOpacity style={[styles.btnOff, styles.btn]} onPress={handleCloseDoor}>
            <Text style={styles.btnText}>CLOSE</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btnOn, styles.btn]} onPress={handleOpenDoor}>
            <Text style={styles.btnText}>OPEN</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subTitle}>{msg}</Text>

        {/* DHT Sensor Data */}
        <View style={styles.sensorContainer}>
          <Text style={styles.sensorTitle}>DHT Sensor Readings</Text>
          <Text style={styles.sensorText}>Temperature: {temperature}°C</Text>
          <Text style={styles.sensorText}>Humidity: {humidity}%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerLedView: {
    flex: 1,
    backgroundColor: "#212121",
    padding: 15,
  },
  header: {
    alignItems: "center",
    marginTop: 50,
  },
  title: {
    fontSize: 100,
    fontWeight: "500",
    color: "orange",
    marginTop: 10,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "white",
  },
  main: {
    flex: 5,
    marginTop: 30,
    alignItems: "center",
  },
  controlGroup: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  btn: {
    alignItems: "center",
    width: 100,
    marginBottom: 5,
    marginTop: 5,
    justifyContent: "center",
    marginRight: 15,
    padding: 15,
    borderRadius: 5,
  },
  btnOn: {
    backgroundColor: "blue",
  },
  btnOff: {
    backgroundColor: "red",
  },
  btnText: {
    color: "#FFFFFF",
  },
  boxLightOff: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: "grey",
    padding: 15,
  },
  boxLightOn: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: "orange",
    padding: 15,
  },
  sensorContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  sensorTitle: {
    fontSize: 24,
    color: "white",
    marginBottom: 5,
  },
  sensorText: {
    fontSize: 18,
    color: "lightgrey",
  },
});
export default TurnOnOffLedScreen_Mqtt;
