# CPH

## Raspberry Pi Prerequisites

### Installing the Image

The following image is recommended:  
**Raspbian Stretch with desktop**  
Image with desktop based on Debian Stretch  
Version: **April 2019**  
Release date: **2019-04-08**  
Kernel version: **4.14**  

### Download from the below address:
https://downloads.raspberrypi.org/raspbian_latest

### Then follow the installation instructions:
https://www.raspberrypi.org/documentation/installation/installing-images


### Environment dependencies

NodeJS - follow these instructions: https://www.instructables.com/id/Install-Nodejs-and-Npm-on-Raspberry-Pi/


### Project Hardware checklist:

#### R1
* 1x Raspberry Pi 3 Model B+
* 1x Class 10 SD card - 16Gb or larger.
* 1x GPIO Bridge
* 1x Prototyping board
* 1x PIR Motion Sensor - HC SR501
* 2x Ultrasonic sensor - HC-SR04 
* 1x 470Ω Resistor
* 1x 330Ω Resistor
* 10x jumper wires

#### R2
* 1x Raspberry Pi 3 Model B+
* 1x Class 10 SD card - 16Gb or larger.
* 1x GPIO Bridge
* 1x Prototyping board



### PIR
###### Motion sensor - PIR Motion Sensor - HC SR501
![PIR Wiring schema](https://cdn-images-1.medium.com/max/1200/1*AmU7xRv5dE3SHJxzUCQfNQ.png)
Color | Function | Pi PIN number   
Black | Ground | PIN 34  
Red | 5V | PIN 4  
Yellow | Digital IO | PIN 32-BCM12  

### Ultrasonic sensor - Proximity
###### Ultrasonic Proximity sensor - HC SR501
![Ultrasonic Wiring schema](https://raw.githubusercontent.com/fivdi/pi-io/master/doc/hc-sr04-two-pin.png)
Red | 5V 
Black | Ground 
Green | Trigger (Pin 23)
Blue | Echo (Pin 24)
