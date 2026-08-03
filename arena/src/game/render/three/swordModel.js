// 책임: 레이피어 glTF 로드와 씬 규격 정규화. ARENA_SCENE 5절.
//
// 에셋: Antique Rapier Sword (GabrielUCG, CC-BY-4.0). 출처와 크레딧은 CREDITS.md.
//
// 왜 public에 두는가. scene.gltf가 scene.bin과 textures/를 **상대 경로 문자열**로 참조한다.
// src/assets에 두면 Vite가 .gltf만 번들해 해시 URL로 바꾸고 .bin과 텍스처는 따라가지 않아 404가 난다.
// GLTFLoader는 .gltf URL을 기준으로 리소스를 푸므로 정적 경로가 정답이다.
//
// 내부 노드를 만지지 않는다. 정규화는 바깥 컨테이너 그룹에만 건다.
// Sketchfab 모델은 내부에 스케일과 회전이 쌓여 있는 게 보통이고, 내부를 고치면 에셋 교체 때 전부 다시 해야 한다.

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { colors } from '../../../tokens.js';

const URL = '/assets/sword/scene.gltf';

/**
 * 마감 두 종.
 *
 * chrome  내 검. 크롬 재스킨이다. baseColor 맵을 떼어 청동 톤을 지우고 steel 색으로 덮는다.
 *         맵을 유지한 채로는 픽셀별 색을 못 바꾸므로 색을 갈려면 맵을 떼는 수밖에 없다.
 *         **노멀맵은 유지**해서 표면 디테일이 살고, 거칠기 맵도 남겨 마모 변주를 얻는다.
 * antique 상대 검. 원본 그대로다. 역사 속 검객이라는 서사가 골동 재질에 실린다.
 *
 * 둘 다 PMREM 환경맵이 서 있어야 발색한다. 없으면 새까맣게 나온다(V4a에서 밟은 지뢰).
 */
const FINISH = {
  chrome(m) {
    m.map = null;
    m.color = new THREE.Color(colors.steel.mid);
    m.metalness = 0.97;
    m.roughness = 0.16;
  },
  antique() {},
};

// 득점 플레어 최대 세기. 이 순간만 칼날이 블룸을 넘긴다. 레드는 사건의 색이다.
const FLARE_PEAK = 1.8;
// 평시 칼날. 스틸 톤으로 아주 옅게만 살아 있다(문턱 근처에도 못 간다)
const IDLE_EMISSIVE_INTENSITY = 0.06;

// 모듈 수준 캐시. dev의 이중 마운트나 폴백 재생성에서도 네트워크 요청은 한 번뿐이다.
let pending = null;

function loadOnce() {
  if (!pending) {
    pending = new Promise((resolve, reject) => {
      new GLTFLoader().load(URL, resolve, undefined, reject);
    });
  }
  return pending;
}

/** 이름이나 부모 이름으로 메시를 찾는다. glTF는 노드와 메시 이름이 갈리는 경우가 많다. */
function findMesh(root, re) {
  let found = null;
  root.traverse((o) => {
    if (found || !o.isMesh) return;
    if (re.test(o.name) || re.test(o.parent?.name ?? '')) found = o;
  });
  return found;
}

/**
 * 검을 씬 규격에 맞춘다.
 *
 * 이 모델은 노드 변환이 전부 항등이고 칼날이 이미 -z로 뻗어 있지만(z -0.822 ~ -0.001),
 * 그 사실을 코드에 박지 않는다. 에셋을 갈아끼워도 같은 규칙이 돌게 Box3로 축을 판별한다.
 *
 * 반환 좌표는 전부 모델 공간이다.
 */
function measure(scene) {
  scene.updateMatrixWorld(true);

  const blade = findMesh(scene, /blade/i);
  const handle = findMesh(scene, /handle|grip/i);
  if (!blade) throw new Error('칼날 메시를 찾지 못했다');

  const bladeBox = new THREE.Box3().setFromObject(blade);
  const size = bladeBox.getSize(new THREE.Vector3());
  // 장축이 칼날이 뻗는 방향이다
  const axis = size.x >= size.y && size.x >= size.z ? 0 : size.y >= size.z ? 1 : 2;

  // 손잡이 중심이 그립이다. 없으면 칼날 반대쪽 끝을 그립으로 본다
  const grip = handle
    ? new THREE.Box3().setFromObject(handle).getCenter(new THREE.Vector3())
    : bladeBox.getCenter(new THREE.Vector3());

  // 칼끝은 칼날 상자의 양 끝 중 그립에서 먼 쪽이다
  const lo = bladeBox.min.getComponent(axis);
  const hi = bladeBox.max.getComponent(axis);
  const g = grip.getComponent(axis);
  const tipOnAxis = Math.abs(hi - g) > Math.abs(lo - g) ? hi : lo;

  const tip = bladeBox.getCenter(new THREE.Vector3());
  tip.setComponent(axis, tipOnAxis);

  return { blade, grip, tip };
}

/**
 * 검 모델을 붙인다. 실패하면 던지고, 호출자가 박스 검을 그대로 둔다.
 *
 * @param parent      검 그룹(카메라의 자식). 프리셋 자세와 트윈은 이 그룹이 쥔다
 * @param finish      'chrome'(내 검) 또는 'antique'(상대 검)
 * @param flareColor  득점 플레어 색. tokens에서 온다(내 검 red.light)
 * @param tipDistance 그룹 원점에서 칼끝까지의 거리(m). 박스 검과 같은 값을 넘겨 궤적 좌표를 보존한다
 */
export async function attachSwordModel(parent, { finish = 'chrome', flareColor, tipDistance }) {
  const gltf = await loadOnce();
  // 지오메트리와 텍스처는 참조 공유된다. 상대 검이 붙어도 GPU 업로드가 늘지 않는다
  const scene = gltf.scene.clone(true);
  const { blade, grip, tip } = measure(scene);

  // 장축을 -z로 돌린다
  const dir = tip.clone().sub(grip).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(dir, new THREE.Vector3(0, 0, -1));
  const scale = tipDistance / tip.distanceTo(grip);

  // 안쪽은 평행이동만, 바깥쪽은 회전과 스케일만 맡는다. 두 겹이라야 순서가 꼬이지 않는다
  const inner = new THREE.Group();
  inner.position.copy(grip).multiplyScalar(-1);
  inner.add(scene);

  const group = new THREE.Group();
  group.quaternion.copy(quat);
  group.scale.setScalar(scale);
  group.add(inner);
  parent.add(group);

  // 머티리얼 1개를 여섯 메시가 공유하므로 그대로 만지면 손잡이까지 같이 빛난다.
  // 칼날만 따로 떼고 나머지는 한 장을 공유한다. 텍스처는 참조로 따라오니 clone에 추가 업로드가 없다.
  const apply = FINISH[finish] ?? FINISH.chrome;
  const source = blade.material;

  const hiltMaterial = source.clone();
  apply(hiltMaterial);

  const bladeMaterial = source.clone();
  apply(bladeMaterial);
  const idleColor = new THREE.Color(colors.steel.mid);
  const flare = new THREE.Color(flareColor ?? colors.steel.mid);
  bladeMaterial.emissive = idleColor.clone();
  bladeMaterial.emissiveIntensity = IDLE_EMISSIVE_INTENSITY;

  scene.traverse((o) => {
    if (o.isMesh) o.material = o === blade ? bladeMaterial : hiltMaterial;
  });

  group.traverse((o) => {
    if (!o.isMesh) return;
    // 카메라 코앞의 1인칭 무기는 휘두를 때 바운딩 판정이 어긋나 순간적으로 사라진다
    o.frustumCulled = false;
  });

  // 칼끝 앵커. 매 프레임 Box3를 다시 재지 않도록 로드 시 한 번만 심는다
  const tipAnchor = new THREE.Object3D();
  tipAnchor.position.copy(blade.worldToLocal(tip.clone()));
  blade.add(tipAnchor);

  return {
    group,
    tipAnchor,

    /**
     * 득점 플레어. 0이면 평시 크롬, 1이면 칼날이 red.light로 터진다.
     * 제곱을 먹여 솟았다 빠르게 죽는다. 색도 같이 옮겨 평시에는 붉은 기가 남지 않는다.
     */
    setFlare(t) {
      const k = Math.min(1, Math.max(0, t));
      bladeMaterial.emissive.copy(idleColor).lerp(flare, k);
      bladeMaterial.emissiveIntensity = IDLE_EMISSIVE_INTENSITY + FLARE_PEAK * k * k;
    },

    /** 보고와 검증용 실측값 */
    stats: {
      scale: +scale.toFixed(4),
      modelTipDistance: +tip.distanceTo(grip).toFixed(4),
      meshes: countMeshes(group),
      finish,
    },
    dispose() {
      bladeMaterial.dispose();
      hiltMaterial.dispose();
      parent.remove(group);
    },
  };
}

function countMeshes(root) {
  let n = 0;
  root.traverse((o) => {
    if (o.isMesh) n += 1;
  });
  return n;
}
