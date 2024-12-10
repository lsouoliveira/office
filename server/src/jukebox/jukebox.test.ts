import {
  SheetParser,
  SymbolType,
  NoteSymbol,
  CompoundNoteSymbol,
  PauseSymbol,
  PauseDuration
} from './jukebox'

test('parses notes played together', () => {
  const input = '[abc]'
  const parser = new SheetParser(input)
  const sheet = parser.parse()
  const expectedSymbols = [
    new CompoundNoteSymbol([new NoteSymbol('a'), new NoteSymbol('b'), new NoteSymbol('c')])
  ]

  expect(sheet.getSymbols()).toStrictEqual(expectedSymbols)
})

test('parses notes played as fast as possible', () => {
  const input = '[a b c]'
  const parser = new SheetParser(input)
  const sheet = parser.parse()
  const expectedSymbols = [
    new NoteSymbol('a'),
    new PauseSymbol(PauseDuration.SHORTEST),
    new NoteSymbol('b'),
    new PauseSymbol(PauseDuration.SHORTEST),
    new NoteSymbol('c')
  ]

  expect(sheet.getSymbols()).toStrictEqual(expectedSymbols)
})

test('parses notes played quickly', () => {
  const input = 'abc'
  const parser = new SheetParser(input)
  const sheet = parser.parse()
  const expectedSymbols = [
    new NoteSymbol('a'),
    new PauseSymbol(PauseDuration.SHORTER),
    new NoteSymbol('b'),
    new PauseSymbol(PauseDuration.SHORTER),
    new NoteSymbol('c')
  ]

  expect(sheet.getSymbols()).toStrictEqual(expectedSymbols)
})

test('parses notes played after a short pause', () => {
  const input = 'a b c'
  const parser = new SheetParser(input)
  const sheet = parser.parse()
  const expectedSymbols = [
    new NoteSymbol('a'),
    new PauseSymbol(PauseDuration.SHORT),
    new NoteSymbol('b'),
    new PauseSymbol(PauseDuration.SHORT),
    new NoteSymbol('c')
  ]

  expect(sheet.getSymbols()).toStrictEqual(expectedSymbols)
})

test('parses pause', () => {
  const input = '|'
  const parser = new SheetParser(input)
  const sheet = parser.parse()
  const expectedSymbols = [new PauseSymbol(PauseDuration.PAUSE)]

  expect(sheet.getSymbols()).toStrictEqual(expectedSymbols)
})

test('parses long pause', () => {
  const input = '| '
  const parser = new SheetParser(input)
  const sheet = parser.parse()
  const expectedSymbols = [new PauseSymbol(PauseDuration.LONG)]

  expect(sheet.getSymbols()).toStrictEqual(expectedSymbols)
})

test('parses longer pause', () => {
  const input = ' | '
  const parser = new SheetParser(input)
  const sheet = parser.parse()
  const expectedSymbols = [new PauseSymbol(PauseDuration.LONGER)]

  expect(sheet.getSymbols()).toStrictEqual(expectedSymbols)
})

test('parses longest pause', () => {
  const input = '| |'
  const parser = new SheetParser(input)
  const sheet = parser.parse()
  const expectedSymbols = [new PauseSymbol(PauseDuration.LONGEST)]

  expect(sheet.getSymbols()).toStrictEqual(expectedSymbols)
})

test('parses longest pause', () => {
  const input = '| |'
  const parser = new SheetParser(input)
  const sheet = parser.parse()
  const expectedSymbols = [new PauseSymbol(PauseDuration.LONGEST)]

  expect(sheet.getSymbols()).toStrictEqual(expectedSymbols)
})

test('parses a combination of simultaneous notes, shortest pauses, quick notes, single notes, and various pauses', () => {
  const input = '[abc] [a b c] abc a |  | | '
  const parser = new SheetParser(input)
  const sheet = parser.parse()

  const expectedSymbols = [
    new CompoundNoteSymbol([new NoteSymbol('a'), new NoteSymbol('b'), new NoteSymbol('c')]),
    new PauseSymbol(PauseDuration.SHORT),
    new NoteSymbol('a'),
    new PauseSymbol(PauseDuration.SHORTEST),
    new NoteSymbol('b'),
    new PauseSymbol(PauseDuration.SHORTEST),
    new NoteSymbol('c'),
    new PauseSymbol(PauseDuration.SHORT),
    new NoteSymbol('a'),
    new PauseSymbol(PauseDuration.SHORTER),
    new NoteSymbol('b'),
    new PauseSymbol(PauseDuration.SHORTER),
    new NoteSymbol('c'),
    new PauseSymbol(PauseDuration.SHORT),
    new NoteSymbol('a'),
    new PauseSymbol(PauseDuration.LONGER),
    new PauseSymbol(PauseDuration.LONGEST),
    new PauseSymbol(PauseDuration.SHORT)
  ]

  expect(sheet.getSymbols()).toStrictEqual(expectedSymbols)
})
