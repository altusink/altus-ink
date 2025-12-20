export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
    [key: string]: any
}

class Logger {
    private env = process.env.NODE_ENV

    private log(level: LogLevel, message: string, context?: LogContext) {
        const timestamp = new Date().toISOString()
        const payload = {
            timestamp,
            level,
            message,
            ...context
        }

        switch (level) {
            case 'error':
                console.error(JSON.stringify(payload))
                break
            case 'warn':
                console.warn(JSON.stringify(payload))
                break
            case 'debug':
                if (this.env === 'development') {
                    console.debug(JSON.stringify(payload))
                }
                break
            default:
                console.log(JSON.stringify(payload))
        }
    }

    info(message: string, context?: LogContext) {
        this.log('info', message, context)
    }

    warn(message: string, context?: LogContext) {
        this.log('warn', message, context)
    }

    error(message: string, error?: Error, context?: LogContext) {
        this.log('error', message, {
            ...context,
            errorName: error?.name,
            errorMessage: error?.message,
            stack: error?.stack
        })
    }
}

export const logger = new Logger()
