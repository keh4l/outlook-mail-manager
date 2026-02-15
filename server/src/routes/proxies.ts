import Router from 'koa-router';
import { ProxyController } from '../controllers/ProxyController';

export const proxyRoutes = new Router();
const ctrl = new ProxyController();

proxyRoutes.get('/', ctrl.list);
proxyRoutes.post('/', ctrl.create);
proxyRoutes.put('/:id', ctrl.update);
proxyRoutes.delete('/:id', ctrl.delete);
proxyRoutes.post('/:id/test', ctrl.test);
proxyRoutes.put('/:id/default', ctrl.setDefault);
