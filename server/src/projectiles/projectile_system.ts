import Projectile from './projectile'
import { World } from '../world'

class ProjectileSystem {
  private projectiles: Projectile[]
  private world: World
  private lastTime: number

  constructor(world: World) {
    this.projectiles = []
    this.world = world
  }

  update(dt: number) {
    this.projectiles.forEach((projectile) => {
      projectile.update(dt)

      let hit = false

      const tileX = Math.floor(projectile.Position.x / 16)
      const tileY = Math.floor(projectile.Position.y / 16)

      if (this.world.getMap().contains(tileX, tileY)) {
        const tile = this.world.getMap().getTile(tileX, tileY)

        if (!tile.isWalkable()) {
          projectile.onHit(tile)
          hit = true
        }
      }

      if (!hit) {
        Object.values(this.world.getOnlinePlayers()).forEach((player) => {
          if (player.contains(projectile.Position.x, projectile.Position.y)) {
            projectile.onHit(player)
            hit = true
          }
        })
      }
    })
  }

  addProjectile(projectile: Projectile) {
    this.projectiles.push(projectile)
    projectile.addOnTimerEnd((p) => this.handleProjectileEnd(p))

    this.world.sendMessage('projectile:added', projectile.toData())
  }

  private handleProjectileEnd(projectile: Projectile) {
    this.projectiles = this.projectiles.filter((p) => p.Id !== projectile.Id)
    this.world.sendMessage('projectile:removed', projectile.toData())
  }
}

export default ProjectileSystem
