import { Container, Point } from 'pixi.js';

class Camera {
    private stage: Container
    public position: Point = new Point(0, 0)
    public scale: number = 1

    constructor(stage: Container) {
        this.stage = stage
    }

    update() {
        this.stage.position.set(-this.position.x, -this.position.y)
        this.stage.scale.set(this.scale)
    }

    moveTo(x: number, y: number) {
        this.position.set(x * this.scale, y * this.scale)
    }

    centerAt(x: number, y: number) {
        this.position.set(x * this.scale - window.innerWidth / 2, y * this.scale - window.innerHeight / 2)
    }

    transformToViewport(x: number, y: number): Point {
        return new Point((x + this.position.x) / this.scale, (y + this.position.y) / this.scale)
    }
}

export { Camera }
