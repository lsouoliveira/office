import Projectile from './projectile'
import { World } from '../world'
import { TILE_SIZE } from '../config'

class ProjectileSystem {
  private projectiles: Projectile[]
  private world: World
  private lastTime: number

  constructor(world: World) {
    this.projectiles = []
    this.world = world
  }

  update(dt: number) {
    this.removedDestroyedProjectiles()

    this.projectiles.forEach((projectile) => {
      if (projectile._destroy) {
        return
      }

      projectile.update(dt)

      this.checkProjectileCollisionWithPlayers(projectile) ||
        this.checkProjectileCollisionWithWorld(projectile) ||
        this.checkProjectileCollisionWithProjectiles(projectile)
    })
  }

  addProjectile(projectile: Projectile) {
    this.projectiles.push(projectile)
    projectile.addOnTimerEnd((p) => this.handleProjectileEnd(p))

    this.world.sendMessage('projectile:added', projectile.toData())
  }

  private handleProjectileEnd(projectile: Projectile) {
    this.world.sendMessage('projectile:removed', projectile.toData())
  }

  private removedDestroyedProjectiles() {
    this.projectiles = this.projectiles.filter((projectile) => !projectile._destroy)
  }

  private checkProjectileCollisionWithWorld(projectile: Projectile) {
    const tileX = Math.floor(projectile.Position.x / TILE_SIZE)
    const tileY = Math.floor(projectile.Position.y / TILE_SIZE)

    if (this.world.getMap().contains(tileX, tileY)) {
      const tile = this.world.getMap().getTile(tileX, tileY)

      if (!tile.isWalkable()) {
        projectile.onHit(tile)

        return true
      }
    }

    return false
  }

  private checkProjectileCollisionWithPlayers(projectile: Projectile) {
    let hit = false

    Object.values(this.world.getOnlinePlayers()).forEach((player) => {
      if (
        player.contains(
          projectile.Position.x,
          projectile.Position.y,
          projectile.Radius,
          projectile.Radius
        )
      ) {
        projectile.onHit(player)
        hit = true
      }
    })

    return hit
  }

  private checkProjectileCollisionWithProjectiles(projectile: Projectile) {
    let hit = false

    this.projectiles.forEach((p) => {
      if (
        p.Id !== projectile.Id &&
        p.contains(
          projectile.Position.x,
          projectile.Position.y,
          projectile.Radius,
          projectile.Radius
        )
      ) {
        projectile.onHit(p)
        hit = true
        console.log('hit projectiles')
      }
    })

    return hit
  }
}

export default ProjectileSystem
