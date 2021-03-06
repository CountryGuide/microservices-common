import { Subjects } from '..'
import { Stan } from 'node-nats-streaming'

interface Event {
  subject: Subjects
  data: any
}

export abstract class BasePublisher<T extends Event> {
  abstract subject: T['subject']

  constructor(protected client: Stan) {}

  publish(data: T['data']): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          return reject(err)
        }
        console.log(`[Event][Published]: ${this.subject}`)

        resolve()
      })
    })
  }
}
