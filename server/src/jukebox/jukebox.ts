import logger from '../logger'

const WHITE_KEYS = [
  'C2',
  'D2',
  'E2',
  'F2',
  'G2',
  'A2',
  'B2',
  'C3',
  'D3',
  'E3',
  'F3',
  'G3',
  'A3',
  'B3',
  'C4',
  'D4',
  'E4',
  'F4',
  'G4',
  'A4',
  'B4',
  'C5',
  'D5',
  'E5',
  'F5',
  'G5',
  'A5',
  'B5',
  'C6',
  'D6',
  'E6',
  'F6',
  'G6',
  'A6',
  'B6',
  'C7'
]

const BLACK_KEYS = [
  'C#2',
  'D#2',
  'F#2',
  'G#2',
  'A#2',
  'C#3',
  'D#3',
  'F#3',
  'G#3',
  'A#3',
  'C#4',
  'D#4',
  'F#4',
  'G#4',
  'A#4',
  'C#5',
  'D#5',
  'F#5',
  'G#5',
  'A#5',
  'C#6',
  'D#6',
  'F#6',
  'G#6',
  'A#6'
]

const WHITE_KEY_SHORCUTS = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '0',
  'q',
  'w',
  'e',
  'r',
  't',
  'y',
  'u',
  'i',
  'o',
  'p',
  'a',
  's',
  'd',
  'f',
  'g',
  'h',
  'j',
  'k',
  'l',
  'z',
  'x',
  'c',
  'v',
  'b',
  'n',
  'm'
]

const BLACK_KEY_SHORTCUTS = [
  '!',
  '@',
  '$',
  '%',
  '^',
  '*',
  '(',
  'Q',
  'W',
  'E',
  'T',
  'Y',
  'I',
  'O',
  'P',
  'S',
  'D',
  'G',
  'H',
  'J',
  'L',
  'Z',
  'C',
  'V',
  'B'
]

enum PauseDuration {
  SHORTEST = 100,
  SHORTER = 180,
  SHORT = 360,
  PAUSE = 800,
  LONG = 1000,
  LONGER = 1100,
  LONGEST = 1600,
  BREAK = 400
}

enum SymbolType {
  NOTE,
  COMPOUND_NOTE,
  PAUSE
}

class Symbol {
  readonly type: SymbolType

  constructor(type: SymbolType) {
    this.type = type
  }
}

class PauseSymbol extends Symbol {
  readonly duration: PauseDuration

  constructor(duration: PauseDuration) {
    super(SymbolType.PAUSE)

    this.duration = duration
  }
}

class NoteSymbol extends Symbol {
  readonly key: string

  constructor(key: string) {
    super(SymbolType.NOTE)

    this.key = key
  }
}

class CompoundNoteSymbol extends Symbol {
  readonly notes: NoteSymbol[]

  constructor(notes: NoteSymbol[]) {
    super(SymbolType.COMPOUND_NOTE)

    this.notes = notes
  }
}

class Sheet {
  private symbols: Symbol[]

  constructor(symbols: Symbol[]) {
    this.symbols = symbols
  }

  getSymbolCount() {
    return this.symbols.length
  }

  getSymbol(index: number) {
    return this.symbols[index]
  }

  getSymbols() {
    return [...this.symbols]
  }

  toSymbolTypes() {
    return this.symbols.map((symbol) => symbol.type)
  }
}

class SheetParser {
  private input: string

  constructor(input: string) {
    this.input = input
  }

  parse(): Sheet {
    const symbols: Symbol[] = []
    let currentIndex = 0

    while (currentIndex < this.input.length) {
      let remainingInput = this.input.slice(currentIndex)

      if (remainingInput.match(/^\[[1-9a-z0-9!@$%^()*QWERTYUIOPASDFGHJZCVBNM]+\]/)) {
        currentIndex = this.parseSimultaneousNotes(remainingInput, symbols, currentIndex)
        remainingInput = this.input.slice(currentIndex)

        if (this.hasNoteNext(remainingInput)) {
          symbols.push(new PauseSymbol(PauseDuration.SHORTER))
        }
      } else if (
        remainingInput.match(
          /^\[([1-9a-z0-9!@$%^()*QWERTYUIOPASDFGHJZCVBNM] *)*[1-9a-z0-9!@$%^()*QWERTYUIOPASDFGHJZCVBNM]\]/
        )
      ) {
        currentIndex = this.parseShortestPauseNotes(remainingInput, symbols, currentIndex)
        remainingInput = this.input.slice(currentIndex)

        if (this.hasNoteNext(remainingInput)) {
          symbols.push(new PauseSymbol(PauseDuration.SHORTER))
        }
      } else if (remainingInput.match(/^[1-9a-z0-9!@$%^()*QWERTYUIOPASDFGHJZCVBNM]+/)) {
        currentIndex = this.parseShorterPauseNotes(remainingInput, symbols, currentIndex)
        remainingInput = this.input.slice(currentIndex)

        if (this.hasNoteNext(remainingInput)) {
          symbols.push(new PauseSymbol(PauseDuration.SHORTER))
        }
      } else if (remainingInput.match(/^[1-9a-z0-9!@$%^()*QWERTYUIOPASDFGHJZCVBNM]/)) {
        currentIndex = this.parseSingleNote(remainingInput, symbols, currentIndex)
        remainingInput = this.input.slice(currentIndex)

        if (this.hasNoteNext(remainingInput)) {
          symbols.push(new PauseSymbol(PauseDuration.SHORTER))
        }
      } else if (remainingInput.match(/^\| +\|/)) {
        currentIndex = this.parseLongestPause(remainingInput, symbols, currentIndex)
      } else if (remainingInput.match(/^ +\| +/)) {
        currentIndex = this.parseLongerPause(remainingInput, symbols, currentIndex)
      } else if (remainingInput.match(/^\| +/)) {
        currentIndex = this.parseLongPause(remainingInput, symbols, currentIndex)
      } else if (remainingInput.match(/^\|/)) {
        currentIndex = this.parsePause(remainingInput, symbols, currentIndex)
      } else if (remainingInput.match(/^ +/)) {
        currentIndex = this.parseShortPause(remainingInput, symbols, currentIndex)
      } else if (remainingInput.match(/^\n/)) {
        if (symbols.length > 0 && !(symbols[symbols.length - 1] instanceof PauseSymbol)) {
          symbols.push(new PauseSymbol(PauseDuration.BREAK))
        }
        currentIndex++
      } else {
        return new Sheet(symbols)
      }
    }

    return new Sheet(symbols)
  }

  private hasNoteNext(remainingInput: string) {
    return (
      remainingInput.match(/^\[[1-9a-z0-9!@$%^()*QWERTYUIOPASDFGHJZCVBNM]+\]/) ||
      remainingInput.match(
        /^\[([1-9a-z0-9!@$%^()*QWERTYUIOPASDFGHJZCVBNM] *)*[1-9a-z0-9!@$%^()*QWERTYUIOPASDFGHJZCVBNM]\]/
      ) ||
      remainingInput.match(/^[1-9a-z0-9!@$%^()*QWERTYUIOPASDFGHJZCVBNM]/)
    )
  }

  private parseSimultaneousNotes(input: string, symbols: Symbol[], currentIndex: number): number {
    const match = input.match(/^\[([1-9a-z0-9!@$%^()*QWERTYUIOPASDFGHJZCVBNM]+)\]/)
    if (match) {
      const notes = match[1].split('')
      symbols.push(new CompoundNoteSymbol(notes.map((note) => new NoteSymbol(note))))
      return currentIndex + match[0].length
    }
    throw new Error('Unexpected parsing error for simultaneous notes.')
  }

  private parseShortestPauseNotes(input: string, symbols: Symbol[], currentIndex: number): number {
    const match = input.match(/^\[([1-9a-z0-9!@$%^()*QWERTYUIOPASDFGHJZCVBNM](?: *)?)+\]/)
    if (match) {
      const notes = match[0].slice(1, -1).trim().split(/\s+/)
      notes.forEach((note) => {
        symbols.push(new NoteSymbol(note))
        symbols.push(new PauseSymbol(PauseDuration.SHORTEST))
      })
      symbols.pop()
      return currentIndex + match[0].length
    }
    throw new Error('Unexpected parsing error for shortest pauses.')
  }

  private parseShorterPauseNotes(input: string, symbols: Symbol[], currentIndex: number): number {
    const match = input.match(/^[1-9a-z0-9!@$%^()*QWERTYUIOPASDFGHJZCVBNM]+/)
    if (match) {
      const notes = match[0].split('')
      notes.forEach((note) => {
        symbols.push(new NoteSymbol(note))
        symbols.push(new PauseSymbol(PauseDuration.SHORTER))
      })
      symbols.pop()
      return currentIndex + match[0].length
    }
    throw new Error('Unexpected parsing error for shorter pauses.')
  }

  private parseSingleNote(input: string, symbols: Symbol[], currentIndex: number): number {
    const match = input.match(/^[1-9a-z0-9!@$%^()*QWERTYUIOPASDFGHJZCVBNM]/)
    if (match) {
      symbols.push(new NoteSymbol(match[0]))
      return currentIndex + match[0].length
    }
    throw new Error('Unexpected parsing error for single note.')
  }

  private parseLongestPause(input: string, symbols: Symbol[], currentIndex: number): number {
    symbols.push(new PauseSymbol(PauseDuration.LONGEST))
    return currentIndex + input.indexOf('|', 1) + 1
  }

  private parseLongPause(input: string, symbols: Symbol[], currentIndex: number): number {
    const match = input.match(/^\|( +)/)
    if (match) {
      symbols.push(new PauseSymbol(PauseDuration.LONG))
      return currentIndex + match[0].length
    }
    throw new Error('Unexpected parsing error for long pause.')
  }

  private parseLongerPause(input: string, symbols: Symbol[], currentIndex: number): number {
    const match = input.match(/^ +\| +/)
    if (match) {
      symbols.push(new PauseSymbol(PauseDuration.LONGER))
      return currentIndex + match[0].length
    }
    throw new Error('Unexpected parsing error for longer pause.')
  }

  private parsePause(_input: string, symbols: Symbol[], currentIndex: number): number {
    symbols.push(new PauseSymbol(PauseDuration.PAUSE))

    return currentIndex + 1
  }

  private parseShortPause(input: string, symbols: Symbol[], currentIndex: number): number {
    const match = input.match(/^ +/)
    if (match) {
      symbols.push(new PauseSymbol(PauseDuration.SHORT))
      return currentIndex + match[0].length
    }
    return currentIndex
  }
}

enum JukeboxState {
  PAUSED,
  PLAYING
}

class Jukebox {
  private io: any
  private requesterId?: string
  private timer: number = 0
  private state: JukeboxState
  private currentNoteIndex: number = 0
  private sheetQueue: [string, string][] = []
  private sheet?: Sheet

  constructor(io: any) {
    this.io = io
    this.state = JukeboxState.PAUSED
  }

  update(dt: number) {
    if (this.state !== JukeboxState.PLAYING || !this.sheet) return

    this.timer += dt
    while (this.sheet && this.currentNoteIndex < this.sheet.getSymbolCount()) {
      const symbol = this.sheet.getSymbol(this.currentNoteIndex)

      if (symbol instanceof NoteSymbol) {
        this.currentNoteIndex++
        this.playNoteSymbol([symbol])
      } else if (symbol instanceof CompoundNoteSymbol) {
        this.currentNoteIndex++
        this.playNoteSymbol(symbol.notes)
      } else if (symbol instanceof PauseSymbol) {
        const pauseSymbol = symbol as PauseSymbol

        if (this.timer >= pauseSymbol.duration / 1000) {
          this.timer = 0
          this.currentNoteIndex++
        } else {
          break
        }
      }
    }

    if (this.currentNoteIndex >= this.sheet.getSymbolCount()) {
      this.state = JukeboxState.PAUSED
      this.currentNoteIndex = 0
      this.sheet = undefined
      this.playNextSheet()
    }
  }

  play(requesterId: string, sheet: string) {
    this.sheetQueue.push([requesterId, sheet])

    if (this.state === JukeboxState.PAUSED) {
      this.playNextSheet()
    }
  }

  skip() {
    this.sheet = undefined
    this.state = JukeboxState.PAUSED

    this.playNextSheet()
  }

  private playNextSheet() {
    if (this.sheetQueue.length > 0 && this.state === JukeboxState.PAUSED) {
      const nextSheet = this.sheetQueue.shift()

      if (nextSheet) {
        const [requesterId, sheet] = nextSheet

        this.state = JukeboxState.PLAYING
        this.currentNoteIndex = 0
        this.requesterId = requesterId

        const sheetParser = new SheetParser(sheet)
        this.sheet = sheetParser.parse()
      }
    }
  }

  private playNoteSymbol(notes: NoteSymbol[]) {
    const noteNames = notes.map((note) => this.getNoteName(note.key)).filter((noteName) => noteName)

    if (!noteNames.length) {
      return
    }

    this.io.emit('player:notePlayed', {
      playerId: this.requesterId,
      note: noteNames,
      broadcast: true
    })
  }

  private getNoteName(key: string) {
    if (WHITE_KEY_SHORCUTS.indexOf(key) != -1) {
      return WHITE_KEYS.at(WHITE_KEY_SHORCUTS.indexOf(key))
    }

    if (BLACK_KEY_SHORTCUTS.indexOf(key) != -1) {
      return BLACK_KEYS.at(BLACK_KEY_SHORTCUTS.indexOf(key))
    }

    return null
  }
}

export {
  Jukebox,
  SheetParser,
  SymbolType,
  NoteSymbol,
  CompoundNoteSymbol,
  PauseSymbol,
  PauseDuration
}
