// tokens.js — 강릉페이 AS-IS 디자인 토큰
// 스크린샷 79장 분석 기반 추출값
// 모든 컴포넌트는 이 파일에서만 값을 가져온다

export const colors = {
  // 브랜드 블루
  primary: {
    50:  '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',  // 큰글씨 버튼 테두리
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',  // 버튼, 링크, 활성 탭, 텍스트 강조
    800: '#1E3A8A',  // 잔액 카드 다크 네이비 배경
    900: '#1E2D6B',
  },

  // 캐시백 틸
  teal: {
    400: '#2DD4BF',
    500: '#14B8A6',  // 캐시백 진행바, "받은 금액" 텍스트
    600: '#0D9488',  // 배너 슬라이드 배경 (teal-600)
  },

  // 상태
  error: '#EF4444',
  errorDark: '#DC2626',  // red-600 (TransportCardPage 주의사항 텍스트)
  warning: '#F59E0B',
  success: '#10B981',

  // 그레이
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',  // 구분선, 비활성 입력창
    300: '#D1D5DB',
    400: '#9CA3AF',  // 비활성 탭 아이콘, placeholder
    500: '#6B7280',  // 보조 텍스트 (날짜, 거리 등)
    700: '#374151',
    800: '#1F2937',
    900: '#111827',  // 주요 본문 텍스트
  },

  // 서피스
  surface: {
    background: '#F2F4F8',
    card: '#FFFFFF',
    darkCard: '#1B4FD8',
    overlay: 'rgba(0,0,0,0.5)',
  },

  // 경고/주의 배경
  alertBg: '#FEF2F2',      // red-50 (CardLostPage·TransportCardPage 경고 박스)
  alertBorder: '#FECACA',  // red-200 (TransportCardPage 경고 박스 테두리)
  warmBorder: '#FED7AA',   // orange-200 (CardLostPage 주의사항 박스 테두리)
  warnDark: '#C2410C',     // orange-700 (CardLostPage 주의 제목 텍스트)

  // 카카오 전용 색상
  kakaoYellow: '#FEF08A', // yellow-200 (KakaoPayGuidePage 배경)
  kakaoDark:   '#78350F', // amber-900 (KakaoPayGuidePage 텍스트)

  // 특수 배너 배경
  kakaoBg: '#FEF3C7',   // 카카오 프로모 카드 배경
  donationBg: '#FFF0F3', // 기부 캠페인 핑크 배경
  tourBg: '#FFF3E0',    // 관광 섹션 따뜻한 배경
  chatBg: '#EFF6FF',    // 챗봇/파랑 배경
  pinkBg: '#FCE7F3',    // 관광 카드 분홍 배경
  greenBg: '#F0FDF4',   // 기부 카드 연두 배경
  warmBg: '#FFF7ED',    // 기부 카드 오렌지크림 배경
  purpleBg: '#EDE9FE',  // 퍼플 배경 (기부 카드, 이용안내 아이콘)
  purpleAccent: '#6D28D9', // 기부 카드 퍼플 액센트
  purpleDark: '#5B21B6', // 이용안내 아이콘 짙은 퍼플 (purple-800)
  successBg: '#F0FDF4',  // 성공/완료 화면 배경 (green-50)
  successBorder: '#BBF7D0', // 성공/완료 화면 테두리 (green-200)
  wishBg: '#FFFBEB',    // 원하는 지원금 별 아이콘 배경 (amber-50)
  warningBg: '#FFFBEB',     // Phase 2 — S5 잔액 부족 경고 배경 (amber-50)
  warningBorder: '#FDE68A', // Phase 2 — S5 잔액 부족 경고 테두리 (amber-200)

  // 배너 캐러셀 슬라이드 텍스트 색상
  banner: {
    darkRed: '#991B1B',  // 기부 배너 제목/버튼 (red-800)
    pink:    '#BE185D',  // 기부 배너 서브텍스트 (pink-700)
  },

  // 탐색 카드(ExploreScrollCard) 텍스트 계열
  explore: {
    amberDark: '#B45309',   // 카카오 카드 설명 (amber-700)
    emeraldDark: '#047857', // 지원금 카드 설명 (emerald-700)
    purpleDarker: '#4C1D95',// 소통 카드 제목 (purple-900)
    purpleMid: '#7C3AED',   // 소통 카드 화살표 (purple-600)
  },

  // 지원금 랭킹 메달 색상
  medal: {
    goldBg: '#FEF3C7',    // 1위 배경 (amber-100)
    goldIcon: '#F59E0B',  // 1위 아이콘 (amber-400)
    goldBorder: '#FDE68A',// 1위 테두리 (amber-200)
    silverBg: '#F1F5F9',  // 2위 배경 (slate-100)
    silverIcon: '#94A3B8',// 2위 아이콘 (slate-400)
    silverBorder: '#E2E8F0', // 2위 테두리 (slate-200)
    bronzeBg: '#FEF2E9',  // 3위 배경
    bronzeIcon: '#CD7C3E',// 3위 아이콘
    bronzeBorder: '#FDE8C8', // 3위 테두리
  },

  // TagChip 변형 색상
  tag: {
    cashBg:     '#D1FAE5',  // 현금 태그 배경 (emerald-100)
    cashText:   '#065F46',  // 현금 태그 글자 (emerald-800)
    voucherBg:  '#FFEDD5',  // 이용권 태그 배경 (orange-100)
    voucherText:'#9A3412',  // 이용권 태그 글자 (orange-800)
    noticeText: '#92400E',  // 알림/공지 텍스트 (amber-800)
  },

  // 매장 카테고리 아이콘 배경색 (StoreListItem)
  store: {
    category: {
      food:        '#FF6B35',  // 음식점 (오렌지)
      cafe:        '#8B5CF6',  // 카페 (보라)
      convenience: '#10B981',  // 편의점 (초록)
      lodging:     '#3B82F6',  // 숙박 (파랑)
      tour:        '#F59E0B',  // 관광 (노랑)
      mart:        '#EF4444',  // 마트 (빨강)
    },
  },

  // 다크 카드 위 텍스트
  onDark: {
    primary: '#FFFFFF',
    secondary: 'rgba(255,255,255,0.7)',
  },
};

export const typography = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Pretendard', 'Noto Sans KR', sans-serif",

  size: {
    largeTitle: '34px',   // Phase 2 — S1,S3 잔액 Large Title (Nielsen #1, Shneiderman #3)
    balance: '28px',
    balanceLarge: '36px',
    appTitle: '22px',

    xl: '20px',
    lg: '18px',
    md: '17px',
    sm: '15px',
    xs: '13px',
    xxs: '12px',
    nav: '11px',
  },

  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 800,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    loose: 1.6,
  },

  sizeLarge: {
    largeTitle: '44px',
    balance: '40px',
    balanceLarge: '48px',
    appTitle: '30px',
    xl: '26px',
    lg: '24px',
    md: '22px',
    sm: '20px',
    xs: '17px',
    xxs: '15px',
    nav: '14px',
  },
};

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
};

export const layout = {
  columns: 4,
  gutter: '8px',
  margin: '16px',
  viewport: '390px',

  topBarHeight: '44px',
  bottomNavHeight: '83px',
  qrBarHeight: '56px',

  touchMin: '44px',

  radiusCard: '16px',
  radiusPill: '999px',
  radiusChip: '20px',
  radiusButton: '12px',
  radiusModal: '20px',
  radiusSmall: '8px',
};

export const shadow = {
  card: '0 2px 8px rgba(0,0,0,0.08)',
  modal: '0 -4px 20px rgba(0,0,0,0.12)',
  button: '0 2px 6px rgba(29,78,216,0.25)',
  nav: '0 -1px 0 rgba(0,0,0,0.08)',
};
