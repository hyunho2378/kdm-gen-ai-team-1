// 책임: 프리로더가 끝났다는 신호 하나. cover의 등장 연출이 이 신호를 기다린다.
// 프리로더가 떠 있는 동안 cover 글자가 먼저 터지면 순서가 뒤집혀 보인다.
//
// sessionStorage를 쓰지 않는다(절대 규칙). 새로고침마다 다시 떠도 된다.
// 발표 시작 연출로는 오히려 매번 뜨는 편이 낫다.

// 프리로더가 어떤 이유로든 신호를 못 주면 화면이 영원히 멈춘다. 안전망을 둔다.
const FAILSAFE_MS = 4000;

let resolveBoot;
const booted = new Promise((resolve) => {
  resolveBoot = resolve;
});

let done = false;
export function markBooted() {
  if (done) return;
  done = true;
  resolveBoot();
}

// 히어로 첫 프레임 준비 신호. 프리로더가 폰트와 함께 이걸 기다렸다가 걷힌다(P3).
// 상한(프리로더 2.5초)이 항상 우선이라 프레임이 늦어도 화면을 인질로 잡지 않는다.
let resolveAssets;
const assets = new Promise((resolve) => {
  resolveAssets = resolve;
});
let assetsDone = false;
export function markAssetsReady() {
  if (assetsDone) return;
  assetsDone = true;
  resolveAssets();
}
export function whenAssetsReady() {
  return assets;
}

if (typeof window !== 'undefined') {
  setTimeout(markBooted, FAILSAFE_MS);
  setTimeout(markAssetsReady, FAILSAFE_MS);
}

/** 프리로더 종료를 기다린다. 이미 끝났으면 즉시 이어진다. */
export function whenBooted() {
  return booted;
}

export function isBooted() {
  return done;
}
