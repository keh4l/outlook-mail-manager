import Router from 'koa-router';
import { MailController } from '../controllers/MailController';

export const mailRoutes = new Router();
const ctrl = new MailController();

mailRoutes.post('/fetch', ctrl.fetch);
mailRoutes.post('/fetch-new', ctrl.fetchNew);
mailRoutes.delete('/clear', ctrl.clear);
mailRoutes.get('/cached', ctrl.cached);
