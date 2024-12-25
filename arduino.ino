#include <Servo.h>

// Định nghĩa các chân
#define TRIG_PIN D8
#define ECHO_PIN D7
#define BUZZER_PIN D3   // Chân điều khiển còi
Servo servo;

// Ngưỡng khoảng cách
const int DISTANCE_THRESHOLD = 10;
const unsigned long delayTime = 5000; // 5 giây

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT); // Thiết lập chân còi là OUTPUT
  Serial.begin(9600);          // Khởi động Serial để in khoảng cách
  servo.attach(D2);            // Kết nối Servo với chân D2
  servo.write(0);              // Đặt Servo về vị trí ban đầu
}

void loop() {
  // Đo khoảng cách từ cảm biến HC-SR04
  long distance = measureDistance();

  // In khoảng cách đo được
  Serial.print("Khoảng cách: ");
  Serial.print(distance);
  Serial.println(" cm");

  // Điều khiển Servo và còi
  if (distance > 0 && distance < DISTANCE_THRESHOLD) {
    // Kích hoạt còi
    digitalWrite(BUZZER_PIN, HIGH);
    servo.write(120); // Quay Servo đến 120 độ
    Serial.println("Mở cửa");
    delay(delayTime); // Chờ 5 giây
    servo.write(0);   // Quay Servo về 0 độ
    Serial.println("Đóng cửa");
  } else {
    // Tắt còi khi không ở trong khoảng cách nguy hiểm
    digitalWrite(BUZZER_PIN, LOW);
    servo.write(0); // Luôn giữ Servo ở vị trí ban đầu
  }

  delay(500); // Chờ 0.5 giây trước khi đo lại
}

// Hàm đo khoảng cách
long measureDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH);
  long distance = duration * 0.034 / 2; // Tính khoảng cách (cm)

  return distance;
}