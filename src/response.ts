import { ConsumeMessage, Connection, Message, Channel } from 'amqplib'
import { IRequest } from './request'

export default class Response {
    private queue = 'events'
    private connection: Connection
    private events: Map<string, (...args: any[]) => any>

    constructor (connection: Connection) {
      this.connection = connection
      this.events = new Map()
    }

    // Public API
    public async listen (): Promise<void> {
      const channel: Channel = await this.connection.createChannel()

      await channel.assertQueue(this.queue, { durable: false })
      await channel.prefetch(1)

      console.log('Awaiting for request..')
      await channel.consume(this.queue, async msg => {
        if (!msg) return
        channel.ack(msg)
  
        const { replyTo, correlationId, deliveryMode } = msg.properties
        const persistent = deliveryMode !== -1
  
        const request: IRequest = JSON.parse(msg.content.toString())
        const result = await this.call(request.event, request.args || [])

        const content = Buffer.from(JSON.stringify(result))
        channel.sendToQueue(replyTo, content, { correlationId, persistent })
      })
    }

    public register (event: string, callback: (...args: any[]) => any): void {
      this.events.set(event, callback)
    }

    // Private API
    private async call (event: string, ...args: any[]): Promise<any> {
      const cb = this.events.get(event)

      if (!cb) throw new Error(`Unknown event: ${event}`)
      return await cb(...args)
    }
}
