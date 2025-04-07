import mitt from 'mitt'

type Events = {
    user_online: { userId: number; isOnline: boolean }
    new_message: { message: { id: number; content: string; createdAt: string; senderId: number } }
    event_typing: { userId: number; contactId: number }
}

const emitter = mitt<Events>()

export const useEventBus = () => emitter

// export const useEventBus = () => {
//     return {
//         emit: emitter.emit,
//         on: emitter.on,
//         off: emitter.off,
//     }
// }
