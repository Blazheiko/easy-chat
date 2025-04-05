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
}

export const useContactsStore = defineStore('contacts', () => {
    const contacts = ref<Contact[]>([])

    function setActiveContact(activeContact: Contact) {
        contacts.value.forEach((contact) => {
            contact.isActive = contact.contactId === activeContact.contactId
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

    function deleteContact(index: number) {
        if (index >= 0 && index < contacts.value.length) {
            contacts.value.splice(index, 1)
        }
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
    }
})
