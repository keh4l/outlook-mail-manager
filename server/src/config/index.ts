import dotenv from 'dotenv';
import path from 'path';

// 尝试加载根目录和 server 目录的 .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  dbPath: path.resolve(__dirname, '../..', process.env.DB_PATH || './data/outlook.db'),
  accessPassword: process.env.ACCESS_PASSWORD || '',
};
