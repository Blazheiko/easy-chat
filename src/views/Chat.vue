<script setup lang="ts">
import { ref, defineComponent, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useContactsStore } from '@/stores/contacts'
import ContactsList from '@/components/ContactsList.vue'
import ChatArea from '@/components/ChatArea.vue'
import NewsFeed from '@/components/NewsFeed.vue'
import LoaderOverlay from '@/components/LoaderOverlay.vue'
import ConnectionStatus from '@/components/ConnectionStatus.vue'
import api from '@/utils/api'
import { useMessagesStore, type Message } from '@/stores/messages'
import type { Contact } from '@/stores/contacts'

const messagesStore = useMessagesStore()
interface ContactResponse {
    rename?: string
    contact: {
        name: string
        id: number
    }
    unreadCount: number
    status: string
    updatedAt: string
}

interface ApiMessage {
    content: string
    createdAt: string
}

interface MessagesResponse {
    messages: ApiMessage[]
    contact: Contact
}

interface ApiResponse {
    status: string
    contactList: ContactResponse[]
}

defineComponent({
    name: 'ChatView',
})

const router = useRouter()
const userStore = useUserStore()
const contactsStore = useContactsStore()
const isContactsVisible = ref(false)
const isLoading = ref(false)
const isOffline = ref(false)
const isMenuOpen = ref(false)
const showNews = ref(false)
const chatAreaRef = ref<InstanceType<typeof ChatArea> | null>(null)

const toggleContacts = () => {
    isContactsVisible.value = !isContactsVisible.value
}

const toggleNews = (newsState: boolean) => {
    showNews.value = newsState
}

const handleConnectionRetry = () => {
    isLoading.value = true

    // Имитация попытки переподключения
    setTimeout(() => {
        isLoading.value = false
        isOffline.value = false
    }, 2000)
}

// Функция форматирования времени сообщения
const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    // Если сообщение сегодня
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })
    }

    // Если сообщение вчера
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday'
    }

    // Если сообщение на этой неделе
    const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (daysAgo < 7) {
        return `${daysAgo} days ago`
    }

    // Если старше недели, показываем день недели
    return date.toLocaleString('en-US', { weekday: 'long' })
}

const initChatData = async () => {
    const { error, data } = await api.http<ApiResponse>('POST', '/api/chat/get-contact-list', {
        userId: userStore.user?.id,
    })
    if (error) {
        console.error('Failed to get contact list: ', error)
    } else if (data?.status === 'ok' && data.contactList?.length > 0) {
        console.log('Contact list: ', data.contactList)

        const contactList = data.contactList.map((contact: ContactResponse) => ({
            id: contact.contact.id,
            contactId: contact.contact.id,
            name: contact.rename || contact.contact.name,
            unreadCount: contact.unreadCount,
            isActive: false,
            isOnline: false,
            lastMessage: 'Hello, how are you?',
            lastMessageTime: formatMessageTime(contact.updatedAt),
        }))

        contactsStore.setContactList(contactList)
        if (!selectedContact.value) {
            const currentContactId = localStorage.getItem('current_contact_id')
            if (currentContactId) {
                const contact = contactList.find((c) => c.contactId === parseInt(currentContactId))
                if (contact) selectContact(contact)
            }
        }
    }
}

// Проверяем состояние сети при загрузке и слушаем события
const setupNetworkListeners = () => {
    // Добавляем слушатели для отслеживания состояния сети
    window.addEventListener('online', () => {
        isOffline.value = false
    })

    window.addEventListener('offline', () => {
        isOffline.value = true
    })

    // Начальная проверка состояния сети
    isOffline.value = !navigator.onLine
}

// Функция для закрытия выпадающего меню при клике вне
const closeMenuOnClickOutside = (event: MouseEvent) => {
    if (isMenuOpen.value) {
        const target = event.target as HTMLElement
        const menu = document.querySelector('.dropdown-menu')
        const menuButton = document.querySelector('.menu-button')

        if (menu && menuButton && !menu.contains(target) && !menuButton.contains(target)) {
            isMenuOpen.value = false
        }
    }
}

// Переход в аккаунт
const goToAccount = () => {
    isMenuOpen.value = false
    router.push('/account')
}

// Переход на страницу новостей
const goToNews = () => {
    isMenuOpen.value = false
    router.push('/news')
}

// Переход на страницу манифеста
const goToManifesto = () => {
    isMenuOpen.value = false
    router.push('/manifesto')
}

// Выход из аккаунта
const logout = () => {
    isMenuOpen.value = false
    // localStorage.removeItem('user')
    router.push('/')
}
const sendMessage = async (newMessage: string) => {
    console.log('sendMessage', newMessage)
    if (newMessage && selectedContact.value && userStore.user) {
        console.log('selectedContact', selectedContact.value)
        const { error, data } = await api.http('POST', '/api/chat/send-chat-messages', {
            contactId: selectedContact.value.contactId,
            content: newMessage,
            userId: userStore.user?.id,
        })
        if (error) {
            console.error(error)
        } else if (data && data.message) {
            const message = data.message as { content: string; createdAt: string | number | Date }
            messagesStore.addMessage({
                text: message.content,
                time: new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                isSent: true,
                status: 'delivered',
                createdAt: message.createdAt,
                date: '',
            })
        }
    }
}

const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
}

const isYesterday = (date: Date) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return date.getDate() === yesterday.getDate() &&
           date.getMonth() === yesterday.getMonth() &&
           date.getFullYear() === yesterday.getFullYear()
}

const setDate = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return date.toLocaleDateString()
}

const selectedContact = ref<Contact | null>(null)

const selectContact = async (contact: Contact) => {
    console.log('selectContact', contact)
    selectedContact.value = contact
    localStorage.setItem('current_contact_id', contact.contactId.toString())
    messagesStore.resetMessages()
    const { error, data } = await api.http<MessagesResponse>('POST', '/api/chat/get-messages', {
        contactId: contact.contactId,
        userId: userStore.user?.id,
    })
    if (error) {
        console.error(error)
    } else if (data && data.messages && data.messages.length > 0 && data.contact) {
        console.log(data)
        const newMessages: Message[] = data.messages
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((message: ApiMessage) => ({
                text: message.content,
                time: new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                isSent: true,
                status: 'delivered',
                createdAt: message.createdAt,
                date: setDate(new Date(message.createdAt)),
            }))
            const acc = newMessages.reduce((acc, message) => {
                if (acc === message.date) message.date = ''
                else if(message.date) acc = message.date

                return acc
            }, '')
            console.log('acc', acc)

        messagesStore.setMessages(newMessages)
        selectedContact.value = data.contact as Contact
        nextTick(() => {
            scrollToBottom()
        })
    }
}

const scrollToBottom = () => {
    chatAreaRef.value?.scrollToBottom()
}

onMounted(() => {
    setupNetworkListeners()
    document.addEventListener('click', closeMenuOnClickOutside)
    if (!userStore.hasUser()) {
        console.log('no user')
        router.push('/')
    } else {
        initChatData()
    }
})

onBeforeUnmount(() => {
    document.removeEventListener('click', closeMenuOnClickOutside)
})
</script>

<template>
    <div class="chat-container">
        <ConnectionStatus :show="isOffline" @retry="handleConnectionRetry" />
        <LoaderOverlay :show="isLoading" />

        <div class="chat-main">
            <ContactsList
                :class="{ show: isContactsVisible }"
                @toggle-contacts="toggleContacts"
                @toggle-news="toggleNews"
                @select-contact="selectContact"
            />
            <div class="main-content">
                <NewsFeed
                    v-if="showNews"
                    :hide-header="true"
                    @back-to-chat="showNews = false"
                    @toggle-contacts="toggleContacts"
                />
                <ChatArea
                    v-else
                    ref="chatAreaRef"
                    @toggle-contacts="toggleContacts"
                    @go-to-account="goToAccount"
                    @go-to-news="goToNews"
                    @go-to-manifesto="goToManifesto"
                    @logout="logout"
                    @send-message="sendMessage"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.chat-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    background-color: var(--background-color);
    position: relative;
    overflow: hidden;
}

.chat-header {
    height: var(--header-height);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    background-color: var(--primary-color);
    color: white;
    box-shadow: var(--box-shadow);
}

.dark-theme .chat-header {
    background-color: #0d47a1;
}

.chat-header h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
}

.chat-main {
    display: grid;
    grid-template-columns: 300px 1fr;
    flex: 1;
    height: calc(100% - var(--header-height));
    overflow: hidden;
}

.main-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    min-height: 0;
}

.contact-toggle,
.menu-button {
    background-color: transparent;
    border: 1px solid rgba(255, 255, 255, 0.5);
    color: white;
    padding: 8px 15px;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
}

.contact-toggle:hover,
.menu-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: white;
    transform: translateY(-1px);
}

.contact-toggle:active,
.menu-button:active {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(0);
}

.menu-container {
    position: relative;
}

.arrow-icon {
    transition: transform 0.3s ease;
}

.menu-button.open .arrow-icon {
    transform: rotate(180deg);
}

.dropdown-menu {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    width: 200px;
    background-color: white;
    border: none;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    z-index: 100;
    overflow: hidden;
    opacity: 0;
    transform: translateY(-10px);
    visibility: hidden;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    padding: 6px 0;
}

.dropdown-menu.show {
    opacity: 1;
    transform: translateY(0);
    visibility: visible;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    text-align: left;
    padding: 12px 15px;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.25s ease;
    color: var(--text-color);
    border-radius: 8px;
    margin: 4px 8px;
    width: calc(100% - 16px);
    font-weight: 500;
    font-size: 14px;
}

.menu-item.logout {
    color: #dc3545;
}

.menu-item:hover {
    background-color: #f8f9fa;
    transform: translateY(-1px);
}

.menu-item:active {
    transform: translateY(0);
}

@media (max-width: 768px) {
    .chat-header {
        padding: 0 16px;
    }

    .chat-header h1 {
        font-size: 18px;
    }

    .contact-toggle span,
    .menu-button span,
    .arrow-icon {
        display: none;
    }

    .contact-toggle,
    .menu-button {
        padding: 10px;
        justify-content: center;
    }

    .chat-main {
        grid-template-columns: 1fr;
    }

    :deep(.contacts-list) {
        position: absolute;
        top: var(--header-height);
        left: -100%;
        width: 100%;
        height: calc(100% - var(--header-height));
        z-index: 10;
        transition: all 0.3s ease;
    }

    :deep(.contacts-list.show) {
        left: 0;
    }
}

.dark-theme .chat-container {
    background-color: #121212;
}
</style>
