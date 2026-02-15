import { create } from 'zustand';
import type { MailMessage, FetchMailsResult } from '../types';
import { mailApi } from '../lib/api';
import { useAccountStore } from './accounts';

interface MailStore {
  currentAccountId: number | null;
  currentMailbox: 'INBOX' | 'Junk';
  mails: MailMessage[];
  selectedMail: MailMessage | null;
  loading: boolean;
  fetchResult: FetchMailsResult | null;
  setCurrentAccount: (id: number) => void;
  setMailbox: (box: 'INBOX' | 'Junk') => void;
  fetchMails: (accountId: number, mailbox: string, proxyId?: number) => Promise<void>;
  fetchCachedMails: (accountId: number, mailbox: string) => Promise<void>;
  clearMailbox: (accountId: number, mailbox: string, proxyId?: number) => Promise<void>;
  selectMail: (mail: MailMessage | null) => void;
}

export const useMailStore = create<MailStore>((set) => ({
  currentAccountId: null,
  currentMailbox: 'INBOX',
  mails: [],
  selectedMail: null,
  loading: false,
  fetchResult: null,

  setCurrentAccount: (id) => set({ currentAccountId: id, mails: [], selectedMail: null }),
  setMailbox: (box) => set({ currentMailbox: box, mails: [], selectedMail: null }),

  fetchMails: async (accountId, mailbox, proxyId) => {
    set({ loading: true });
    try {
      const result = await mailApi.fetch({ account_id: accountId, mailbox, proxy_id: proxyId });
      set({ mails: result.mails, fetchResult: result });
      // 无感刷新账户状态
      useAccountStore.getState().refreshAccountsSilent();
    } finally {
      set({ loading: false });
    }
  },

  fetchCachedMails: async (accountId, mailbox) => {
    set({ loading: true });
    try {
      const data = await mailApi.cached({ account_id: accountId, mailbox, pageSize: 100 });
      set({ mails: data.list });
    } finally {
      set({ loading: false });
    }
  },

  clearMailbox: async (accountId, mailbox, proxyId) => {
    await mailApi.clear({ account_id: accountId, mailbox, proxy_id: proxyId });
    set({ mails: [], selectedMail: null });
    useAccountStore.getState().refreshAccountsSilent();
  },

  selectMail: (mail) => set({ selectedMail: mail }),
}));
