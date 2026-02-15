import { create } from 'zustand';
import type { Proxy, ProxyTestResult } from '../types';
import { proxyApi } from '../lib/api';

interface ProxyStore {
  proxies: Proxy[];
  loading: boolean;
  testResult: ProxyTestResult | null;
  fetchProxies: () => Promise<void>;
  createProxy: (data: Partial<Proxy>) => Promise<void>;
  updateProxy: (id: number, data: Partial<Proxy>) => Promise<void>;
  deleteProxy: (id: number) => Promise<void>;
  testProxy: (id: number) => Promise<ProxyTestResult>;
  setDefault: (id: number) => Promise<void>;
}

export const useProxyStore = create<ProxyStore>((set, get) => ({
  proxies: [],
  loading: false,
  testResult: null,

  fetchProxies: async () => {
    set({ loading: true });
    try {
      const data = await proxyApi.list();
      set({ proxies: data });
    } finally {
      set({ loading: false });
    }
  },

  createProxy: async (data) => {
    await proxyApi.create(data);
    await get().fetchProxies();
  },

  updateProxy: async (id, data) => {
    await proxyApi.update(id, data);
    await get().fetchProxies();
  },

  deleteProxy: async (id) => {
    await proxyApi.delete(id);
    await get().fetchProxies();
  },

  testProxy: async (id) => {
    const result = await proxyApi.test(id);
    set({ testResult: result });
    await get().fetchProxies();
    return result;
  },

  setDefault: async (id) => {
    await proxyApi.setDefault(id);
    await get().fetchProxies();
  },
}));
