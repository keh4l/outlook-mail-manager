import app from './app';
import { config } from './config';
import { runMigrations } from './database/migrations';
import logger from './utils/logger';

// 初始化数据库
runMigrations();
logger.info('Database migrations completed');

// 启动服务
app.listen(config.port, () => {
  logger.info(`Server is running on http://localhost:${config.port}`);
});
