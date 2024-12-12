import * as Tone from 'tone'

class Piano {
  private playCallback?: (note: string) => void
  private releaseCallback?: (note: string) => void
  private sampler?: Tone.Sampler

  constructor() {
    console.log('Piano constructor')
  }

  async init() {
    await Tone.start()

    const sampler = new Tone.Sampler({
      urls: {
        A0: 'A0.mp3',
        C1: 'C1.mp3',
        'D#1': 'Ds1.mp3',
        'F#1': 'Fs1.mp3',
        A1: 'A1.mp3',
        C2: 'C2.mp3',
        'D#2': 'Ds2.mp3',
        'F#2': 'Fs2.mp3',
        A2: 'A2.mp3',
        C3: 'C3.mp3',
        'D#3': 'Ds3.mp3',
        'F#3': 'Fs3.mp3',
        A3: 'A3.mp3',
        C4: 'C4.mp3',
        'D#4': 'Ds4.mp3',
        'F#4': 'Fs4.mp3',
        A4: 'A4.mp3',
        C5: 'C5.mp3',
        'D#5': 'Ds5.mp3',
        'F#5': 'Fs5.mp3',
        A5: 'A5.mp3',
        C6: 'C6.mp3',
        'D#6': 'Ds6.mp3',
        'F#6': 'Fs6.mp3',
        A6: 'A6.mp3',
        C7: 'C7.mp3',
        'D#7': 'Ds7.mp3',
        'F#7': 'Fs7.mp3',
        A7: 'A7.mp3',
        C8: 'C8.mp3'
      },
      release: 32,
      baseUrl: 'https://tonejs.github.io/audio/salamander/'
    }).toDestination()

    this.sampler = sampler

    this.playCallback = (note: string) => {
      sampler.triggerAttack(note)
    }

    this.releaseCallback = (note: string) => {
      sampler.triggerRelease(note)
    }
  }

  play(note: string) {
    if (!this.playCallback) {
      return
    }

    this.playCallback(note)
  }

  release(note: string) {
    if (!this.releaseCallback) {
      return
    }

    this.releaseCallback(note)
  }

  setVolume(volume: number) {
    if (!this.sampler) {
      return
    }

    this.sampler.volume.value = this.normalizeVolume(volume)
  }

  private normalizeVolume(volume: number) {
    return volume ** 2 * (3 - 2 * volume) * 40 - 20
  }
}

export { Piano }
