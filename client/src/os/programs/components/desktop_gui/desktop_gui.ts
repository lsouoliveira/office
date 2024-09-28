import { Widget } from './../../widgets/widget'
import { TextWidget } from './../../widgets/text_widget'
import { ImageWidget } from './../../widgets/image_widget'
import { GUI } from './../../widgets/gui'
import { System } from './../../../system'
import { type DesktopFile } from './../../desktop'
import { OS } from './../../../windows/window'

class FileWidget extends Widget {
  private BORDER_X = 12
  private BORDER_Y = 12

  private textWidget: TextWidget
  private selected: boolean = false
  public file: DesktopFile

  constructor(file: DesktopFile) {
    super()

    this.file = file

    this.textWidget = new TextWidget(file.name, {
      textColor: 'white',
      fontSize: '16px',
      fontFamily: 'Pixelify Sans, sans-serif',
      baseline: 'top',
      align: 'center'
    })

    const imageWidget = new ImageWidget(file.image_path)
    imageWidget.resize(64, 64)

    this.addChild(imageWidget)
    this.addChild(this.textWidget)

    imageWidget.setPosition((this.getWidgetSize().width - 2 * this.BORDER_X) / 2 - 32, 0)
    imageWidget.resize(64, 64)

    this.textWidget.setPosition((this.getWidgetSize().width - 2 * this.BORDER_X) / 2, 64 + 12)
  }

  update() {}

  select() {
    this.selected = true
  }

  unselect() {
    this.selected = false
  }

  renderWidget(context: CanvasRenderingContext2D) {
    context.fillStyle = this.getBackgroundColor()
    context.fillRect(
      this.getOffset().x,
      this.getOffset().y,
      this.getWidgetSize().width,
      this.getWidgetSize().height
    )
  }

  getBackgroundColor() {
    return this.selected ? '#EEEEEE0B' : 'transparent'
  }

  getInternalOffset() {
    const parentX = this.parent ? this.parent.getInternalOffset().x : 0
    const parentY = this.parent ? this.parent.getInternalOffset().y : 0

    return {
      x: this.position.x + parentX + this.BORDER_X,
      y: this.position.y + parentY + this.BORDER_Y
    }
  }

  getWidgetSize(): { width: number; height: number } {
    const textSize = this.textWidget.getWidgetSize()

    return {
      width: 64 + this.BORDER_X * 2,
      height: 64 + 12 + textSize.height + this.BORDER_Y * 2
    }
  }
}

const FILE_GAP = 24

class DesktopGUI extends GUI {
  private files: Widget[] = []
  private selectedFile?: FileWidget

  constructor(
    system: System,
    window: OS.Window,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    super(system, window, x, y, width, height)

    this.getRoot().style.backgroundColor = '#222831'

    this.getRoot().on('mousedown', (x, y) => {
      for (const file of this.files) {
        if (file.contains(x, y)) {
          this.selectedFile?.unselect()
          this.selectedFile = file as FileWidget
          this.selectedFile.select()

          return
        }
      }

      this.selectedFile?.unselect()
    })

    this.getRoot().on('doubleclick', (x, y) => {
      for (const file of this.files) {
        if (file.contains(x, y)) {
          if (!(file as FileWidget).file.process) {
            return
          }

          this.getSystem().launch((file as FileWidget).file.process)

          return
        }
      }
    })
  }

  addFile(file: DesktopFile) {
    const fileWidget = new FileWidget(file)

    this.files.push(fileWidget)

    this.getRoot().addChild(fileWidget)

    this.rearrangeFiles()
  }

  rearrangeFiles() {
    let x = FILE_GAP
    let y = FILE_GAP

    this.files.forEach((file) => {
      file.setPosition(x, y)

      x += file.getWidgetSize().width + FILE_GAP

      if (x + file.getWidgetSize().width > this.getSize().width) {
        x = FILE_GAP
        y += file.getWidgetSize().height + 24
      }
    })
  }
}

export { DesktopGUI }
