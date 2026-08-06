// 제품 상세 라우트. **이제 자체 화면이 없다. 제품 사이트의 해당 섹션으로 보낸다(PD-2 재구조).**
//
// 5탭이 되면서 마스크와 컨트롤러가 `/products` 안에서 각자 탭 섹션을 가졌다.
// 같은 내용을 별도 페이지로 한 벌 더 두면 어느 쪽이 정본인지 갈리고, 스펙을 고칠 때
// 두 곳을 만져야 한다. 그래서 화면은 한 곳에 두고 여기는 자리로 보내기만 한다.
//
// **기존 링크를 살려 둔다.** `/product/mask`와 `/product/controller`가 밖에 이미 나가 있어서
// 404로 떨구면 그 링크가 죽는다. `replace`로 보내 뒤로가기에 이 자리가 안 쌓이게 한다.

import { Navigate } from 'react-router-dom';

export default function ProductDetail({ slug }) {
  return <Navigate to={`/products#${slug}`} replace />;
}
