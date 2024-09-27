export default {
  bundles: [
    {
      name: 'main',
      assets: [
        {
          alias: 'playground.json',
          src: 'resources/maps/playground.json'
        },
        {
          alias: 'Room_Builder_Office_16x16.json',
          src: 'resources/maps/Room_Builder_Office_16x16.json'
        },
        {
          alias: 'Room_Builder_Office_16x16.png',
          src: 'resources/maps/Room_Builder_Office_16x16.png',
          data: { scaleMode: 'nearest' }
        },
        {
          alias: 'Modern_Office_Black_Shadow.json',
          src: 'resources/maps/Modern_Office_Black_Shadow.json'
        },
        {
          alias: 'Modern_Office_Black_Shadow.png',
          src: 'resources/maps/Modern_Office_Black_Shadow.png',
          data: { scaleMode: 'nearest' }
        },
        {
          alias: 'collision_tileset.png',
          src: 'resources/maps/collision_tileset.png',
          data: { scaleMode: 'nearest' }
        },
        {
          alias: 'default_spritesheet.json',
          src: 'resources/characters/default_spritesheet.json'
        },
        {
          alias: 'Bob_16x16.png',
          src: 'resources/images/Bob_16x16.png',
          data: { scaleMode: 'nearest' }
        }
      ]
    }
  ]
}
