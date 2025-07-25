<script setup lang="ts">
import { ref, defineComponent, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useContactsStore } from '@/stores/contacts'
import ContactsList from '@/components/ContactsList.vue'
import ChatArea from '@/components/ChatArea.vue'
import Calendar from '@/components/Calendar.vue'
import TaskManager from '@/components/TaskManager.vue'
import MyNotes from '@/components/MyNotes.vue'
import LoaderOverlay from '@/components/LoaderOverlay.vue'
import ConnectionStatus from '@/components/ConnectionStatus.vue'
import formatMessageDate from '@/utils/formatMessageDate'
import api from '@/utils/api'
import { useMessagesStore, type Message } from '@/stores/messages'
import type { Contact } from '@/stores/contacts'
import { useEventBus } from '@/utils/event-bus'
import type { WebsocketPayload } from '@/utils/websocket-base'
import { useStateStore } from '@/stores/state'
const messagesStore = useMessagesStore()
const eventBus = useEventBus()

// Аудио-элементы для звуковых уведомлений
const notificationSound = ref<HTMLAudioElement | null>(null)
const clickSound = ref<HTMLAudioElement | null>(null)
// Включены ли звуковые уведомления
const notificationsEnabled = ref(localStorage.getItem('notifications_enabled') !== 'false')

// Функция для воспроизведения звука уведомления
const playNotificationSound = () => {
    if (notificationSound.value && notificationsEnabled.value) {
        notificationSound.value.currentTime = 0
        notificationSound.value.play().catch((error) => {
            console.error('Ошибка воспроизведения звука:', error)
        })
    }
}

// Функция для воспроизведения звука щелчка (для активного чата)
const playClickSound = () => {
    if (clickSound.value && notificationsEnabled.value) {
        clickSound.value.currentTime = 0
        clickSound.value.play().catch((error) => {
            console.error('Ошибка воспроизведения звука щелчка:', error)
        })
    }
}

// Функция для переключения звуковых уведомлений
const toggleNotifications = () => {
    notificationsEnabled.value = !notificationsEnabled.value
    localStorage.setItem('notifications_enabled', notificationsEnabled.value.toString())
}

interface ContactResponse {
    id: number
    userId: number
    contactId: number
    rename?: string
    contact: {
        name: string
        id: number
    }
    lastMessage?: {
        content: string
        createdAt: string
    }
    unreadCount: number
    status: string
    updatedAt: string
    createdAt: string
}

export interface ApiMessage {
    id: number
    content: string
    createdAt: string
    senderId: number
}

interface MessagesResponse {
    messages: ApiMessage[]
    contact: ContactResponse
    onlineUsers: number[]
}

interface ApiInitialResponse {
    status: string
    contactList: ContactResponse[]
    onlineUsers: number[]
}

defineComponent({
    name: 'ChatView',
})

const router = useRouter()
const userStore = useUserStore()
const contactsStore = useContactsStore()
const isContactsVisible = ref(true)
const isLoading = ref(false)
const isOffline = ref(false)
const isMenuOpen = ref(false)
const showNews = ref(false)
const showCalendar = ref(false)
const showTaskManager = ref(false)
const isTyping = ref(false)
const windowWidth = useStateStore().windowWidth
const chatAreaRef = ref<InstanceType<typeof ChatArea> | null>(null)

const toggleContacts = () => {
    console.log('toggleContacts')
    isContactsVisible.value = !isContactsVisible.value
}

const toggleNews = (newsState: boolean) => {
    showNews.value = newsState
    if (newsState) {
        showCalendar.value = false
        showTaskManager.value = false
    }
}

const toggleCalendar = () => {
    showCalendar.value = !showCalendar.value
    if (showCalendar.value) {
        showNews.value = false
        showTaskManager.value = false
    }
}

const toggleTaskManager = () => {
    showTaskManager.value = !showTaskManager.value
    if (showTaskManager.value) {
        showNews.value = false
        showCalendar.value = false
    }
}

const handleConnectionRetry = () => {
    isLoading.value = true

    // Имитация попытки переподключения
    setTimeout(() => {
        isLoading.value = false
        isOffline.value = false
    }, 2000)
}

const initChatData = async () => {
    const { error, data } = await api.http<ApiInitialResponse>(
        'POST',
        '/api/chat/get-contact-list',
        {
            userId: userStore.user?.id,
        },
    )
    if (error) {
        console.error('Failed to get contact list: ', error)
    } else if (data?.status === 'ok' && data.contactList?.length > 0) {
        console.log('Contact list: ', data.contactList)

        const onlineContacts = data.onlineUsers

        const contactList = data.contactList.map((contact: ContactResponse) => ({
            id: contact.id,
            contactId: contact.contactId,
            name: contact.rename || contact.contact.name,
            unreadCount: contact.unreadCount,
            isActive: false,
            isOnline: onlineContacts.includes(contact.contactId),
            lastMessage: contact.lastMessage ? contact.lastMessage.content : '',
            lastMessageTime: formatMessageDate(contact.updatedAt),
            updatedAt: contact.updatedAt,
        }))

        contactsStore.setContactList(contactList)
        if (!selectedContact.value && windowWidth > 600) {
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

const formatChatMesssage = (message: ApiMessage): Message => ({
    text: message.content,
    time: new Date(message.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    }),
    isSent: userStore.user?.id === message.senderId,
    status: 'delivered',
    createdAt: message.createdAt,
    date: isToday(new Date(message.createdAt))
        ? 'Today'
        : formatMessageDate(String(message.createdAt)),
})

const sendMessage = async (newMessage: string) => {
    console.log('sendMessage', newMessage)
    if (newMessage && selectedContact.value && userStore.user) {
        console.log('selectedContact', selectedContact.value)
        const contactId = selectedContact.value.contactId
        const { error, data } = await api.http('POST', '/api/chat/send-chat-messages', {
            contactId,
            content: newMessage,
            userId: userStore.user?.id,
        })
        if (error) {
            console.error(error)
        } else if (data && data.message) {
            const message = formatChatMesssage(data.message as ApiMessage)
            if (messagesStore.messages.length > 0) {
                const lastMessage = messagesStore.messages[messagesStore.messages.length - 1]
                const date = isToday(new Date(lastMessage.createdAt))
                    ? 'Today'
                    : formatMessageDate(String(lastMessage.createdAt))
                if (date === message.date) {
                    message.date = ''
                }
            }
            messagesStore.addMessage(message)

            contactsStore.updateContact({
                contactId: contactId,
                lastMessage: message.text,
                lastMessageTime: formatMessageDate(String(message.createdAt)),
                updatedAt: new Date().toISOString(),
            })
        }
    }
}

const isToday = (date: Date) => {
    const today = new Date()
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    )
}

const selectedContact = ref<Contact | null>(null)

const selectContact = async (contact: Contact) => {
    console.log('selectContact', contact)
    selectedContact.value = contact
    contactsStore.setActiveContact(contact)
    localStorage.setItem('current_contact_id', selectedContact.value.contactId.toString())
    messagesStore.resetMessages()
    const { error, data } = await api.http<MessagesResponse>('POST', '/api/chat/get-messages', {
        contactId: selectedContact.value.contactId,
        userId: userStore.user?.id,
    })
    if (error) {
        console.error(error)
    } else if (data && data.messages && data.messages.length > 0 && data.contact) {
        console.log(data)
        const newMessages: Message[] = data.messages
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map(formatChatMesssage)

        // Обработка дат сообщений
        let lastDate = ''
        newMessages.forEach((message) => {
            if (lastDate === message.date) {
                message.date = ''
            } else if (message.date) {
                lastDate = message.date
            }
        })
        const onlineContacts = data.onlineUsers
        console.log('onlineContacts', onlineContacts)

        messagesStore.setMessages(newMessages)
        const contact = data.contact
        const lastMessage = newMessages.length > 0 ? newMessages[newMessages.length - 1].text : ''
        contactsStore.updateContact({
            id: contact.id,
            contactId: contact.contact.id,
            name: contact.rename || contact.contact.name,
            unreadCount: contact.unreadCount,
            isActive: true,
            isOnline:
                onlineContacts && onlineContacts.length > 0
                    ? onlineContacts.includes(contact.contact.id)
                    : false,
            lastMessage: lastMessage,
            lastMessageTime: formatMessageDate(contact.updatedAt),
            updatedAt: contact.updatedAt,
        } as Contact)
        nextTick(() => {
            isContactsVisible.value = false
            scrollToBottom()
        })
    }
}

const scrollToBottom = () => {
    chatAreaRef.value?.scrollToBottom()
}
let typingTimeout: number | null = null

// Подписываемся на события
onMounted(() => {
    // Инициализация аудио-элементов
    notificationSound.value = new Audio('/audio/notification.mp3')
    clickSound.value = new Audio('/audio/click.mp3')

    // Получение сохраненной настройки уведомлений из localStorage
    notificationsEnabled.value = localStorage.getItem('notifications_enabled') !== 'false'

    setupNetworkListeners()
    document.addEventListener('click', closeMenuOnClickOutside)

    // Подписка на события
    eventBus.on('new_message', (payload: WebsocketPayload) => {
        console.log('event new_message', payload)
        const message: ApiMessage = payload.message as ApiMessage
        if (message?.senderId) {
            contactsStore.updateContactById(Number(message.senderId), {
                lastMessage: message.content,
            })
            if (selectedContact.value && message.senderId === selectedContact.value.contactId) {
                console.log('new_message')
                messagesStore.addMessage({
                    text: message.content,
                    time: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    isSent: false,
                    status: 'delivered',
                    createdAt: new Date().toISOString(),
                    date: isToday(new Date())
                        ? 'Today'
                        : formatMessageDate(new Date().toISOString()),
                })
                // Воспроизводим звук щелчка при получении сообщения в активный чат
                playClickSound()
                nextTick(() => {
                    scrollToBottom()
                })
            } else {
                console.log('new_message not for this contact')
                // Воспроизводим звук при получении нового сообщения в неактивный чат
                playNotificationSound()
                contactsStore.incrementUnreadCount(message.senderId)
                contactsStore.updateContactById(Number(message.senderId), {
                    isOnline: true,
                    lastMessage: message.content,
                    lastMessageTime: formatMessageDate(String(message.createdAt)),
                    updatedAt: new Date().toISOString(),
                })
            }
        }
    })

    eventBus.on('user_online', (payload: WebsocketPayload) => {
        if (selectedContact.value && payload.userId === selectedContact.value.contactId) {
            selectedContact.value.isOnline = payload.isOnline as boolean
        }
    })

    eventBus.on('event_typing', (payload: WebsocketPayload) => {
        if (selectedContact.value && payload.userId === selectedContact.value.contactId) {
            console.log('event_typing in chat', payload)
            isTyping.value = true
            if (typingTimeout) window.clearTimeout(typingTimeout)
            typingTimeout = setTimeout(() => {
                isTyping.value = false
            }, 3000)
        }
    })

    if (!userStore.hasUser()) {
        console.log('no user')
        router.push('/')
    } else {
        initChatData()
    }
})

const eventTyping = async () => {
    console.log('eventTyping')
    if (selectedContact.value) {
        const res = await api.ws('event_typing', {
            userId: userStore.user?.id,
            contactId: selectedContact.value?.contactId,
        })
        console.log('eventTyping res', res)
    }
}

// Отписываемся от событий при размонтировании
onBeforeUnmount(() => {
    document.removeEventListener('click', closeMenuOnClickOutside)
    eventBus.off('new_message')
    eventBus.off('user_online')
})
</script>

<template>
    <div class="chat-container">
        <ConnectionStatus :show="isOffline" @retry="handleConnectionRetry" />
        <LoaderOverlay :show="isLoading" />

        <!-- Аудио-элементы для звуковых уведомлений -->
        <audio
            ref="notificationSound"
            preload="auto"
            src="/audio/notification_1.mp3"
            style="display: none"
        ></audio>
        <audio
            ref="clickSound"
            preload="auto"
            src="/audio/click-button-140881.mp3"
            style="display: none"
        ></audio>

        <div class="chat-main">
            <ContactsList
                :class="{ show: isContactsVisible }"
                @toggle-contacts="toggleContacts"
                @toggle-news="toggleNews"
                @select-contact="selectContact"
                @toggle-calendar="toggleCalendar"
                @toggle-task="toggleTaskManager"
            />
            <div class="main-content">
                <MyNotes
                    v-if="showNews"
                    :hide-header="true"
                    @back-to-chat="showNews = false"
                    @toggle-contacts="toggleContacts"
                />
                <Calendar
                    v-else-if="showCalendar"
                    @back-to-chat="showCalendar = false"
                    @toggle-contacts="toggleContacts"
                />
                <TaskManager
                    v-else-if="showTaskManager"
                    @back-to-chat="showTaskManager = false"
                    @toggle-contacts="toggleContacts"
                />
                <ChatArea
                    v-else
                    ref="chatAreaRef"
                    :selected-contact="selectedContact as Contact"
                    :is-typing="isTyping"
                    :notifications-enabled="notificationsEnabled"
                    @toggle-contacts="toggleContacts"
                    @go-to-account="goToAccount"
                    @go-to-news="goToNews"
                    @go-to-manifesto="goToManifesto"
                    @logout="logout"
                    @send-message="sendMessage"
                    @event-typing="eventTyping"
                    @toggle-notifications="toggleNotifications"
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

@media (max-width: 600px) {
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
