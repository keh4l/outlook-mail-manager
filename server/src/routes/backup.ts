import Router from 'koa-router';
import { BackupController } from '../controllers/BackupController';

export const backupRoutes = new Router();
const ctrl = new BackupController();

backupRoutes.get('/download', ctrl.download);
backupRoutes.post('/restore', ctrl.restore);
