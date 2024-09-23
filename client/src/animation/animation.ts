class Animation {
    public readonly name: string
    public readonly frames: any
    public readonly speed: number

    constructor(name: string, frames: any, speed: number) {
        this.name = name
        this.frames = frames
        this.speed = speed
    }
}

export {
    Animation
}
