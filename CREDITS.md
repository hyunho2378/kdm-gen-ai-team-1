# CREDITS

간합이 쓰는 서드파티 자산과 라이선스. 라이브러리나 폰트나 에셋을 추가하면 **같은 커밋에서** 이 파일에 한 줄을 더한다.

채택 판정과 조사 근거는 `docs/LIBRARIES.md` 상단 판정표를 따른다.

## 라이브러리

| 이름 | 라이선스 | 적용 위치 | 링크 |
|---|---|---|---|
| React | MIT | 전 앱 | https://github.com/facebook/react |
| React Router | MIT | 전 앱 라우팅 | https://github.com/remix-run/react-router |
| Vite | MIT | 전 앱 빌드 | https://github.com/vitejs/vite |
| Tailwind CSS | MIT | 전 앱 유틸리티 | https://github.com/tailwindlabs/tailwindcss |
| lucide-react | ISC | 전 앱 아이콘 | https://github.com/lucide-icons/lucide |
| GSAP | GreenSock 표준 "No Charge" 라이선스 | presentation 스크롤 연출 전반(ScrollTrigger, SplitText) | https://github.com/greensock/GSAP |
| Lenis | MIT | presentation 스무스 스크롤 | https://github.com/darkroomengineering/lenis |
| Socket.IO | MIT | arena, controller, server 실시간 릴레이 | https://github.com/socketio/socket.io |
| Express | MIT | server HTTP와 헬스체크 | https://github.com/expressjs/express |
| magnetic-elements | MIT | presentation demo 섹션 CTA 자석 인력 | https://github.com/ToonRombaut/magnetic-elements |
| three.js | MIT | arena 1인칭 렌더러 | https://github.com/mrdoob/three.js |
| postprocessing | Zlib | arena 후처리(Bloom, Afterimage, ShockWave, ChromaticAberration, Vignette, HueSaturation) | https://github.com/pmndrs/postprocessing |
| 궤적 리본 | 자체 구현 | arena 궤적. `ribbon-geometry`(MIT)를 검토했으나 생성자 전용이라 in-place 갱신이 없고 폭이 단일 상수여서 나이별 감쇠를 못 한다. 매 프레임 지오메트리를 새로 만들면 가비지가 쌓여 미채택 | (참고) https://github.com/yomotsu/ribbon-geometry |
| 카메라 셰이크 (trauma 방식) | MIT, **로직 포팅** | arena 명중 연출. `three-screenshake`가 npm에 없어(404) `sajmoni/screen-shake`의 trauma 방식을 JS로 포팅 | https://github.com/sajmoni/screen-shake |

## 3D 에셋

| 이름 | 라이선스 | 적용 위치 | 링크 |
|---|---|---|---|
| Antique Rapier Sword | CC-BY-4.0 (저작자 표시 필수, 상업 이용 허용) | arena 1인칭 내 검. `arena/public/assets/sword/` | https://sketchfab.com/3d-models/antique-rapier-sword-910eb65ba53d49f3b810c0d3917a6840 |

배포 시 아래 문구를 그대로 유지한다(원본 `license.txt`의 크레딧 문구 전문).

> This work is based on "Antique Rapier Sword" (https://sketchfab.com/3d-models/antique-rapier-sword-910eb65ba53d49f3b810c0d3917a6840) by GabrielUCG (https://sketchfab.com/GabrielUCG) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)

텍스처 3장은 4096에서 1024로 리사이즈했다(36.0MB → 3.8MB). 지오메트리와 파일명은 원본 그대로다.

## 폰트

| 이름 | 라이선스 | 적용 위치 | 링크 |
|---|---|---|---|
| Pretendard Variable | SIL Open Font License 1.1 | 전 앱 본문과 제목 | https://github.com/orioncactus/pretendard |

## 대기 중

brand 작업에서 확정되면 그때 추가한다.

- Tubes Cursor — CC BY-NC-SA. brand 히어로 배경 후보. **비상업 조건이므로 도입 전 대회 제출물의 상업성 여부를 확인할 것.** 채택 시 푸터 크레딧 필수(COMPONENTS.md CreditFooter)
- liquidGL — `vendor/liquidGL`에 반입만 해 둔 상태. brand 제품 상세 카드 후보. 판정표는 ybouane/liquidglass(MIT)를 1순위로 둔다
- honzaap/SlashSaber — CC BY-4.0. arena WebGL 승격 시 참고하면 출처 표기 필수

## 사용하지 않기로 한 것

라이선스 문제로 코드를 가져오지 않는다. 개념 참고만 한다.

- ZiCog/madgwick.js — LICENSE 파일 없음. 기본적으로 사용 불가
- EmmaPoliakova/WebRTCSmartphoneController — LICENSE 파일 없음. 기본적으로 사용 불가
- naughtyduk/glitchGL — 개인 무료와 상업 유료 듀얼 라이선스
- Muggleee/liquid-glass — README에만 MIT 표기, 정식 LICENSE 파일 없음
