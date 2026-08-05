# Material Design 3 학습 보고서 + 강릉페이 적용 매핑

> 강릉페이 듀얼 디자인 시스템(iOS HIG + Android MD3) 구축을 위한 학습 정리
> 작성일: 2026-05-23

---

## 1. 두 디자인 시스템의 철학

### iOS — Human Interface Guidelines (HIG)
3가지 근본 원칙:
- **Clarity (명료성)**: 모든 크기에서 읽히는 텍스트, 정확한 아이콘, 모호함 제거
- **Deference (콘텐츠 우선)**: UI는 콘텐츠를 돕되 경쟁하지 않음
- **Depth (깊이)**: 시각적 레이어와 사실적 모션으로 위계 전달

핵심 성격: 플랫 디자인, 미니멀, iOS 생태계에 녹아듦, 커스텀 제한적

### Android — Material Design 3 (M3 / Material You)
- **Material as metaphor**: 종이·잉크 물리 은유 기반
- **Dynamic Color**: 사용자 배경화면에서 색 추출, 토큰 기반 자동 테마
- **Tonal Elevation**: 그림자 대신 색조(톤)로 깊이 표현 (M3 진화)
- 강한 테마 시스템 → 브랜드 차별화 자유로움
- 2025년 "M3 Expressive"로 진화: 35개 신규 셰이프, 셰이프 모핑, full 코너 토큰

---

## 2. HIG vs MD3 핵심 차이

### 철학·시각
| 항목 | iOS HIG | Android MD3 |
|------|---------|-------------|
| 깊이 표현 | 플랫 디자인 | elevation + 톤 surface |
| 브랜드 | 생태계 통일 우선 | 브랜드 차별화 자유 |
| 색상 | 고정 시스템 컬러 | Dynamic Color (seed 기반) |
| 코너 | 고정 radius | full 토큰 + 셰이프 모핑 |

### 네비게이션
| 항목 | iOS | Android |
|------|-----|---------|
| 구조 | 플랫 (탭 기반) | 계층적 (hierarchical) |
| 뒤로가기 | 앱 내 일관된 back 버튼 (←) | 시스템 back 제스처/버튼 |
| 주요 액션 | 상단 네비 또는 하단 탭바 | FAB (플로팅 액션 버튼) |
| 화면 전환 | 우→좌 슬라이드 | 계층 관계 모션 |
| 탭 인디케이터 | 하단 점/색상 | pill 인디케이터 |

### 버튼 위계 (MD3 핵심)
MD3는 강조도에 따라 4단계:
- **Text** (낮음): 테두리·배경 없음
- **Outlined** (중간): 테두리만
- **Tonal** (중상): 연한 색 채움
- **Filled / Contained** (높음): 색 채움 + elevation
- 원칙: 화면당 단 하나의 강조 버튼 ("1 화면 1 태스크" 황금률)
- iOS는 이런 강한 위계 구분 없음 (filled + text 정도)

### 컴포넌트·디테일
| 항목 | iOS | Android |
|------|-----|---------|
| 우측 액션 | 텍스트 ("편집") | 아이콘 |
| 폰트 | San Francisco / Apple SD Gothic Neo | Roboto / Noto Sans KR |
| 날짜 선택 | 드럼·휠 스크롤 | 캘린더 인터페이스 |
| 아이콘 | 플랫·단순 | 기하학적·볼드 |
| 헤더 제목 | 중앙 정렬 | 좌측 정렬 (Top App Bar) |
| 터치 피드백 | 하이라이트 | 리플(ripple) 효과 |
| 버튼 높이 | 50~52px | 40~48px |
| 다이얼로그 | 중앙 모달 | 풀스크린/바텀시트 선호 |

---

## 3. 강릉페이 적용 매핑 (화면별)

### 공통 레이어
| 요소 | iOS (현재) | Android (전환) |
|------|-----------|----------------|
| 스테이터스바 | 44px, iOS 아이콘 SVG | 24~28px, Android 아이콘 (시계 좌측) |
| 생체인증 | Face ID 로티 (face-id-ios.json) | 지문 로티 (fingerprint) |
| 헤더 | 뒤로가기 ← + 중앙 제목 | Top App Bar, 좌측 정렬 제목 |
| 뒤로가기 | 헤더 좌측 버튼 | 시스템 제스처 (앱 내 버튼 최소화) |
| 폰트 | Apple SD Gothic Neo | Noto Sans KR |
| 버튼 | 단일 스타일, 52px | Filled/Tonal/Outlined/Text 4종, 48px |
| 탭바 | 하단 탭 (색상 활성) | Navigation Bar + pill 인디케이터 |
| 그림자 | shadow.card 플랫 | 톤 surface elevation |
| 모서리 | 고정 radius | MD3 셰이프 토큰 |

### 화면별 주요 변경
| 화면 | iOS | Android |
|------|-----|---------|
| 홈 | 하단 탭바 네비 | 동일 + pill 인디케이터, QR을 FAB로 |
| 충전/환불 인증 | Face ID 풀스크린 모달 | 지문 Biometric Prompt |
| 카드 관리 | 텍스트 우측 액션 | 아이콘 우측 액션 |
| 환불 기간 선택 | 휠 피커 | 캘린더 피커 |
| 충전 확인 | 중앙 다이얼로그 | 바텀시트 + Scrim |

---

## 4. 구현 전략

### 플랫폼 분기 방식
- `?platform=android` URL 파라미터 분기
- `usePlatform()` 훅 → 컴포넌트가 iOS/Android 자동 선택
- 코드 분리 없이 동일 파일 내 분기 (유지보수 용이)
- 발표 후 모노레포 전환 시 packages/shared로 추출 가능

### Dynamic Color
- seedColor: #1D4ED8 (강릉페이 primary)
- MD3 톤 팔레트 자동 생성 → primary/secondary/surface 매핑

### 우선 구현 순서
1. usePlatform 훅 + StatusBar 분기 (iOS/Android)
2. 생체인증 로티 교체 (Face ID → 지문)
3. 헤더(TopAppBar) 좌측 정렬 분기
4. 버튼 4종 위계 시스템
5. 탭바 pill 인디케이터
6. 날짜 피커 / 바텀시트 (여력 시)

---

## 5. 발표 포지셔닝

### "업계 최초 듀얼 디자인 시스템"
- 지역화폐 앱은 디자인 시스템 부재 (코나아이 = SI 외주, 프로젝트 단위)
- 강릉페이 리뉴얼: iOS HIG + Android MD3 양 플랫폼 네이티브 경험 제공
- 한국 시니어 사용자 = 갤럭시 다수 → Android 네이티브 패턴 중요성

### 학습 근거 명시
- HIG 3원칙 (Clarity/Deference/Depth) 준수 검증 완료
- MD3 공식 스펙 (m3.material.io) + 최신 Compose Material3 1.5 기반
- 두 시스템의 철학 차이를 표면(아이콘/폰트)이 아닌 구조(네비/위계/모션) 차원에서 반영