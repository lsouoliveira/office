import * as winston from 'winston'

const formattedTimestamp = () => {
  return new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

const loggerFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: formattedTimestamp
    }),
    winston.format.json()
  ),
  transports: [new winston.transports.File({ filename: 'combined.log' })]
})

logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: formattedTimestamp
      }),
      loggerFormat
    )
  })
)

export default logger
