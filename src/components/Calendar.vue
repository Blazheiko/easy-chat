<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

defineOptions({
    name: 'CalendarComponent',
})

const currentDate = ref(new Date())
const selectedDate = ref<Date | null>(null)
const showDateDetails = ref(false)
const dateEvents = ref<
    {
        date: Date
        title: string
        description: string
        startTime?: string
        endTime?: string
    }[]
>([])
const newEvent = ref({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
})
const showAddEventModal = ref(false)

const emit = defineEmits(['toggle-contacts', 'back-to-chat'])

// Месяцы и дни недели
const months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
]
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

// Вычисляемые свойства для текущего месяца и года
const currentMonth = computed(() => currentDate.value.getMonth())
const currentYear = computed(() => currentDate.value.getFullYear())

// Название текущего месяца и год
const currentMonthName = computed(() => {
    return `${months[currentMonth.value]} ${currentYear.value}`
})

// Генерация дней для календаря
const calendarDays = computed(() => {
    const firstDay = new Date(currentYear.value, currentMonth.value, 1)
    const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)

    // Получаем день недели первого дня месяца (0 - воскресенье, 1 - понедельник и т.д.)
    let firstDayOfWeek = firstDay.getDay()
    // Преобразуем для нашего формата (0 - понедельник, 6 - воскресенье)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    const days = []

    // Добавляем дни предыдущего месяца
    const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate()
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        days.push({
            date: new Date(currentYear.value, currentMonth.value - 1, prevMonthLastDay - i),
            isCurrentMonth: false,
            hasEvent: hasEventOnDate(
                new Date(currentYear.value, currentMonth.value - 1, prevMonthLastDay - i),
            ),
        })
    }

    // Добавляем дни текущего месяца
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(currentYear.value, currentMonth.value, i)
        days.push({
            date,
            isCurrentMonth: true,
            isToday: isToday(date),
            hasEvent: hasEventOnDate(date),
        })
    }

    // Добавляем дни следующего месяца
    const remainingDays = 7 - (days.length % 7 || 7)
    if (remainingDays < 7) {
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(currentYear.value, currentMonth.value + 1, i),
                isCurrentMonth: false,
                hasEvent: hasEventOnDate(new Date(currentYear.value, currentMonth.value + 1, i)),
            })
        }
    }

    return days
})

// Проверка, является ли дата сегодняшним днем
function isToday(date: Date): boolean {
    const today = new Date()
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    )
}

// Проверка, есть ли событие на выбранную дату
function hasEventOnDate(date: Date): boolean {
    return dateEvents.value.some(
        (event) =>
            event.date.getDate() === date.getDate() &&
            event.date.getMonth() === date.getMonth() &&
            event.date.getFullYear() === date.getFullYear(),
    )
}

// Получение событий на выбранную дату
const eventsForSelectedDate = computed(() => {
    if (!selectedDate.value) return []

    return dateEvents.value.filter(
        (event) =>
            event.date.getDate() === selectedDate.value!.getDate() &&
            event.date.getMonth() === selectedDate.value!.getMonth() &&
            event.date.getFullYear() === selectedDate.value!.getFullYear(),
    )
})

// Функция для перехода к предыдущему месяцу
function prevMonth() {
    currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

// Функция для перехода к следующему месяцу
function nextMonth() {
    currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

// Выбор даты
function selectDate(date: Date) {
    selectedDate.value = new Date(date)
    showDateDetails.value = true
}

// Вернуться к календарю из детального просмотра
function backToCalendar() {
    showDateDetails.value = false
}

// Открыть модальное окно добавления события
function openAddEventModal() {
    showAddEventModal.value = true
    newEvent.value = { title: '', description: '', startTime: '09:00', endTime: '10:00' }
}

// Добавить новое событие
function addEvent() {
    if (selectedDate.value && newEvent.value.title.trim()) {
        dateEvents.value.push({
            date: new Date(selectedDate.value),
            title: newEvent.value.title,
            description: newEvent.value.description,
            startTime: newEvent.value.startTime,
            endTime: newEvent.value.endTime,
        })

        // Сохраняем события в localStorage
        saveEvents()

        // Закрываем модальное окно
        showAddEventModal.value = false
        newEvent.value = { title: '', description: '', startTime: '09:00', endTime: '10:00' }
    }
}

// Удалить событие
function deleteEvent(index: number) {
    dateEvents.value.splice(index, 1)
    saveEvents()
}

// Сохранение событий в localStorage
function saveEvents() {
    const eventsToSave = dateEvents.value.map((event) => ({
        date: event.date.toISOString(),
        title: event.title,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
    }))

    localStorage.setItem('calendar_events', JSON.stringify(eventsToSave))
}

// Загрузка событий из localStorage
function loadEvents() {
    const savedEvents = localStorage.getItem('calendar_events')
    if (savedEvents) {
        try {
            const parsedEvents = JSON.parse(savedEvents)
            dateEvents.value = parsedEvents.map(
                (event: {
                    date: string
                    title: string
                    description: string
                    startTime?: string
                    endTime?: string
                }) => ({
                    date: new Date(event.date),
                    title: event.title,
                    description: event.description,
                    startTime: event.startTime || '09:00',
                    endTime: event.endTime || '10:00',
                }),
            )
        } catch (e) {
            console.error('Ошибка при загрузке событий календаря:', e)
        }
    }
}

// При монтировании компонента загружаем события
onMounted(() => {
    loadEvents()

    // Если событий нет, добавляем демо-события
    if (dateEvents.value.length === 0) {
        const today = new Date()
        const tomorrow = new Date()
        tomorrow.setDate(today.getDate() + 1)

        const nextWeek = new Date()
        nextWeek.setDate(today.getDate() + 7)

        // Добавляем демо-события
        dateEvents.value = [
            {
                date: today,
                title: 'Встреча с командой',
                description: 'Обсуждение новых функций приложения и планирование спринта',
                startTime: '10:00',
                endTime: '11:30',
            },
            {
                date: today,
                title: 'Обед',
                description: 'Бизнес-ланч с партнерами',
                startTime: '13:00',
                endTime: '14:00',
            },
            {
                date: tomorrow,
                title: 'Созвон с клиентом',
                description: 'Презентация прототипа и обсуждение требований',
                startTime: '15:00',
                endTime: '16:00',
            },
            {
                date: nextWeek,
                title: 'Дедлайн проекта',
                description: 'Финальная версия приложения должна быть сдана',
                startTime: '18:00',
                endTime: '19:00',
            },
        ]

        // Сохраняем события
        saveEvents()
    }
})

// Форматирование даты
function formatDate(date: Date): string {
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

// Массив часов для дневного представления
const hoursOfDay = computed(() => {
    const hours = []
    for (let i = 0; i < 24; i++) {
        hours.push(`${i.toString().padStart(2, '0')}:00`)
    }
    return hours
})

// Добавляем функцию для получения событий для конкретного часа
function getEventsForHour(hour: string) {
    if (!selectedDate.value) return []

    return eventsForSelectedDate.value.filter((event) => {
        if (!event.startTime) return false

        const eventStartHour = parseInt(event.startTime.split(':')[0])
        const currentHour = parseInt(hour.split(':')[0])

        return eventStartHour === currentHour
    })
}

// Функция для форматирования времени в 12-часовом формате (для отображения)
function formatTime(time?: string): string {
    if (!time) return ''

    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)

    if (hour === 0) return `12:${minutes} AM`
    if (hour < 12) return `${hour}:${minutes} AM`
    if (hour === 12) return `12:${minutes} PM`

    return `${hour - 12}:${minutes} PM`
}

// Функция для определения продолжительности события в часах
function getEventDurationInHours(event: { startTime?: string; endTime?: string }): number {
    if (!event.startTime || !event.endTime) return 1

    const [startHours, startMinutes] = event.startTime.split(':').map(Number)
    const [endHours, endMinutes] = event.endTime.split(':').map(Number)

    const startTotalMinutes = startHours * 60 + startMinutes
    const endTotalMinutes = endHours * 60 + endMinutes

    // Возвращаем продолжительность в часах с округлением вверх
    return Math.ceil((endTotalMinutes - startTotalMinutes) / 60)
}

// Функция для выбора цвета события на основе его индекса
function getEventColor(index: number): string {
    const colors = [
        '#4285F4', // Google Blue
        '#EA4335', // Google Red
        '#FBBC05', // Google Yellow
        '#34A853', // Google Green
        '#FF6D01', // Orange
        '#46BDC6', // Teal
        '#7C4DFF', // Purple
        '#795548', // Brown
    ]

    return colors[index % colors.length]
}
</script>

<template>
    <div class="calendar-container">
        <!-- Хедер календаря -->
        <div class="calendar-header">
            <!-- <button class="back-button" @click="emit('back-to-chat')">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                        fill="currentColor"
                    />
                </svg>
                <span>Назад к чату</span>
            </button> -->
            <button class="back-button" @click="emit('toggle-contacts')">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M15 18L9 12L15 6"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </button>
            <h2>Calendar</h2>

        </div>

        <div v-if="!showDateDetails" class="calendar-view">
            <!-- Навигация по месяцам -->
            <div class="month-navigation">
                <button @click="prevMonth" class="nav-button">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
                            fill="currentColor"
                        />
                    </svg>
                </button>
                <h3>{{ currentMonthName }}</h3>
                <button @click="nextMonth" class="nav-button">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
                            fill="currentColor"
                        />
                    </svg>
                </button>
            </div>

            <!-- Дни недели -->
            <div class="weekdays">
                <div class="weekday" v-for="day in weekDays" :key="day">{{ day }}</div>
            </div>

            <!-- Календарная сетка -->
            <div class="calendar-grid">
                <div
                    v-for="(day, index) in calendarDays"
                    :key="index"
                    class="day"
                    :class="{
                        'other-month': !day.isCurrentMonth,
                        today: day.isToday,
                        'has-event': day.hasEvent,
                    }"
                    @click="selectDate(day.date)"
                >
                    {{ day.date.getDate() }}
                    <div v-if="day.hasEvent" class="event-indicator"></div>
                </div>
            </div>
        </div>

        <!-- Детальный просмотр выбранной даты -->
        <div v-else class="date-details">
            <div class="date-details-header">
                <button @click="backToCalendar" class="back-button">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                            fill="currentColor"
                        />
                    </svg>
                    <span>Назад к календарю</span>
                </button>
                <h3>{{ selectedDate ? formatDate(selectedDate) : '' }}</h3>
                <button @click="openAddEventModal" class="add-event-button">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                    </svg>
                    <span>Добавить</span>
                </button>
            </div>

            <div class="events-list" v-if="eventsForSelectedDate.length === 0">
                <div class="no-events">На выбранную дату нет событий</div>
            </div>

            <div v-else class="day-timeline">
                <div v-for="hour in hoursOfDay" :key="hour" class="hour-block">
                    <div class="hour-label">{{ hour }}</div>
                    <div class="hour-content">
                        <div
                            v-for="(event, idx) in getEventsForHour(hour)"
                            :key="idx"
                            class="timeline-event"
                            :style="{
                                height: `${getEventDurationInHours(event) * 60}px`,
                                backgroundColor: getEventColor(idx),
                            }"
                        >
                            <div class="event-time">
                                {{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}
                            </div>
                            <div class="event-title">{{ event.title }}</div>
                            <div class="event-description">{{ event.description }}</div>
                            <button
                                @click="deleteEvent(dateEvents.indexOf(event))"
                                class="delete-timeline-event"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Модальное окно добавления события -->
        <div v-if="showAddEventModal" class="modal-overlay" @click="showAddEventModal = false">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Добавить событие</h3>
                    <button class="close-modal" @click="showAddEventModal = false">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="event-title">Название</label>
                        <input
                            id="event-title"
                            v-model="newEvent.title"
                            type="text"
                            placeholder="Введите название события"
                        />
                    </div>
                    <div class="form-group">
                        <label for="event-description">Описание</label>
                        <textarea
                            id="event-description"
                            v-model="newEvent.description"
                            placeholder="Введите описание события"
                        ></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group half">
                            <label for="event-start-time">Время начала</label>
                            <input id="event-start-time" v-model="newEvent.startTime" type="time" />
                        </div>
                        <div class="form-group half">
                            <label for="event-end-time">Время окончания</label>
                            <input id="event-end-time" v-model="newEvent.endTime" type="time" />
                        </div>
                    </div>
                    <div class="form-actions">
                        <button @click="showAddEventModal = false" class="cancel-button">
                            Отмена
                        </button>
                        <button @click="addEvent" class="save-button">Сохранить</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.calendar-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--background-color, white);
    overflow: hidden;
}

.dark-theme .calendar-container {
    background-color: #1e1e1e;
}

.calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
    background-color: var(--primary-color, #1a73e8);
    color: white;
}

.calendar-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
}

.back-button,
.menu-button {
    background: transparent;
    border: none;
    padding: 8px;
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: opacity 0.2s;
}

.back-button svg,
.menu-button svg {
    width: 24px;
    height: 24px;
}

.back-button:hover,
.menu-button:hover {
    opacity: 0.8;
}

.calendar-view {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.month-navigation {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.month-navigation h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: var(--text-color, #333);
}

.dark-theme .month-navigation h3 {
    color: #e0e0e0;
}

.nav-button {
    background: transparent;
    border: none;
    padding: 8px;
    border-radius: 50%;
    cursor: pointer;
    color: var(--text-color, #333);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
}

.dark-theme .nav-button {
    color: #e0e0e0;
}

.nav-button svg {
    width: 24px;
    height: 24px;
}

.nav-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.dark-theme .nav-button:hover {
    background-color: rgba(255, 255, 255, 0.05);
}

.weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 10px;
}

.weekday {
    text-align: center;
    font-weight: 500;
    font-size: 14px;
    color: #6c757d;
    padding: 8px 0;
}

.dark-theme .weekday {
    color: #adb5bd;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
}

.day {
    position: relative;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-color, #333);
    transition: all 0.2s ease;
}

.dark-theme .day {
    color: #e0e0e0;
}

.day:hover {
    background-color: rgba(26, 115, 232, 0.1);
}

.day.other-month {
    color: #adb5bd;
}

.dark-theme .day.other-month {
    color: #6c757d;
}

.day.today {
    background-color: var(--primary-color, #1a73e8);
    color: white;
    font-weight: 500;
}

.day.has-event {
    font-weight: 500;
}

.event-indicator {
    position: absolute;
    bottom: 4px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: var(--primary-color, #1a73e8);
}

.day.today .event-indicator {
    background-color: white;
}

/* Стили для детального просмотра даты */
.date-details {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.date-details-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.date-details-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: var(--text-color, #333);
}

.dark-theme .date-details-header h3 {
    color: #e0e0e0;
}

.add-event-button {
    background-color: var(--primary-color, #1a73e8);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
}

.add-event-button svg {
    width: 18px;
    height: 18px;
}

.add-event-button:hover {
    background-color: var(--accent-color, #1565c0);
}

.events-list {
    flex: 1;
}

.no-events {
    text-align: center;
    padding: 40px 0;
    color: #6c757d;
    font-size: 16px;
}

.dark-theme .no-events {
    color: #adb5bd;
}

.event-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding: 16px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dark-theme .event-item {
    background-color: #2a2a2a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.event-content {
    flex: 1;
    overflow: hidden;
}

.event-content h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 500;
    color: var(--text-color, #333);
}

.dark-theme .event-content h4 {
    color: #e0e0e0;
}

.event-content p {
    margin: 0;
    font-size: 14px;
    color: #6c757d;
    line-height: 1.5;
}

.dark-theme .event-content p {
    color: #adb5bd;
}

.delete-event {
    background: none;
    border: none;
    padding: 8px;
    color: #dc3545;
    cursor: pointer;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
}

.delete-event svg {
    width: 18px;
    height: 18px;
}

.delete-event:hover {
    background-color: rgba(220, 53, 69, 0.1);
}

/* Модальное окно */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    border-radius: 12px;
    padding: 24px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.dark-theme .modal-content {
    background-color: #2a2a2a;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color, #333);
}

.dark-theme .modal-header h3 {
    color: #e0e0e0;
}

.close-modal {
    background: transparent;
    border: none;
    padding: 8px;
    cursor: pointer;
    color: var(--text-color, #333);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
}

.dark-theme .close-modal {
    color: #e0e0e0;
}

.close-modal svg {
    width: 20px;
    height: 20px;
}

.close-modal:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.dark-theme .close-modal:hover {
    background-color: rgba(255, 255, 255, 0.05);
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-color, #333);
}

.dark-theme .form-group label {
    color: #e0e0e0;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 8px;
    font-size: 14px;
    background-color: white;
    color: var(--text-color, #333);
    outline: none;
}

.dark-theme .form-group input,
.dark-theme .form-group textarea {
    background-color: #333;
    border-color: #444;
    color: #e0e0e0;
}

.form-group textarea {
    height: 100px;
    resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
    border-color: var(--primary-color, #1a73e8);
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1);
}

.dark-theme .form-group input:focus,
.dark-theme .form-group textarea:focus {
    box-shadow: 0 0 0 2px rgba(100, 181, 246, 0.2);
}

.form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.cancel-button,
.save-button {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.cancel-button {
    background-color: #e9ecef;
    color: #6c757d;
}

.dark-theme .cancel-button {
    background-color: #444;
    color: #adb5bd;
}

.save-button {
    background-color: var(--primary-color, #1a73e8);
    color: white;
}

.cancel-button:hover {
    background-color: #dee2e6;
}

.dark-theme .cancel-button:hover {
    background-color: #555;
}

.save-button:hover {
    background-color: var(--accent-color, #1565c0);
}

@media (max-width: 768px) {
    .calendar-header {
        padding: 12px 16px;
    }

    .calendar-view {
        padding: 16px;
    }

    .date-details {
        padding: 16px;
    }

    .day {
        height: 36px;
        font-size: 13px;
    }

    .add-event-button,
    .back-button {
        padding: 6px 12px;
        font-size: 13px;
    }

    .back-button svg {
        width: 20px;
        height: 20px;
    }

    .add-event-button svg {
        width: 16px;
        height: 16px;
    }

    .event-item {
        padding: 12px;
    }

    .month-navigation h3,
    .date-details-header h3 {
        font-size: 16px;
    }

    .modal-content {
        padding: 16px;
    }
}

/* Стили для временной шкалы дня */
.day-timeline {
    flex: 1;
    overflow-y: auto;
    position: relative;
    padding: 0 20px;
}

.hour-block {
    display: flex;
    min-height: 60px;
    border-bottom: 1px solid #f0f0f0;
    position: relative;
}

.dark-theme .hour-block {
    border-bottom: 1px solid #333;
}

.hour-block:last-child {
    border-bottom: none;
}

.hour-label {
    width: 60px;
    padding: 10px 10px 10px 0;
    font-size: 12px;
    color: #6c757d;
    text-align: right;
    flex-shrink: 0;
}

.dark-theme .hour-label {
    color: #adb5bd;
}

.hour-content {
    flex: 1;
    position: relative;
    padding: 5px 0;
    min-height: 60px;
}

.timeline-event {
    position: relative;
    padding: 10px;
    border-radius: 5px;
    color: white;
    margin-bottom: 5px;
    overflow: hidden;
    cursor: pointer;
    z-index: 1;
    transition: all 0.2s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.timeline-event:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.event-time {
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 5px;
    opacity: 0.9;
}

.event-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
}

.event-description {
    font-size: 12px;
    opacity: 0.85;
    word-break: break-word;
}

.delete-timeline-event {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(0, 0, 0, 0.1);
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
}

.timeline-event:hover .delete-timeline-event {
    opacity: 1;
}

.delete-timeline-event svg {
    width: 16px;
    height: 16px;
    color: white;
}

.form-row {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
}

.form-group.half {
    flex: 1;
    margin-bottom: 0;
}
</style>
