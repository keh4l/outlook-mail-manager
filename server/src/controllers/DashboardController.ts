import { Context } from 'koa';
import { DashboardService } from '../services/DashboardService';
import { success } from '../utils/response';

const dashboardService = new DashboardService();

export class DashboardController {
  async stats(ctx: Context) {
    const data = dashboardService.getStats();
    success(ctx, data);
  }
}
