import { defineStore } from 'pinia'

export const useAudioStore = defineStore('audio', {
  state: () => ({
    isPlaying: false,
    audio: null,
  }),
  actions: {
    init() {
      if (!this.audio) {
        this.audio = new Audio('/bgm.mp3')
        this.audio.loop = true
        this.audio.volume = 0.3
      }
    },
    play() {
      this.init()
      this.isPlaying = true
      return this.audio.play().catch(() => {
        this.isPlaying = false
      })
    },
    pause() {
      if (this.audio) {
        this.audio.pause()
        this.isPlaying = false
      }
    },
    toggle() {
      if (this.isPlaying) {
        this.pause()
      } else {
        this.play()
      }
    },
  },
})
