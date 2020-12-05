import { Message, Stan } from 'node-nats-streaming'
import { Subjects } from '..'

interface Event {
  subject: Subjects
  data: any
}

export abstract class BaseListener<T extends Event> {
  abstract subject: T['subject']
  abstract queueGroupName: string

  abstract onMessage(data: T['data'], msg: Message): void

  protected ackWait = 5000

  constructor(protected client: Stan) {}

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName)
  }

  listen() {
    const subscription = this.client.subscribe(this.subject, this.queueGroupName, this.subscriptionOptions())

    subscription.on('message', (msg: Message) => {
      console.log(`[Message][Received]: ${this.subject} | ${this.queueGroupName}`)

      this.onMessage(this.parseMessage(msg), msg)
    })
  }

  parseMessage(msg: Message) {
    const data = msg.getData()

    return typeof data === 'string' ? JSON.parse(data) : JSON.parse(data.toString('utf8'))
  }
}
