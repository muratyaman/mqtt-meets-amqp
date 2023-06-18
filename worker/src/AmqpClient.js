const amqp = require('amqp-connection-manager');

class AmqpClient {

  constructor(config) {
    this._client = amqp.connect([ config.AMQP_URL ]);
    this._client.on('connect', () => console.log('AMQP: event: connect'));
    this._client.on('disconnect', err => console.log('AMQP: event: disconnect', err.stack));
  }

  async sendToQueue(queueName, message) {
    console.info('AMQP: sendToQueue', queueName, message);

    const channelWrapper = this._client.createChannel({
      json: true,
      setup: async function (channel) {
        console.info('AMQP: sendToQueue: setting up channel...', queueName);
        await channel.assertQueue(queueName, { durable: true });
      },
    });

    channelWrapper.waitForConnect()
      .then(() => {
        console.log('AMQP: sendToQueue: connected', queueName);
      });

    // Send some messages to the queue.  If not connected, these will be queued up in memory until we connect.
    // Note that `sendToQueue()` and `publish()` return a Promise which is fulfilled or rejected
    // when the message is actually sent (or not sent.)
    return channelWrapper
      .sendToQueue(queueName, message)
      .then(() => {
        console.info('AMQP: sendToQueue: Message was sent!  Yess!', queueName);
      })
      .catch(err => {
        console.error('AMQP: sendToQueue: Message was rejected...  Noo!', queueName, err);
      })
      .finally(() => {
        console.info('AMQP: sendToQueue: closing channel...', queueName);
        return channelWrapper.close();
      });
  }

  listenToQueue(queueName, consumer) {
    console.info('AMQP: listenToQueue...', queueName);

    const channelWrapper = this._client.createChannel({
      json: true,
      setup: async (channel) => {
        console.info('AMQP: listenToQueue: setting up channel...', queueName);
        await channel.assertQueue(queueName, { durable: true });
        channel.prefetch(1); // Set the prefetch count for this channel
        await channel.consume(
          queueName,
          (message) => consumer(message, channel),
          { noAck: false }, // we need to ack the message after processing
          // no callback here, so it returns a promise
        );
        return true;
      },
    });

    channelWrapper.waitForConnect()
      .then(() => {
        console.log('AMQP: listenToQueue: connected', queueName);
      });

    return channelWrapper;
  }

}

module.exports = {
  AmqpClient,
};
