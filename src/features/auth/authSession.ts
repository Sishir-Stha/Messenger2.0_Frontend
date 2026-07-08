import { messagingConfig } from '../../config/messagingConfig';

const authStorageKey = 'messenger-current-user-id';

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

export const authSession = {
  getUserId(): string | null {
    if (!canUseStorage()) {
      return null;
    }

    return window.localStorage.getItem(authStorageKey);
  },

  getRequestUserId(): string {
    return this.getUserId() ?? messagingConfig.currentUserId;
  },

  setUserId(userId: string) {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.setItem(authStorageKey, userId);
  },

  clear() {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.removeItem(authStorageKey);
  },
};
