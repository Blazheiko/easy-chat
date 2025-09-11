import { defineStore } from 'pinia'
import { ref } from 'vue'

// {
//     text: 'Would you like to grab lunch tomorrow?',
//     time: '3:45 PM',
//     isSent: false,
//     date: 'Yesterday',
// },

export interface Message {
    id?: number
    sender_id?: number
    receiver_id?: number
    text: string
    time: string
    isSent: boolean
    status?: 'sent' | 'delivered' | 'read'
    date?: string
    createdAt: string
}

export const useMessagesStore = defineStore('messages', () => {
    const messages = ref<Message[]>([])

    function addMessage(message: Message) {
        messages.value.push(message)
    }

    function deleteMessage(index: number) {
        messages.value.splice(index, 1)
    }

    function updateMessage(index: number, newText: string, serverData?: Partial<Message>) {
        if (index >= 0 && index < messages.value.length) {
            messages.value[index] = {
                ...messages.value[index],
                text: newText,
                status: 'sent',
                // Если есть данные с сервера, применяем их
                ...serverData,
            }
        }
    }

    function setMessages(newMessages: Message[]) {
        messages.value = newMessages
    }

    function resetMessages() {
        messages.value = []
    }

    return {
        messages,
        addMessage,
        deleteMessage,
        updateMessage,
        resetMessages,
        setMessages,
    }
})
