import { ref } from 'vue'

export const score = ref(0)
export const shotsLeft = ref(10)
export const timeLeft = ref(60)
export const powerPercent = ref(0)
export const perfectShot = ref(false)
export const announcement = ref('')

export let announcementTimeout: number | null = null
export let timerInterval: number | null = null

export function showAnnouncement(msg: string, duration = 1000) {
  announcement.value = msg
  if (announcementTimeout) clearTimeout(announcementTimeout)
  announcementTimeout = window.setTimeout(() => {
    announcement.value = ''
  }, duration)
}

export function resetState() {
  score.value = 0
  shotsLeft.value = 10
  timeLeft.value = 60
  perfectShot.value = false
  announcement.value = ''
}