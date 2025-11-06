/**
 *  Servicios de escucha de eventos rabbit
 */
import amqp from 'amqplib'

export class RabbitDirectConsumer {
  constructor(queue, exchange) {
    this.queue = queue
    this.exchange = exchange
    this.processors = new Map()
  }

  addProcessor(type, processor) {
    this.processors.set(type, processor)
  }

  async init() {
    try {
      const conn = await amqp.connect(process.env.RABBIT_URL)

      const channel = await conn.createChannel()

      channel.on('close', function () {
        console.error(
          'RabbitMQ  ' +
            this.exchange +
            " conexión cerrada, intentado reconecta en 10'"
        )
        setTimeout(() => this.init(), 10000)
      })

      console.log('RabbitMQ ' + this.exchange + ' conectado')

      const exchange = await channel.assertExchange(this.exchange, 'direct', {
        durable: false,
      })

      const queue = await channel.assertQueue(this.queue, { durable: false })

      channel.bindQueue(queue.queue, exchange.exchange, queue.queue)

      channel.consume(
        queue.queue,
        message => {
          const rabbitMessage = JSON.parse(message.content.toString())
          if (this.processors.has(rabbitMessage.type)) {
            this.processors.get(rabbitMessage.type)(rabbitMessage)
          }
        },
        { noAck: true }
      )
    } catch (err) {
      console.error('RabbitMQ ' + this.exchange + ' ' + err.message)
      setTimeout(() => this.init(), 10000)
    }
  }
}
