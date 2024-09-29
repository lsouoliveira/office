import { Process } from '../processes/process'
import { OS } from '../windows/window'

const CURSOR_BLINK_DURATION = 0.53
const DEFAULT_FONT_SIZE = 16

class Notepad extends Process {
  private window?: OS.Window
  private buffer: string = ''
  private cursor: number = -1
  private cursorBlinkTimer: number = 0
  private isCursorVisible: boolean = true

  onStart() {
    this.window = this.system.Windows().createWindow({
      title: 'Notepad',
      x: this.system.getResolution().width / 2 - 320,
      y: this.system.getResolution().height / 2 - 240,
      width: 640,
      height: 480,
      hasDecorations: true,
      draggable: true
    })

    if (!this.window) {
      throw new Error('Window not initialized')
    }

    this.window.on('keydown', (key: string) => {
      switch (key) {
        case 'Backspace':
          if (this.cursor >= 0) {
            this.buffer = this.buffer.slice(0, this.cursor) + this.buffer.slice(this.cursor + 1)
            this.cursor--
            this.cursor = Math.max(0, this.cursor)
          }
          break
        case 'Delete':
          if (this.cursor < this.buffer.length - 1) {
            this.buffer = this.buffer.slice(0, this.cursor + 1) + this.buffer.slice(this.cursor + 2)
          } else {
            this.buffer = this.buffer.slice(0, this.cursor)
            this.cursor--
          }
          break
        case 'ArrowLeft':
          if (this.cursor > 0) {
            this.cursor--
            this.cursor = Math.max(0, this.cursor)
          }
          break
        case 'ArrowRight':
          if (this.cursor < this.buffer.length) {
            this.cursor++
            this.cursor = Math.min(this.buffer.length - 1, this.cursor)
          }
          break
        case 'Enter':
          this.buffer = this.buffer =
            this.buffer.slice(0, this.cursor + 1) + '\n' + this.buffer.slice(this.cursor + 1)
          this.cursor++
        default:
          if (this.isTextCharacter(key)) {
            this.buffer =
              this.buffer.slice(0, this.cursor + 1) + key + this.buffer.slice(this.cursor + 1)
            this.cursor++
          }
          break
      }

      this.isCursorVisible = true
      this.cursorBlinkTimer = 0
    })
  }

  update(dt: number) {
    this.cursorBlinkTimer += dt

    if (this.cursorBlinkTimer >= CURSOR_BLINK_DURATION) {
      this.cursorBlinkTimer = 0
      this.isCursorVisible = !this.isCursorVisible
    }
  }

  onTerminate() {
    if (this.window) {
      this.window.close()
    }
  }

  render() {
    if (!this.window) {
      throw new Error('Window not initialized')
    }

    const windowContext = this.window.getContext()

    if (!windowContext) {
      throw new Error('Context not initialized')
    }

    windowContext.clearRect(0, 0, this.window.getWidth(), this.window.getHeight())

    windowContext.fillStyle = 'white'
    windowContext.fillRect(0, 0, this.window.getWidth(), this.window.getHeight())

    windowContext.font = `${DEFAULT_FONT_SIZE}px Pixelify Sans, sans-serif`
    windowContext.textAlign = 'left'
    windowContext.textBaseline = 'top'

    let rowWidth = 0
    let row = 0
    let column = 0

    const verticalMargin = 8
    const horizontalMargin = 16
    const lineHeight = DEFAULT_FONT_SIZE * 1.5
    const letterSpacing = 2

    if (!this.buffer.length) {
      const blankCharacterWidth = this.getCharacterWidth(' ')

      this.renderCursor(
        windowContext,
        rowWidth + horizontalMargin - 2,
        row * lineHeight + verticalMargin,
        blankCharacterWidth + 4,
        DEFAULT_FONT_SIZE
      )
    }

    for (let i = 0; i < this.buffer.length; i++) {
      const character = this.buffer[i]
      const characterWidth = this.getCharacterWidth(character == '\n' ? ' ' : character)
      const realCharacterWidth = characterWidth + letterSpacing

      if (character === '\n') {
        rowWidth = 0
        row++
      }

      if (i === this.cursor && this.isCursorVisible) {
        this.renderCursor(
          windowContext,
          rowWidth + horizontalMargin - 2,
          row * lineHeight + verticalMargin,
          characterWidth + 4,
          DEFAULT_FONT_SIZE
        )

        windowContext.fillStyle = '#fff'
      } else {
        windowContext.fillStyle = '#222831'
      }

      windowContext.fillText(
        character,
        rowWidth + horizontalMargin,
        row * lineHeight + verticalMargin
      )

      if (character !== '\n') {
        rowWidth += realCharacterWidth
        column++
      }

      if (rowWidth > this.window.getWidth() - horizontalMargin * 2) {
        rowWidth = 0
        row++
      }
    }
  }

  renderCursor(context, x, y, width, height) {
    if (this.isCursorVisible) {
      context.fillStyle = '#222831'
      context.fillRect(x, y, width, height)
    }
  }

  getCharacterWidth(character: string = 'a') {
    if (!this.window) {
      throw new Error('Window not initialized')
    }

    const windowContext = this.window.getContext()

    if (!windowContext) {
      throw new Error('Context not initialized')
    }

    return windowContext.measureText(character).width
  }

  isTextCharacter(character: string) {
    return /^[a-zA-Z0-9~á~ãõé!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]$/.test(character)
  }
}

export { Notepad }
