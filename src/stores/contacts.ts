import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Contact {
    name: string
    unreadCount?: number
    isActive?: boolean
    isOnline?: boolean
    avatar?: string
    lastMessage?: string
    lastMessageTime?: string
}

export const useContactsStore = defineStore('contacts', () => {
    const contacts = ref<Contact[]>([
        {
            name: 'John Smith',
            unreadCount: 2,
            isActive: true,
            isOnline: true,
            lastMessage: 'Perfect, see you then!',
            lastMessageTime: '10:30 AM',
        },
        {
            name: 'Mary Johnson',
            unreadCount: 5,
            isOnline: true,
            lastMessage: 'I just sent you the files you requested',
            lastMessageTime: 'Yesterday',
        },
        {
            name: 'Alex Wilson',
            isOnline: false,
            lastMessage: 'When are you planning to finish the project?',
            lastMessageTime: '2 days ago',
        },
        {
            name: 'Helen Brown',
            unreadCount: 1,
            isOnline: false,
            lastMessage: 'Thank you for your help!',
            lastMessageTime: 'Monday',
        },
    ])

    function setActiveContact(contactName: string) {
        contacts.value.forEach((contact) => {
            contact.isActive = contact.name === contactName
        })
    }

    function updateContact(index: number, updatedContact: Partial<Contact>) {
        if (index >= 0 && index < contacts.value.length) {
            contacts.value[index] = {
                ...contacts.value[index],
                ...updatedContact,
            }
        }
    }

    function deleteContact(index: number) {
        if (index >= 0 && index < contacts.value.length) {
            contacts.value.splice(index, 1)
        }
    }

    function resetContacts() {
        contacts.value = [
            {
                name: 'John Smith',
                unreadCount: 2,
                isActive: true,
                isOnline: true,
                lastMessage: 'Perfect, see you then!',
                lastMessageTime: '10:30 AM',
            },
            {
                name: 'Mary Johnson',
                unreadCount: 5,
                isOnline: true,
                lastMessage: 'I just sent you the files you requested',
                lastMessageTime: 'Yesterday',
            },
            {
                name: 'Alex Wilson',
                isOnline: false,
                lastMessage: 'When are you planning to finish the project?',
                lastMessageTime: '2 days ago',
            },
            {
                name: 'Helen Brown',
                unreadCount: 1,
                isOnline: false,
                lastMessage: 'Thank you for your help!',
                lastMessageTime: 'Monday',
            },
        ]
    }

    return {
        contacts,
        setActiveContact,
        updateContact,
        deleteContact,
        resetContacts,
    }
})
