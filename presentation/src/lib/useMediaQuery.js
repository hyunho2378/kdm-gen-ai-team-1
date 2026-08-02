// 책임: 구조 변화용 미디어 쿼리 구독. RESPONSIVE 유동 스케일링 절에 따라
// 크기 변화는 clamp가 맡고, 브레이크포인트는 구조가 바뀌는 자리에만 쓴다.

import { useEffect, useState } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(m.matches);
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
