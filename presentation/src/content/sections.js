// 섹션 목록의 단일 원천. IA.md 2절 표와 1:1이다.
// 순서와 id를 여기서만 바꾼다. 추가와 삭제는 IA.md 수정 후에만 한다.
// 카피는 지침과 IA의 실제 문구다. 팀 확정이 필요한 자리는 TODO 카피로 표시했다.

export const SECTIONS = [
  {
    id: 'cover',
    label: '표지',
    title: '간합',
    lead: '거리와 타이밍을 겨루는 검술 대전.',
    // TODO 카피: 팀 확정 한 줄 정의. 위 문장은 지침 요약이며 발표 대본과 맞출 것
  },
  {
    id: 'background',
    label: '배경',
    title: '펜싱은 눈으로 배우기 어렵다',
    lead: 'Fencing Visualized의 계보를 잇되 원본 영상과 사진은 쓰지 않는다. 궤적 개념을 자체 도식으로 다시 세운다.',
    // TODO 카피: 펜싱 훈련의 문제 진술 3줄. 팀 리서치 근거와 함께
  },
  {
    id: 'insight',
    label: '인사이트',
    title: '훈련의 본질은 거리와 타이밍의 지각이다',
    lead: '기술의 문제가 아니라 지각의 문제다. 보이지 않는 간합을 보이게 만들면 훈련이 달라진다.',
    // TODO 카피: 인터뷰나 관찰에서 나온 근거 문장
  },
  {
    id: 'concept',
    label: '컨셉',
    title: '간합, 두 검 사이의 거리',
    lead: '유효 거리에 들어선 순간에만 찌르기가 성립한다. 그 순간을 늘려 지각을 확장한다.',
    // TODO 카피: 월드빌딩 서사와 시간 지각 확장 설명
  },
  {
    id: 'interactions',
    label: '인터랙션',
    title: '네 가지 판단',
    lead: '블레이드 트래킹, 풋워크 판정, 페인트 판독, 시간 팽창.',
  },
  {
    id: 'ai-workflow',
    label: 'AI 워크플로우',
    title: 'AI가 한 것과 사람이 판단한 것',
    lead: '툴 이름을 나열하지 않는다. 단계마다 무엇을 맡겼고 무엇을 우리가 정했는지 병기한다.',
  },
  {
    id: 'outputs',
    label: '산출물',
    title: '세 가지 결과물',
    lead: '브랜드 사이트, 아레나, 컨트롤러.',
  },
  {
    id: 'demo',
    label: '데모',
    title: '지금 해본다',
    lead: '심사위원 폰이 검이 된다.',
  },
];

export const SECTION_IDS = SECTIONS.map((s) => s.id);
