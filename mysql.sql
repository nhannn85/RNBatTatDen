CREATE DATABASE DoorControl;
USE DoorControl;

CREATE TABLE DoorLogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    atTime time,
    action VARCHAR(50)
);
