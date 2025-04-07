import { defineStore } from 'pinia'
import { ref } from 'vue'

// {
//     name: 'John Smith',
//     unreadCount: 2,
//     isActive: true,
//     isOnline: true,
//     lastMessage: 'Perfect, see you then!',
//     lastMessageTime: '10:30 AM',
// },

export interface Contact {
    id: number
    contactId: number
    name: string
    unreadCount?: number
    isActive?: boolean
    isOnline?: boolean
    avatar?: string
    lastMessage?: string
    lastMessageTime?: string
    updatedAt: string
}

export const useContactsStore = defineStore('contacts', () => {
    const contacts = ref<Contact[]>([])

    function setActiveContact(activeContact: Contact) {
        console.log('setActiveContact', activeContact.contactId)
        contacts.value.forEach((contact) => {
            contact.isActive = (contact.contactId === activeContact.contactId)
        })
    }

    function incrementUnreadCount(contactId: number) {
        contacts.value.forEach((contact) => {
            if (contact.contactId === contactId) {
                contact.unreadCount = (contact.unreadCount || 0) + 1
            }
        })
    }

    function resetUnreadCount(contactId: number) {
        contacts.value.forEach((contact) => {
            if (contact.contactId === contactId) {
                contact.unreadCount = 0
            }
        })
    }

    function updateContact(updatedContact: Partial<Contact>) {

        contacts.value = contacts.value.map((contact) => {
            if (contact.contactId === updatedContact.contactId) {
                return {
                    ...contact,
                    ...updatedContact,
                }
            }
            return contact
        })
    }

    function deleteContact(id: number) {
        contacts.value = contacts.value.filter((contact) => contact.id !== id)
    }

    function setContactList(contactList: Contact[]) {
        contacts.value = contactList
    }

    function addContact(contact: Contact) {
        contacts.value.unshift(contact)
    }

    function resetContacts() {
        contacts.value = []
    }

    return {
        contacts,
        setActiveContact,
        setContactList,
        updateContact,
        deleteContact,
        addContact,
        resetContacts,
        incrementUnreadCount,
        resetUnreadCount,
    }
})
