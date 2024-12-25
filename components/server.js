const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const mqtt = require("mqtt");

const app = express();
const port = 3000;

// Cấu hình MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Nhannguyen2004!!", // Đổi thành mật khẩu của bạn
  database: "smart_home",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    return;
  }
  console.log("Connected to MySQL!");
});
 
  (err) => {
    if (err) {
      console.error("Error creating table:", err);
    } else {
      console.log("Table created or already exists!");
    }
  }


// MQTT Client
const mqttClient = mqtt.connect("mqtt://broker.emqx.io");

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
  mqttClient.subscribe("nhomNN/v1/device/#", (err) => {
    if (err) {
      console.error("Failed to subscribe to topic:", err);
    } else {
      console.log("Subscribed to MQTT topics");
    }
  });
});

mqttClient.on("message", (topic, message) => {
  console.log(`Message received on ${topic}:`, message.toString());
  const data = JSON.parse(message.toString());
  
  // Lưu dữ liệu vào MySQL
  if (data.name === "led" || data.name === "dht" || data.name === "door") {
    const { name, status, temp, humid } = data;
    db.query(
      `INSERT INTO device_data (device_name, status, temperature, humidity) VALUES (?, ?, ?, ?)`,
      [name, status || null, temp || null, humid || null],
      (err) => {
        if (err) {
          console.error("Error inserting data:", err);
        } else {
          console.log("Data saved to database");
        }
      }
    );
  }
});

// Middleware
app.use(bodyParser.json());

// API Routes
app.get("/api/devices", (req, res) => {
  db.query("SELECT * FROM device_data ORDER BY timestamp DESC", (err, results) => {
    if (err) {
      res.status(500).send("Error retrieving data from database");
    } else {
      res.json(results);
    }
  });
});

app.post("/api/control", (req, res) => {
  const { device, action } = req.body;
  if (!device || !action) {
    return res.status(400).send("Device and action are required");
  }

  const topic = `nhomNN/v1/device/${device}/rpc`;
  const payload = JSON.stringify({ name: device, status: action });

  mqttClient.publish(topic, payload, (err) => {
    if (err) {
      res.status(500).send("Failed to publish MQTT message");
    } else {
      res.send("Command sent successfully");
    }
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
