import SpawnZone from './spawn_zone'
import Reward from './reward'
import { Item } from './../items/item'
import { ItemType } from './../items/item_type'
import { World } from './../world'

const SPAWN_COOLDOWN = 10 * 60
const MAX_REWARDS = 2
const REWARD_DURATION = 60 * 60
const REWARDS = [
  {
    itemId: '110000',
    amount: 5,
    dropRate: 0.8
  },
  {
    itemId: '110001',
    amount: 8,
    dropRate: 0.3
  },
  {
    itemId: '110002',
    amount: 10,
    dropRate: 0.1
  },
  {
    itemId: '110003',
    amount: 15,
    dropRate: 0.05
  }
]

const weightedRandom = (weights: number[]) => {
  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0)
  let random = Math.random() * totalWeight

  for (let i = 0; i < weights.length; i++) {
    if (random < weights[i]) {
      return i
    }

    random -= weights[i]
  }

  return weights.length - 1
}

class RewardSpawnerSystem {
  private spawnZones: SpawnZone[]
  private rewards: Reward[]
  private timer: number
  private world: World
  private onRewardSpawned: (reward: Reward) => void
  private onRewardClaimed: (playerId: string, reward: Reward) => void
  private onRewardExpired: (reward: Reward) => void

  constructor(
    world: World,
    onRewardSpawnedCallback: (reward: Reward) => void,
    onRewardClaimedCallback: (playerId: string, reward: Reward) => void,
    onRewardExpiredCallback: (reward: Reward) => void
  ) {
    this.spawnZones = []
    this.rewards = []
    this.timer = SPAWN_COOLDOWN
    this.world = world
    this.onRewardSpawned = onRewardSpawnedCallback
    this.onRewardClaimed = onRewardClaimedCallback
    this.onRewardExpired = onRewardExpiredCallback
  }

  addSpawnZone(spawnZone: SpawnZone): void {
    this.spawnZones.push(spawnZone)
  }

  claimReward(playerId: string, itemId: string): Reward | null {
    const reward = this.rewards.find((reward) => reward.Item.getId() === itemId)

    if (!reward) {
      return null
    }

    this.rewards = this.rewards.filter((reward) => reward.Item.getId() !== itemId)
    this.onRewardClaimed(playerId, reward)
    this.timer = 0

    return reward
  }

  update(dt: number): void {
    this.timer += dt

    if (this.canSpawnReward()) {
      this.spawnReward()
      this.timer = 0
    }

    this.rewards.forEach((reward) => {
      reward.update(dt)

      if (reward.DurationTimer >= REWARD_DURATION) {
        this.rewards = this.rewards.filter((r) => r.Id !== reward.Id)

        this.onRewardExpired(reward)
      }
    })
  }

  private canSpawnReward() {
    return this.rewards.length < MAX_REWARDS && this.timer >= SPAWN_COOLDOWN
  }

  private spawnReward() {
    if (this.spawnZones.length === 0 || REWARDS.length === 0) {
      return
    }

    const randomSpawnZone = this.spawnZones[Math.floor(Math.random() * this.spawnZones.length)]
    const randomReward = REWARDS[weightedRandom(REWARDS.map((reward) => reward.dropRate))]

    if (!randomReward) {
      return
    }

    const itemTypeData = this.world.getItemById(randomReward.itemId)

    if (!itemTypeData) {
      return
    }

    const itemType = new ItemType(
      randomReward.itemId,
      {
        isGround: itemTypeData.is_ground,
        isWalkable: itemTypeData.is_walkable,
        isWall: itemTypeData.is_wall,
        actionId: itemTypeData.action_id,
        facing: itemTypeData.facing,
        nextItemId: itemTypeData.next_item_id,
        isDoor: itemTypeData.is_door
      },
      undefined
    )

    const item = new Item(itemType)
    const x = randomSpawnZone.X + Math.floor(Math.random() * randomSpawnZone.Width)
    const y = randomSpawnZone.Y + Math.floor(Math.random() * randomSpawnZone.Height)

    if (!this.world.getMap().contains(x, y)) {
      return
    }

    const tile = this.world.getMap().getTile(x, y)

    if (!tile.isWalkable) {
      return
    }

    const reward = new Reward(randomReward.itemId, item, randomReward.amount, x, y)

    this.rewards.push(reward)
    this.onRewardSpawned(reward)
  }
}

export default RewardSpawnerSystem
