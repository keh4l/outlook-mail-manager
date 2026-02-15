import Router from 'koa-router';
import { accountRoutes } from './accounts';
import { mailRoutes } from './mails';
import { proxyRoutes } from './proxies';
import { dashboardRoutes } from './dashboard';
import { authRoutes } from './auth';
import { tagRoutes } from './tags';
import { backupRoutes } from './backup';

const router = new Router({ prefix: '/api' });

router.use('/accounts', accountRoutes.routes(), accountRoutes.allowedMethods());
router.use('/mails', mailRoutes.routes(), mailRoutes.allowedMethods());
router.use('/proxies', proxyRoutes.routes(), proxyRoutes.allowedMethods());
router.use('/dashboard', dashboardRoutes.routes(), dashboardRoutes.allowedMethods());
router.use('/auth', authRoutes.routes(), authRoutes.allowedMethods());
router.use('/tags', tagRoutes.routes(), tagRoutes.allowedMethods());
router.use('/backup', backupRoutes.routes(), backupRoutes.allowedMethods());

export default router;
