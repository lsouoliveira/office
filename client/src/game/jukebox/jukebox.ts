enum JukeboxState {
  PAUSED,
  PLAYING
}

class Jukebox {
  private sheetQueue: any[]
  private state: JukeboxState
  private currentNoteIndex: number
  private timer: number
  private sheet?: any

  constructor() {
    this.sheetQueue = []
    this.state = JukeboxState.PAUSED
    this.currentNoteIndex = 0
    this.timer = 0
  }

  update(dt: number) {
    if (this.state !== JukeboxState.PLAYING || !this.sheet) return

    this.timer += dt

    while (this.sheet && this.currentNoteIndex < this.sheet.symbols.length) {
      const symbol = this.sheet.symbols[this.currentNoteIndex]

      if (symbol.type == 0) {
        this.currentNoteIndex++
        this.playNotes([symbol.noteName])
      } else if (symbol.type == 1) {
        this.currentNoteIndex++
        this.playNotes([symbol.notes.map((note: any) => note.noteName)])
      } else if (symbol.type == 2) {
        if (this.timer >= symbol.duration / 1000) {
          this.timer = 0
          this.currentNoteIndex++
        } else {
          break
        }
      }
    }

    if (this.currentNoteIndex >= this.sheet.symbols.length) {
      this.state = JukeboxState.PAUSED
      this.currentNoteIndex = 0
      this.sheet = undefined
      this.playNextSheet()
    }
  }

  play(sheet: any) {
    const sheetFound = this.sheetQueue.find((s) => s.id == sheet.id)

    if (sheetFound) {
      return
    }

    this.sheetQueue.push(sheet)
    this.playNextSheet()
  }

  playNextSheet() {
    if (this.sheetQueue.length > 0 && this.state === JukeboxState.PAUSED) {
      const sheet = this.sheetQueue.shift()

      if (sheet) {
        this.state = JukeboxState.PLAYING
        this.currentNoteIndex = 0
        this.sheet = sheet
      }
    }
  }

  private playNotes(notes: any[]) {
    notes.forEach((n) => {
      window.dispatchEvent(new CustomEvent('ui:note_played', { detail: { note: n } }))
    })
  }
}

export { Jukebox }
