import { GUI } from './../../widgets/gui'
import { System } from './../../../system'
import { OS } from './../../../windows/window'
import { TextWidget } from './../../widgets/text_widget'
import { MonthCellWidget } from './month_cell_widget'
import { ButtonWidget } from './../../widgets/button_widget'
import dayjs from 'dayjs'

dayjs.locale('pt-br')

const events = [
  {
    title: 'Comprar \ningressos para o \nTropical on Rails',
    date: dayjs('2024-10-30'),
    color: '#60a5fa'
  },
  {
    title: 'Tropical on Rails!',
    date: dayjs('2025-04-03'),
    color: '#4ade80'
  },
  {
    title: 'Tropical on Rails!',
    date: dayjs('2025-04-04'),
    color: '#4ade80'
  },
  {
    title: 'Férias!',
    date: dayjs('2024-11-11'),
    color: '#4ade80'
  },
  {
    title: 'Feliz aniversário!',
    date: dayjs().add(Math.floor(Math.random() * 365), 'day'),
    color: '#4ade80'
  },
  {
    title: 'Feliz aniversário!',
    date: dayjs().add(Math.floor(Math.random() * 365), 'day'),
    color: '#4ade80'
  }
]

class CalendarGUI extends GUI {
  private currentMonthText: TextWidget
  private currentYear: TextWidget
  private dateCells: MonthCellWidget[] = []
  private previousMonthButton: ButtonWidget
  private todayButton: ButtonWidget
  private nextMonthButton: ButtonWidget
  private currentMonth: dayjs.Dayjs = dayjs()

  constructor(
    system: System,
    window: OS.Window,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    super(system, window, x, y, width, height)

    this.getRoot().style.backgroundColor = '#ffffff'

    this.setupWidgets()
  }

  update(dt: number) {
    super.update(dt)

    this.updateCurrentMonth(this.currentMonth)
  }

  private setupWidgets() {
    this.currentMonthText = new TextWidget('Month', {
      textColor: 'black',
      fontSize: '24px',
      fontFamily: 'Pixelify Sans, sans-serif',
      baseline: 'top',
      align: 'left',
      fontWeight: 'bold'
    })

    this.currentYear = new TextWidget('Year', {
      textColor: 'black',
      fontSize: '24px',
      fontFamily: 'Pixelify Sans, sans-serif',
      baseline: 'top',
      align: 'left'
    })

    this.previousMonthButton = new ButtonWidget('<')
    this.previousMonthButton.setPosition(this.getRoot().getWidgetSize().width - 128, 16)
    this.previousMonthButton.resize(28, 24)

    this.previousMonthButton.on('mouseup', () => {
      this.currentMonth = this.currentMonth.subtract(1, 'month')

      this.resetDateCells(this.currentMonth)
      this.updateCurrentMonth(this.currentMonth)
    })

    this.todayButton = new ButtonWidget('Hoje')
    this.todayButton.setPosition(this.getRoot().getWidgetSize().width - 100, 16)
    this.todayButton.resize(56, 24)

    this.todayButton.on('mouseup', () => {
      this.currentMonth = dayjs()

      this.resetDateCells(this.currentMonth)
      this.updateCurrentMonth(this.currentMonth)
    })

    this.nextMonthButton = new ButtonWidget('>')
    this.nextMonthButton.setPosition(this.getRoot().getWidgetSize().width - 44, 16)
    this.nextMonthButton.resize(28, 24)

    this.nextMonthButton.on('mouseup', () => {
      this.currentMonth = this.currentMonth.add(1, 'month')

      this.resetDateCells(this.currentMonth)
      this.updateCurrentMonth(this.currentMonth)
    })

    this.getRoot().addChild(this.currentMonthText)
    this.getRoot().addChild(this.currentYear)
    this.getRoot().addChild(this.previousMonthButton)
    this.getRoot().addChild(this.todayButton)
    this.getRoot().addChild(this.nextMonthButton)

    this.resetDateCells(this.currentMonth)
    this.updateCurrentMonth(this.currentMonth)
  }

  private updateCurrentMonth(date: dayjs.Dayjs) {
    let monthName = date.format('MMMM')

    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1)

    this.currentMonthText.setText(monthName)
    this.currentYear.setText(date.year().toString())

    this.currentMonthText.setPosition(16, 16)
    this.currentYear.setPosition(this.currentMonthText.getWidgetSize().width + 24, 16)
  }

  private resetDateCells(month: dayjs.Dayjs) {
    const dates = this.generateDates(month)

    for (const dateCell of this.dateCells) {
      this.getRoot().removeChild(dateCell)
    }

    this.dateCells = []
    const cellWidth = this.getRoot().getWidgetSize().width / 7
    const cellHeight = (this.getRoot().getWidgetSize().height - this.getTableOffsetTop()) / 5

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 7; j++) {
        const date = dates[i * 7 + j]
        const isSameMonth = !date.isSame(month, 'month')
        const isToday = month.isSame(dayjs(), 'month') && date.isSame(dayjs(), 'day')

        const monthCell = new MonthCellWidget(date, isSameMonth, isToday)
        monthCell.setPosition(j * cellWidth, this.getTableOffsetTop() + i * cellHeight)
        monthCell.resize(cellWidth, cellHeight)

        this.dateCells.push(monthCell)

        const matchingEvents = events.filter((event) => event.date.isSame(date, 'day'))

        for (const event of matchingEvents) {
          monthCell.addEvent(event.title, event.color)
        }

        this.getRoot().addChild(monthCell)
      }
    }
  }

  private getTableOffsetTop() {
    return 32 + this.currentMonthText.getWidgetSize().height
  }

  private generateDates(month: dayjs.Dayjs) {
    const dates = []
    const firstDayOfMonth = month.date(1).day()

    let firstDay = month.date(1).subtract(firstDayOfMonth, 'day')

    for (let i = 0; i < 35; i++) {
      dates.push(firstDay)
      firstDay = firstDay.add(1, 'day')
    }

    return dates
  }
}

export { CalendarGUI }
