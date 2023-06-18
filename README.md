# mqtt-meets-amqp

Sample MQTT server, MQTT worker and MQTT client to use MQTT and AMQP for delivering messages reliably by creating some conventions about names of topics and queues.

[MQTT](https://en.wikipedia.org/wiki/MQTT) is good at collecting messages from weak devices on IoT. But since it is more like a Pub/Sub messaging system, when devices connect, disconnect constantly on unstable networks, some messages are lost. There is no message queue despite its name.

[AMQP](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol) is good at dealing with messages i.e. making sure that they are "worked" on; "delivered" in our case.

## requirements

[Node v16.x](https://nodejs.org/en)

We use:

* [aedes](https://www.npmjs.com/package/aedes) as MQTT server library
* [mqtt](https://www.npmjs.com/package/mqtt) as MQTT client library
* [amqplib](https://www.npmjs.com/package/amqplib) as AMQP client library
* [amqp-connection-manager](https://www.npmjs.com/package/amqp-connection-manager) as wrapper for amqplib for connection pooling.
* [dotenv](https://www.npmjs.com/package/dotenv) to process `.env` files.

## components

CLIENT subscribes to MQTT server topics like `to/<clientId>/text` etc.; publishes to topics like `from/<clientId>/text`. Also, HTTP interface `POST <host>/<command>` like `POST <host>/text` makes it easier to test publishing messages. `<command>` is a topic suffix.

SERVER acts is an MQTT server. When a client subscribes, it opens a channel (per client per queue) on AMQP server and consumes messages on queues `to.<clientId>.<command>` like `to.user2.text` (where `/` is replaced by `.` ). It publishes the AMQP message via MQTT. When publish is confirmed, it acknowledges the message on AMQP. On unsubscription (client disconnects), it closes that channel.

WORKER subscribes to topics `from/#` on MQTT server; publishes messages to AMQP queues `to.<clientId>.<command>`. It is acts like an adapter between MQTT and AMQP depending on commands/business logic. So, when we receive a command on `from.user1.text` with payload:

```json
{
  "to": "user2",
  "text": "hi user2, this is user1"
}
```

then it publishes a message to queue `to.user2.text` with payload:

```json
{
  "from": "user1",
  "text": "hi user2, this is user1",
  "ts": "<appends new Date()>",
  "id": "<appends crypto.randomUUID()>"
}
```

Folders:

```plain
client/
  src/
    index.js

server/
  src/
    index.js

worker/
  src/
    index.js
```

## tests

```sh
# Terminal 1
cd server
npm i
cp .sample.env .env
# edit .env file
npm run start

# Terminal 2
cd worker
npm i
cp .sample.env .env
# edit .env file
npm run start

# Terminal 3: start client 1
cd client
npm i
cp .sample.env .env
# edit .env file
npm run start:1
# or:
# npm run start

# Terminal 4: start client 2
cd client
npm run start:2

# CASE 1: send command to client 1 to send a text message to client 2 when all components are online
# Terminal 5
curl --location 'http://localhost:11000/text' \
--header 'Content-Type: application/json' \
--data '{
  "to": "user2",
  "text": "hi from user1"
}'

# observe console.* messages on Terminals 1, 2, 3, 4

# CASE 2: send command to client 1 to send a text message to client 2 when client 2 is offline
# Terminal 4
# disconnect client 2, kill command

# Terminal 5
curl --location 'http://localhost:11000/text' \
--header 'Content-Type: application/json' \
--data '{
  "to": "user2",
  "text": "hi from user1"
}'

# observe console.* messages on Terminals 1, 2, 3, 4
# connect client 2
# Terminal 4
npm run start:2

# observe: message sent (while offline) is received
```

## TODO

* implement authorization check; username and password on MQTT server.
* restrict topic pattern on subscriptions bby using username.
* user md5(username) instead of client ID on topics and queues. Username could be email address.
