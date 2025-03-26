import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Message {
    text: string
    time: string
    isSent: boolean
    status?: 'sent' | 'delivered' | 'read'
    date?: string
}

export const useMessagesStore = defineStore('messages', () => {
    const messages = ref<Message[]>([
        { text: 'Hi! How are you?', time: '10:30 AM', isSent: false, date: 'Today' },
        { text: "Hello! I'm fine, thanks!", time: '10:31 AM', isSent: true, status: 'read' },
        {
            text: 'Would you like to grab lunch tomorrow?',
            time: '3:45 PM',
            isSent: false,
            date: 'Yesterday',
        },
        { text: 'Sure, that sounds great!', time: '3:47 PM', isSent: true, status: 'read' },
        {
            text: "Let's meet at the usual place?",
            time: '3:47 PM',
            isSent: true,
            status: 'delivered',
        },
        { text: 'Perfect, see you then!', time: '3:50 PM', isSent: false },
    ])

    function addMessage(message: Message) {
        messages.value.push(message)
    }

    function deleteMessage(index: number) {
        messages.value.splice(index, 1)
    }

    function updateMessage(index: number, newText: string) {
        if (index >= 0 && index < messages.value.length) {
            messages.value[index] = {
                ...messages.value[index],
                text: newText,
                status: 'sent',
            }
        }
    }

    function resetMessages() {
        messages.value = [
            { text: 'Hi! How are you?', time: '10:30 AM', isSent: false, date: 'Today' },
            { text: "Hello! I'm fine, thanks!", time: '10:31 AM', isSent: true, status: 'read' },
            {
                text: 'Would you like to grab lunch tomorrow?',
                time: '3:45 PM',
                isSent: false,
                date: 'Yesterday',
            },
            { text: 'Sure, that sounds great!', time: '3:47 PM', isSent: true, status: 'read' },
            {
                text: "Let's meet at the usual place?",
                time: '3:47 PM',
                isSent: true,
                status: 'delivered',
            },
            { text: 'Perfect, see you then!', time: '3:50 PM', isSent: false },
        ]
    }

    return {
        messages,
        addMessage,
        deleteMessage,
        updateMessage,
        resetMessages,
    }
})
