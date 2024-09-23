import { Application, Container } from 'pixi.js';
import { SceneManager } from './scene_manager';

class Scene extends Container {
    protected app: Application
    protected sceneManager: SceneManager

    constructor() {
        super()
    }

    init(app: Application, sceneManager: SceneManager) {
        this.app = app
        this.sceneManager = sceneManager
    }

    async onStart() {
    }

    update() {
    }
}

export {
    Scene
}
