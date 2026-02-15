import Router from 'koa-router';
import { TagController } from '../controllers/TagController';

export const tagRoutes = new Router();
const ctrl = new TagController();

tagRoutes.get('/', ctrl.list);
tagRoutes.post('/', ctrl.create);
tagRoutes.put('/:id', ctrl.update);
tagRoutes.delete('/:id', ctrl.delete);
