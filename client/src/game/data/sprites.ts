const SPRITES = {
  invisible_wall: {
    y: 0,
    width: 1,
    height: 1,
    states: [0],
    tileset: 'resources/maps/collision_tileset.png'
  },
  default: {
    y: 0,
    width: 1,
    height: 1,
    states: [1],
    tileset: 'resources/maps/collision_tileset.png'
  },
  office_floor1: {
    y: 0,
    width: 1,
    height: 1,
    states: [107],
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  office_floor2: {
    y: 0,
    width: 1,
    height: 1,
    states: [171],
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  office_chair1: {
    y: 0,
    width: 1,
    height: 2,
    states: [130],
    pivot: { x: 0, y: 1 },
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  office_chair2: {
    y: 0,
    width: 1,
    height: 2,
    states: [133],
    pivot: { x: 0, y: 1 },
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  office_chair3: {
    y: 0,
    width: 1,
    height: 2,
    states: [129],
    pivot: { x: 0, y: 1 },
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  office_chair4: {
    y: 0,
    width: 1,
    height: 2,
    states: [132],
    pivot: { x: 0, y: 1 },
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  pink_wall: {
    y: 0,
    width: 1,
    height: 2,
    states: [177],
    pivot: { x: 0, y: 1 },
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  pink_wall_start: {
    y: 0,
    width: 1,
    height: 2,
    states: [176],
    pivot: { x: 0, y: 1 },
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  pink_wall_end: {
    y: 0,
    width: 1,
    height: 2,
    states: [178],
    pivot: { x: 0, y: 1 },
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  pink_wall_corner_left: {
    y: 1,
    width: 1,
    height: 1,
    states: [23],
    pivot: { x: 0, y: 0 },
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  pink_wall_corner_right: {
    y: 1,
    width: 1,
    height: 1,
    states: [25],
    pivot: { x: 0, y: 0 },
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  pink_wall_left: {
    y: 1,
    width: 1,
    height: 1,
    states: [39],
    pivot: { x: 0, y: 0 },
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  pink_wall_right: {
    y: 1,
    width: 1,
    height: 1,
    states: [41],
    pivot: { x: 0, y: 0 },
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  pink_wall_corner_bottom_left: {
    y: 1,
    width: 1,
    height: 1,
    states: [55],
    pivot: { x: 0, y: 0 },
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  pink_wall_corner_bottom_right: {
    y: 1,
    width: 1,
    height: 1,
    states: [57],
    pivot: { x: 0, y: 0 },
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  pink_wall_bottom: {
    y: 1,
    width: 1,
    height: 1,
    states: [56],
    pivot: { x: 0, y: 0 },
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  brick_wall: {
    y: 0,
    width: 1,
    height: 2,
    states: [145],
    pivot: { x: 0, y: 1 },
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  brick_wall_start: {
    y: 0,
    width: 1,
    height: 2,
    states: [144],
    pivot: { x: 0, y: 1 },
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  brick_wall_end: {
    y: 0,
    width: 1,
    height: 2,
    states: [146],
    pivot: { x: 0, y: 1 },
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  right_corner_left: {
    y: 1,
    width: 1,
    height: 1,
    states: [33],
    pivot: { x: 0, y: 0 },
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  right_corner_right: {
    y: 1,
    width: 1,
    height: 1,
    states: [34],
    pivot: { x: 0, y: 0 },
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  shadow_corner_left: {
    y: 0,
    width: 1,
    height: 1,
    states: [29],
    pivot: { x: 0, y: 0 },
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  shadow_left: {
    y: 0,
    width: 1,
    height: 1,
    states: [45],
    pivot: { x: 0, y: 0 },
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  shadow_middle: {
    y: 0,
    width: 1,
    height: 1,
    states: [30],
    pivot: { x: 0, y: 0 },
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  shadow_right: {
    y: 0,
    width: 1,
    height: 1,
    states: [31],
    pivot: { x: 0, y: 0 },
    tileset: 'resources/maps/Room_Builder_Office_16x16.png'
  },
  money_stack: {
    y: 0,
    width: 2,
    height: 2,
    states: [796],
    pivot: { x: 0, y: 1 },
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  company_board_left: {
    y: 0,
    width: 1,
    height: 2,
    states: [169],
    pivot: { x: 0, y: 1 },
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  company_board_right: {
    y: 0,
    width: 1,
    height: 2,
    states: [170],
    pivot: { x: 0, y: 1 },
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  table1_left: {
    y: 0,
    width: 1,
    height: 2,
    states: [487],
    pivot: { x: 0, y: 1 },
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  table1_middle: {
    y: 0,
    width: 1,
    height: 2,
    states: [488],
    pivot: { x: 0, y: 1 },
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  table1_right: {
    y: 0,
    width: 1,
    height: 2,
    states: [489],
    pivot: { x: 0, y: 1 },
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  coffee_machine_left: {
    y: 0,
    width: 1,
    height: 3,
    states: [618],
    pivot: { x: 0, y: 2 },
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  coffee_machine_right: {
    y: 0,
    width: 1,
    height: 3,
    states: [619],
    pivot: { x: 0, y: 2 },
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  air_conditioner_left: {
    y: 1,
    width: 1,
    height: 1,
    states: [187],
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  air_conditioner_right: {
    y: 1,
    width: 1,
    height: 1,
    states: [188],
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  large_table_bottom_corner_left: {
    y: 0,
    width: 1,
    height: 1,
    states: [97],
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  large_table_bottom_middle_left: {
    y: 0,
    width: 1,
    height: 1,
    states: [81],
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  large_table_bottom_middle_right: {
    y: 0,
    width: 1,
    height: 1,
    states: [83],
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  large_table_bottom_middle: {
    y: 0,
    width: 1,
    height: 1,
    states: [98],
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  large_table_bottom_corner_right: {
    y: 0,
    width: 1,
    height: 1,
    states: [99],
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  large_table_top_corner_left: {
    y: 0,
    width: 1,
    height: 1,
    states: [65],
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  large_table_top_middle: {
    y: 0,
    width: 1,
    height: 1,
    states: [66],
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  large_table_top_corner_right: {
    y: 0,
    width: 1,
    height: 1,
    states: [67],
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  large_table_middle: {
    y: 0,
    width: 1,
    height: 1,
    states: [82],
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  cabinet_left: {
    y: 0,
    width: 1,
    height: 3,
    states: [199],
    pivot: { x: 0, y: 2 },
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  cabinet_right: {
    y: 0,
    width: 1,
    height: 3,
    states: [200],
    pivot: { x: 0, y: 2 },
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  vending_machine: {
    y: 0,
    width: 2,
    height: 3,
    states: [370],
    pivot: { x: 0, y: 2 },
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  computer_west_top: {
    y: 0,
    width: 1,
    height: 1,
    states: [715],
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  },
  computer_west_bottom: {
    y: 0,
    width: 1,
    height: 1,
    states: [731],
    tileset: 'resources/maps/Modern_Office_Black_Shadow.png'
  }
}

export { SPRITES }
