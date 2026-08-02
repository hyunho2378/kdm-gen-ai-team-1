# 세션 시작 헤더

모든 작업 프롬프트 맨 앞에 아래를 붙인다.

---
세션 시작. 작업 전 아래를 순서대로 읽어라.
1. 프로젝트 지침 전체
2. docs/PROGRESS.md
3. docs/DESIGN.md, shared/tokens.js (있으면)
4. 작업 영역 해당 문서: UI 모션 작업이면 docs/MOTION 절, 레이아웃이면 docs/RESPONSIVE 절 (DESIGN.md 내)
5. 스킬이 로드 가능하면 .claude/skills/coding/SKILL.md
주의: 이 스킬 SKILL.md의 name은 fullstack-product-setup이지만 폴더는 coding이다. 경로는 폴더 기준(.claude/skills/coding/).

읽은 뒤 오늘 작업 범위를 한 문단으로 선언하고 시작해라.
게임 캔버스(arena의 canvas/WebGL)는 transform opacity 규칙의 예외다. 나머지 규율은 전부 유효하다.
착수 전 docs/PROGRESS.md 진행중 칸에 영역 선점을 선언하고, 종료 시 완료·진행중·다음 작업·미해결 이슈를 기록하고 커밋해라.
커밋 메시지는 [영역] 한 일 형식. 영역: presentation, brand, arena, controller, server, docs.
---
