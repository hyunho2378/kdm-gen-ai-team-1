// hooks/usePlatform.js
// 플랫폼 분기 훅 — iOS HIG / Android MD3
//
// 우선순위:
//   1. VITE_PLATFORM 환경변수 (Vercel 배포 시 플랫폼 고정)
//      → 깃허브 1개 + Vercel 프로젝트 2개(환경변수만 다름), URL 깔끔
//   2. URL 파라미터 ?platform=android (로컬 개발 편의)
//   3. sessionStorage 캐시 (페이지 이동 후에도 유지)
//   4. 기본 'ios'

export function getPlatform() {
    if (typeof window === 'undefined') return 'ios'

    // 1. 환경변수 우선 (Vercel 배포 시 VITE_PLATFORM으로 플랫폼 고정)
    const envPlatform = import.meta.env.VITE_PLATFORM
    if (envPlatform === 'android' || envPlatform === 'ios') return envPlatform

    // 2. 로컬 개발: URL 파라미터 + sessionStorage (개발 편의)
    const params = new URLSearchParams(window.location.search)
    const urlPlatform = params.get('platform')
    if (urlPlatform === 'android' || urlPlatform === 'ios') {
        try { sessionStorage.setItem('gnp_platform', urlPlatform) } catch (e) { }
        return urlPlatform
    }
    try {
        const stored = sessionStorage.getItem('gnp_platform')
        if (stored === 'android' || stored === 'ios') return stored
    } catch (e) { }

    return 'ios'
}

export function applyPlatformClass() {
    if (typeof document === 'undefined') return
    const platform = getPlatform()
    document.body.classList.remove('platform-ios', 'platform-android')
    document.body.classList.add(`platform-${platform}`)
}

// React 훅 형태 (컴포넌트에서 사용)
export function usePlatform() {
    return getPlatform()
}

export const isAndroid = () => getPlatform() === 'android'
export const isIOS = () => getPlatform() === 'ios'
