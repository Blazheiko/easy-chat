import mitt from 'mitt'

export type Events = {
    user_online: { userId: number; isOnline: boolean }
    new_message: { message: { id: number; content: string; createdAt: string; senderId: number } }
    event_typing: { userId: number; contactId: number }
    change_online: { userId: number; status: string }
    toggle_notifications: { enabled: boolean }
    init_app: void
    unauthorized: void
    webrtc_ice_candidate: { candidate: RTCIceCandidateInit }
    webrtc_call_answer: { answer: RTCSessionDescriptionInit }
    webrtc_call_offer: { 
        targetUserId: string | number
        callType: 'video' | 'audio'
        offer: RTCSessionDescriptionInit 
    }
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
