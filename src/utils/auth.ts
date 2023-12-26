import { useAuthStore } from '@/store/auth';
export function getToken() {
  const authStore = useAuthStore();
  let token = authStore.token;
  const tokenExpir = authStore.tokenExpir;
  if (tokenExpir && new Date().getTime() > Number(tokenExpir)) {
    authStore.token = '';
    token = '';
  }
  if (!token) {
    return;
  }
  return token || '';
}
export function setToken(token) {
  const authStore = useAuthStore();
  authStore.token = token;
  authStore.tokenExpir = authStore.currentTime + 60 * 60 * 1000;
}
