<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Отслеживание ширины окна
const windowWidth = ref(window.innerWidth)

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('click', handleClickOutside)
})

// Состояние меню
const isMenuOpen = ref(false)

// Управление меню
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

// Обработчик клика вне меню
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (isMenuOpen.value && !target.closest('.menu-container')) {
    closeMenu()
  }
}

// Вернуться к списку новостей
const backHome = () => {
  router.back()
}

// Переход в аккаунт
const goToAccount = () => {
  router.push('/account')
}

// Выход из аккаунта
const logout = () => {
  localStorage.removeItem('user')
  router.push('/')
}
</script>
<template>
  <div class="news-detail-page">
    <header class="news-header">
      <div class="header-content">
        <button class="back-button" @click="backHome">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          <span>Back to News</span>
        </button>
        <div class="menu-container">
          <button class="menu-button" @click.stop="toggleMenu">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="white"
            >
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
            <span>Menu</span>
            <svg
              class="arrow-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="white"
            >
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>

          <div class="dropdown-menu" :class="{ show: isMenuOpen }">
            <button class="menu-item" @click="goToAccount">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
              My Account
            </button>
            <button class="menu-item" @click="logout">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path
                  d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="content-wrapper">
      <div class="content-container">
        <div class="news-item">
          <div class="news-item-content">
            <h1 class="manifesto-title">MANIFESTO OF A FREE SOCIAL NETWORK</h1>

            <div class="manifesto-point">
              <div class="point-number">1</div>
              <div class="point-content">
                <h3>Freedom of Speech, Respect, and Responsibility</h3>
                <p>
                  A free social network ensures every user the right to freely express their
                  thoughts, opinions, and ideas without censorship within their circle of friends.
                  However, users must show respect for others and take responsibility for their
                  words to prevent the abuse of free speech.
                </p>
              </div>
            </div>

            <div class="manifesto-point">
              <div class="point-number">2</div>
              <div class="point-content">
                <h3>Transparency, Openness, and Accountability</h3>
                <p>
                  Users have the right to know how their news feed is formed. The platform excludes
                  any algorithmic manipulations—users receive news only from their circle of
                  friends, without hidden priorities or promotions.
                </p>
              </div>
            </div>

            <div class="manifesto-point">
              <div class="point-number">3</div>
              <div class="point-content">
                <h3>Decentralization, Independence, and Compatibility</h3>
                <p>
                  A free social network avoids monopolization and control by a single corporation or
                  state. It is supported by user donations, without involving advertisers and
                  without the goal of generating commercial profit. Open standards and protocols are
                  used to prevent dependence on a single platform.
                </p>
              </div>
            </div>

            <div class="manifesto-point">
              <div class="point-number">4</div>
              <div class="point-content">
                <h3>Privacy, Data Protection, and the Right to Deletion</h3>
                <p>
                  User data belongs to the users themselves. Any transfer of data to third parties
                  is possible only with user consent. Encryption of messages and personal data is a
                  standard. Users must have the ability to easily delete their data and accounts.
                </p>
              </div>
            </div>

            <div class="manifesto-point">
              <div class="point-number">5</div>
              <div class="point-content">
                <h3>No Advertising and Commercial Control</h3>
                <p>
                  A free social network strictly excludes advertisements and commercial algorithms
                  that impose content. The absence of advertising promotes more honest and open
                  communication. Support can be provided through voluntary contributions,
                  decentralized funding models, or transparent paid features.
                </p>
              </div>
            </div>

            <div class="manifesto-point">
              <div class="point-number">6</div>
              <div class="point-content">
                <h3>Fair and Voluntary Moderation Process</h3>
                <p>
                  Users decide which news from which people and with what priority appears in their
                  feed. Moderators should be elected from among the users and act in the interests
                  of the community. Transparent mechanisms for submitting complaints and appealing
                  moderation decisions must be provided.
                </p>
              </div>
            </div>

            <div class="manifesto-point">
              <div class="point-number">7</div>
              <div class="point-content">
                <h3>Accessibility, Inclusivity, and Protection of Minors</h3>
                <p>
                  A free social network should be accessible to all, regardless of social status,
                  nationality, age, or physical abilities. The interface should consider the needs
                  of different groups, support multilingualism, and be adapted for people with
                  disabilities. Measures must be implemented to protect minors.
                </p>
              </div>
            </div>

            <div class="manifesto-point">
              <div class="point-number">8</div>
              <div class="point-content">
                <h3>Exclusion of Manipulation and Algorithmic Control</h3>
                <p>
                  News and updates are displayed exclusively from the user's circle of friends.
                  There are no algorithms that promote content or hide publications based on
                  commercial interests. Users must have the ability to verify and confirm the
                  authenticity of information.
                </p>
              </div>
            </div>

            <div class="manifesto-point">
              <div class="point-number">9</div>
              <div class="point-content">
                <h3>Self-Governance, User Participation, and Democratic Mechanisms</h3>
                <p>
                  The user community must participate in the governance of the social network
                  through democratic mechanisms, including voting, regular surveys, and discussions
                  on important platform development issues.
                </p>
              </div>
            </div>

            <div class="manifesto-point">
              <div class="point-number">10</div>
              <div class="point-content">
                <h3>Combating Disinformation, Harassment, and Illegal Content</h3>
                <p>
                  Despite freedom of speech, the social network must combat the spread of
                  deliberately false information, fraud, and harassment. The community should have
                  tools for rapid response, as well as self-regulation mechanisms and transparent
                  verification processes. The platform is obligated to promptly remove illegal
                  content, including hate speech and incitement to violence.
                </p>
              </div>
            </div>

            <div class="manifesto-point">
              <div class="point-number">11</div>
              <div class="point-content">
                <h3>Information Hygiene, Digital Literacy, and Educational Initiatives</h3>
                <p>
                  Modern users must approach content consumption consciously. A free social network
                  encourages critical thinking, source verification, and responsible information
                  sharing. The implementation of educational initiatives and built-in tools will
                  help users navigate the information flow without overload and manipulation.
                </p>
              </div>
            </div>

            <div class="manifesto-point">
              <div class="point-number">12</div>
              <div class="point-content">
                <h3>Cooperation with Regulators and Ensuring Legality</h3>
                <p>
                  The platform must comply with legal requirements, including the Digital Services
                  Act (DSA). This includes complaint mechanisms, user identification, personal data
                  protection, and cooperation with regulators to ensure digital security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.news-detail-page {
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  background: linear-gradient(135deg, #f1f6ff 0%, #e5eeff 50%, #d8e8ff 100%);
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.news-header {
  width: 100%;
  background: linear-gradient(90deg, #1a73e8 0%, #4285f4 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(26, 115, 232, 0.2);
  box-sizing: border-box;
  display: flex;
  justify-content: center;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  max-width: 1400px;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #c1c9d6 transparent;
  width: 100%;
  display: flex;
  justify-content: center;
}

.content-container {
  width: 100%;
  max-width: 1400px;
  padding: 24px;
  box-sizing: border-box;
}

.back-button {
  padding: 8px 15px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.back-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: white;
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.back-button:active {
  transform: translateY(0);
  opacity: 0.9;
}

.menu-container {
  position: relative;
}

.menu-button {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: white;
  padding: 8px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.menu-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: white;
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.menu-button:active {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(0);
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
  color: #212529;
  border-radius: 8px;
  margin: 4px 8px;
  width: calc(100% - 16px);
  font-weight: 500;
  font-size: 14px;
}

.menu-item:last-child {
  color: #dc3545;
}

.menu-item:hover {
  background-color: #f8f9fa;
  transform: translateY(-1px);
}

.menu-item:active {
  transform: translateY(0);
}

.content-wrapper::-webkit-scrollbar {
  width: 6px;
}

.content-wrapper::-webkit-scrollbar-track {
  background: transparent;
  margin: 10px 0;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(26, 115, 232, 0.4);
  border-radius: 6px;
}

.content-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: rgba(26, 115, 232, 0.7);
}

.news-item {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 24px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.news-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
}

.news-item-content {
  padding: 30px;
}

.manifesto-title {
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 40px;
  text-align: center;
  color: #1a73e8;
  letter-spacing: 1px;
  position: relative;
  padding-bottom: 15px;
  text-transform: uppercase;
}

.manifesto-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 4px;
  background: linear-gradient(90deg, #1a73e8, #4285f4);
  border-radius: 2px;
}

.manifesto-point {
  display: flex;
  margin-bottom: 30px;
  padding-bottom: 25px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.manifesto-point:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.point-number {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #1a73e8, #4285f4);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 20px;
  margin-right: 20px;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(26, 115, 232, 0.2);
}

.point-content {
  flex: 1;
}

.point-content h3 {
  color: #1a73e8;
  margin: 0 0 15px;
  font-size: 24px;
  font-weight: 600;
}

.point-content p {
  margin: 0;
  line-height: 1.8;
  color: #4a4a4a;
  font-size: 18px;
}

@media (max-width: 768px) {
  .news-page {
    overflow-x: hidden;
  }

  .news-header {
    width: 100%;
  }

  .header-content {
    flex-wrap: wrap;
    padding: 15px 10px;
  }

  .back-button span {
    display: none;
  }

  .back-button {
    padding: 8px;
    border-radius: 8px;
    justify-content: center;
  }

  .menu-button span {
    display: none;
  }

  .arrow-icon {
    display: none;
  }

  .content-container {
    padding: 15px 10px;
  }

  .content-wrapper::-webkit-scrollbar {
    width: 0;
    display: none;
  }

  .news-item {
    margin: 0 0 8px 0;
    border-radius: 12px;
  }

  .news-item:hover {
    transform: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .news-item-content {
    padding: 20px 15px;
  }

  .manifesto-title {
    font-size: 28px;
    margin-bottom: 30px;
  }

  .manifesto-point {
    margin-bottom: 25px;
    padding-bottom: 20px;
  }

  .point-number {
    width: 36px;
    height: 36px;
    font-size: 18px;
    margin-right: 15px;
  }

  .point-content h3 {
    font-size: 20px;
    margin-bottom: 10px;
  }

  .point-content p {
    font-size: 16px;
    line-height: 1.7;
  }
}

@media (min-width: 768px) and (max-width: 1200px) {
  .header-content,
  .content-container {
    max-width: 1000px;
  }

  .manifesto-title {
    font-size: 32px;
  }

  .point-content h3 {
    font-size: 22px;
  }

  .point-content p {
    font-size: 17px;
  }
}
</style>
