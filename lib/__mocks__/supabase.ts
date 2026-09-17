import { jest } from '@jest/globals';

export const supabase = {
  auth: {
    signUp: jest.fn(() =>
      Promise.resolve({
        data: { user: { id: 'mock-user-id' }, session: {} },
        error: null,
      }),
    ),
    signInWithPassword: jest.fn(() =>
      Promise.resolve({
        data: { user: { id: 'mock-user-id' }, session: {} },
        error: null,
      }),
    ),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    getSession: jest.fn(() =>
      Promise.resolve({ data: { session: null }, error: null }),
    ),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
};
