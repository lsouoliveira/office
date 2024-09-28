import { Widget } from './widget'

class ImageWidget extends Widget {
  private image: HTMLImageElement | null
  private framebuffer: ImageData | null
  private hasLoaded = false

  constructor(src: string | null, framebuffer: ImageData | null) {
    super()

    if (src) {
      this.image = new Image()
      this.image.src = src

      this.image.onload = () => {
        this.hasLoaded = true
      }
    } else {
      this.framebuffer = framebuffer
      this.hasLoaded = true
    }
  }

  renderWidget(context: CanvasRenderingContext2D) {
    if (!this.hasLoaded) {
      return
    }

    if (this.image) {
      context.drawImage(
        this.image,
        this.getOffset().x,
        this.getOffset().y,
        this.getWidgetSize().width,
        this.getWidgetSize().height
      )
    } else if (this.framebuffer) {
      context.putImageData(this.framebuffer, this.getOffset().x, this.getOffset().y)
    }
  }

  setFramebuffer(framebuffer: ImageData | null) {
    this.framebuffer = framebuffer
  }
}

export { ImageWidget }
