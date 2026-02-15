import Router from 'koa-router';
import { AccountController } from '../controllers/AccountController';

export const accountRoutes = new Router();
const ctrl = new AccountController();

accountRoutes.get('/', ctrl.list);
accountRoutes.post('/', ctrl.create);
accountRoutes.put('/:id', ctrl.update);
accountRoutes.delete('/:id', ctrl.delete);
accountRoutes.post('/batch-delete', ctrl.batchDelete);
accountRoutes.post('/import', ctrl.import);
accountRoutes.post('/import-preview', ctrl.importPreview);
accountRoutes.post('/import-confirm', ctrl.importConfirm);
accountRoutes.post('/export', ctrl.export);
accountRoutes.post('/:id/tags', ctrl.setTags);
