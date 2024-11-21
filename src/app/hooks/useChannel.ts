import { useEffect } from 'react'
import Pusher from 'pusher-js'

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
})

export function useChannel(channelName: string, eventName: string, callback: () => void) {
  useEffect(() => {
    const channel = pusher.subscribe(channelName)
    channel.bind(eventName, callback)

    return () => {
      channel.unbind(eventName, callback)
      pusher.unsubscribe(channelName)
    }
  }, [channelName, eventName, callback])
}
