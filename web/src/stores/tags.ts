import { create } from 'zustand';
import type { Tag } from '../types';
import { tagApi } from '../lib/api';

interface TagStore {
  tags: Tag[];
  fetchTags: () => Promise<void>;
  createTag: (name: string, color?: string) => Promise<Tag>;
  updateTag: (id: number, data: { name?: string; color?: string }) => Promise<void>;
  deleteTag: (id: number) => Promise<void>;
  setAccountTags: (accountId: number, tagIds: number[]) => Promise<void>;
}

export const useTagStore = create<TagStore>((set) => ({
  tags: [],

  fetchTags: async () => {
    const tags = await tagApi.list();
    set({ tags });
  },

  createTag: async (name, color) => {
    const tag = await tagApi.create({ name, color });
    set(state => ({ tags: [...state.tags, tag] }));
    return tag;
  },

  updateTag: async (id, data) => {
    const tag = await tagApi.update(id, data);
    set(state => ({ tags: state.tags.map(t => t.id === id ? tag : t) }));
  },

  deleteTag: async (id) => {
    await tagApi.delete(id);
    set(state => ({ tags: state.tags.filter(t => t.id !== id) }));
  },

  setAccountTags: async (accountId, tagIds) => {
    await tagApi.setAccountTags(accountId, tagIds);
  },
}));
