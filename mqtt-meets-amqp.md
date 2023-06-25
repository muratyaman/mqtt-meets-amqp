# mqtt-happy-scenario

Use [sequencediagram.org](https://sequencediagram.org/) to edit and visualize.

```plain
title MQTT meets AMQP

participant Device1
participant Device2

participant MQTT
participant Worker
participant AMQP


Worker->AMQP: connection pool
MQTT->AMQP: connection pool

Worker->MQTT: connection pool & \nsubscribe 'devices/#'\nfor messages from watches

Device1->MQTT: connect & disconnect (unstable)

note right of Device1: Device1 is not connected yet

Device2->MQTT: connect & subscribe\n'devices/ID2/#'

Device2->MQTT: publish to\n'devices/ID1/text' (qos:1)

MQTT->Worker: message

note right of Worker: process message

Worker->AMQP: publish to queue\n 'devices.ID1.text'

note left of AMQP: message stays in queue

Device1->MQTT: connect & subscribe\n'devices/ID1/text'

MQTT->AMQP: open channel for queue\n'devices.ID1.text'

note left of AMQP: inform consumer

AMQP->MQTT: message

MQTT->Device1: message (qos:1)
Device1->MQTT: ack

MQTT->AMQP: ack (remove message)

Device1->MQTT: disconnect
MQTT->AMQP: close channel for queue\n 'devices.ID1.text'
```
