import Router from 'koa-router';
import { DashboardController } from '../controllers/DashboardController';

export const dashboardRoutes = new Router();
const ctrl = new DashboardController();

dashboardRoutes.get('/stats', ctrl.stats);
