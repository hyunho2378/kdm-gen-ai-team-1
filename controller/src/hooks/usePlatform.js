// hooks/usePlatform.js — 강릉페이 usePlatform 이식(플랫폼 분기 iOS HIG / Android MD3).
//
// **원본과 다른 점 하나: sessionStorage 캐시를 뺐다.** VORTEX 절대 규칙이 localStorage/sessionStorage를
// 금지한다. 폰 앱은 SPA라 새로고침이 없으므로 캐시 없이도 세션 내내 값이 안정적이다.
//
// 우선순위: 1. VITE_PLATFORM 환경변수(배포 시 플랫폼 고정) → 2. URL ?platform= (로컬 개발) → 3. 기본 'ios'.

export function getPlatform() {
  if (typeof window === 'undefined') return 'ios';

  const envPlatform = import.meta.env.VITE_PLATFORM;
  if (envPlatform === 'android' || envPlatform === 'ios') return envPlatform;

  const urlPlatform = new URLSearchParams(window.location.search).get('platform');
  if (urlPlatform === 'android' || urlPlatform === 'ios') return urlPlatform;

  return 'ios';
}

/** React 훅 형태. 컴포넌트에서 쓴다. */
export function usePlatform() {
  return getPlatform();
}

export const isAndroid = () => getPlatform() === 'android';
export const isIOS = () => getPlatform() === 'ios';
