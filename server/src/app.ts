import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import path from 'path';
import fs from 'fs';
import { loggerMiddleware } from './middlewares/logger';
import { errorHandler } from './middlewares/errorHandler';
import { authMiddleware } from './middlewares/auth';
import router from './routes';

const app = new Koa();

// 中间件
app.use(errorHandler);
app.use(loggerMiddleware);
app.use(bodyParser({ jsonLimit: '10mb' }));
app.use(authMiddleware);

// API 路由
app.use(router.routes());
app.use(router.allowedMethods());

// 前端静态资源
const distPath = path.resolve(__dirname, '../../web/dist');
if (fs.existsSync(distPath)) {
  app.use(serve(distPath, { maxage: 365 * 24 * 60 * 60 * 1000, gzip: true }));

  // SPA fallback
  app.use(async (ctx) => {
    if (!ctx.path.startsWith('/api') && !ctx.path.includes('.')) {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        ctx.type = 'html';
        ctx.body = fs.createReadStream(indexPath);
      }
    }
  });
}

export default app;
