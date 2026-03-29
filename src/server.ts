import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';

// Optional: Import your database config from src/config/database
// import { connectDB } from './config/database';

const startServer = async () => {
  try {
    // await connectDB();
    app.listen(config.port, () => {
      logger.info(`Server is running in ${config.env} mode at http://localhost:${config.port}`);
      logger.info(`Docs are available at http://localhost:${config.port}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start the server', error);
    process.exit(1);
  }
};

startServer();
