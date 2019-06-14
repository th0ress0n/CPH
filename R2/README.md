## CPH - Room 2

#### Setup build:
```
npm install
```

#### NPM dependencies
"child_process": "^1.0.2"  
"express": "^4.17.1"  
"http": "0.0.0"  
"johnny-five": "^1.1.0"  
"onoff": "^4.1.1"  
"path": "^0.12.7"  
"pi-io": "^1.0.1"  
"socket.io": "^2.2.0"

#### Room 2 - Hardware checklist:
* 1x Raspberry Pi 3 Model B+
* 1x Class 10 SD card - 16Gb or larger.
* 1x GPIO Bridge
* 1x Prototyping board
* 1x HC SR501 PIR Motion Sensor
* 1x HC SR04 Ultrasonic Proximity sensor
* 1x LM393 - Light sensor module with potetiometer
* 1x SW-420 NC - Vibration Sensor Module (Optional and replacable with IR remote setup)



#### PIR
###### Motion sensor - PIR Motion Sensor - HC SR501
![PIR Wiring schema](https://cdn-images-1.medium.com/max/1200/1*AmU7xRv5dE3SHJxzUCQfNQ.png)
Color | Function | Pi PIN number   
Black | Ground | PIN 34  
Red | 5V | PIN 4  
Yellow | Digital IO | PIN 32-BCM12  

#### Ultrasonic sensor - Proximity  
###### Ultrasonic Proximity sensor - HC SR04
![Ultrasonic Wiring schema](https://raw.githubusercontent.com/fivdi/pi-io/master/doc/hc-sr04-two-pin.png)
Red | 5V  
Black | Ground  
Green | Trigger (Pin 23)  
Blue | Echo (Pin 24) 

#### Light sensor Module
###### LM393 - Light sensor module with potetiometer
![Light sensor wiring](http://www.uugear.com/wordpress/wp-content/uploads/2014/12/06.jpg)

#### Vibration Sensor Module 
###### SW-420 NC - WINGONEER - Vibration Sensor Module Vibration Switch
![Vibration Sensor Module wiring](https://www.piddlerintheroot.com/wp-content/uploads/2017/06/vibration.png)
