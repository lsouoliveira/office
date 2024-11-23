interface Entity {
  updateEntity(dt: number): void
  fixedUpdateEntity(dt: number): void
}

export { Entity }
