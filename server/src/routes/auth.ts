import Router from 'koa-router';
import { AuthController } from '../controllers/AuthController';

export const authRoutes = new Router();
const ctrl = new AuthController();

authRoutes.post('/login', ctrl.login);
authRoutes.get('/check', ctrl.check);
