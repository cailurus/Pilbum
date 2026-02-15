import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  formatters: {
    level: (label) => ({ level: label }),
  },
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
});

// Create child loggers for different modules
export const authLogger = logger.child({ module: 'auth' });
export const storageLogger = logger.child({ module: 'storage' });
export const uploadLogger = logger.child({ module: 'upload' });
export const dbLogger = logger.child({ module: 'db' });
