# mqtt-happy-scenario

Use [sequencediagram.org](https://sequencediagram.org/) to edit and visualize.

```plain
title MQTT (happy scenario)

participant Device1
participant MQTT
participant Device2

Device1->MQTT: connect

Device1->MQTT: subscribe\n topic 'devices/ID1/#'

Device2->MQTT: connect

Device2->MQTT: subscribe\n topic 'devices/ID2/#'

Device2->MQTT: publish message to topic\n 'devices/ID1/text' (QoS=1)

MQTT->Device1: deliver message
Device1->MQTT: ack
```
