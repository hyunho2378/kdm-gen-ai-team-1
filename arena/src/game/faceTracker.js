// COMPONENTS.md: 웹캠 얼굴 추적 (R5). 컴포넌트가 아니다.
//
// **판정에 절대 유입되지 않는다.** 이 파일은 engine이 import하지 않는다.
// 소비처는 둘뿐이다. 시간 팽창 트리거(engine.setDilationTrigger로 주입)와
// 렌더러의 헤드 패럴랙스. 전자는 "발동할까"라는 불리언 하나만 넘기고
// 아날로그 값 자체는 판정 경로에 들어가지 않는다(ARENA_INPUT 1절 연속 채널 규율과 같은 이유).
//
// **MediaPipe는 CDN에서 받는다. 번들에 넣지 않는다.** vision_bundle이 수 MB라
// 번들에 넣으면 첫 로드가 느려지고, 실패해도 게임은 그대로 돌아야 하므로 의존성으로 묶지 않는다.
// Vite가 이 URL을 해석하려 들지 않게 @vite-ignore를 단다.
//
// 추론은 메인 루프와 분리된 15Hz 스로틀로 돈다. 60fps 렌더 루프 안에서 추론을 부르면
// 프레임이 통째로 밀린다. 렌더는 마지막 추론 결과를 읽기만 한다.

const VISION_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';
const WASM_ROOT = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

/** 추론 주기. 얼굴은 빠르게 안 움직이므로 15Hz면 충분하고 CPU 여유가 남는다. */
const INFER_HZ = 15;
const INFER_MS = 1000 / INFER_HZ;

/** 지표는 전부 EMA로 눌러 쓴다. 원시값은 프레임마다 튄다. */
const EMA_FAST = 0.25;   // 위치. 따라오는 느낌이 있어야 한다
const EMA_SLOW = 0.08;   // 안정도. 천천히 쌓여야 판단이 흔들리지 않는다

/** 이 값을 넘게 안정되어 있으면 "집중"으로 본다. 시간 팽창의 캠 경로 조건이다. */
const FOCUS_STABILITY = 0.72;
/** 요가 이보다 크면 딴 데를 보는 중이다. 집중으로 치지 않는다. */
const FOCUS_YAW = 0.30;

const LOST_MS = 700;     // 이만큼 얼굴이 없으면 소실로 본다

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * 상태는 다섯이다. 어느 상태에서도 게임은 멈추지 않는다.
 * off(미기동) / requesting(권한 대기) / denied(거부) / ready(추적 중) / lost(얼굴 소실)
 */
export const CAM = {
  OFF: 'off',
  REQUESTING: 'requesting',
  DENIED: 'denied',
  READY: 'ready',
  LOST: 'lost',
};

/** 화면 라벨. 색 단독 구분 금지라 StatusChip이 이 텍스트를 그대로 낸다. */
export const CAM_LABEL = {
  [CAM.OFF]: '없음',
  [CAM.REQUESTING]: '요청 중',
  [CAM.DENIED]: '거부됨',
  [CAM.READY]: '추적 중',
  [CAM.LOST]: '얼굴 없음',
};

export function createFaceTracker() {
  let status = CAM.OFF;
  let video = null;
  let stream = null;
  let landmarker = null;
  let timer = 0;
  let disposed = false;
  let lastSeenAt = 0;
  let onStatus = null;

  // 지표 4개. 전부 EMA를 거친 값이다
  const m = { headX: 0, headYaw: 0, scale: 0, stability: 0 };
  // 안정도 계산용 직전 원시 위치
  let prevRaw = null;

  function setStatus(next) {
    if (status === next) return;
    status = next;
    onStatus?.(status);
  }

  /**
   * 한 프레임 추론. 실패해도 던지지 않는다.
   * 실패가 곧 게임 중단이 되면 안 되므로 여기서 전부 삼키고 상태만 바꾼다.
   */
  function infer(now) {
    if (!landmarker || !video || video.readyState < 2) return;
    let res = null;
    try {
      res = landmarker.detectForVideo(video, now);
    } catch {
      return;
    }
    const face = res?.faceLandmarks?.[0];
    if (!face || face.length === 0) {
      if (now - lastSeenAt > LOST_MS) {
        setStatus(CAM.LOST);
        // 소실이면 지표를 0으로 되돌린다. 패럴랙스가 마지막 자세에 굳으면 안 된다
        m.headX += (0 - m.headX) * EMA_FAST;
        m.headYaw += (0 - m.headYaw) * EMA_FAST;
        m.stability += (0 - m.stability) * EMA_SLOW;
      }
      return;
    }
    lastSeenAt = now;
    setStatus(CAM.READY);

    // 468 랜드마크 중 셋만 쓴다. 코끝(1)과 양 눈꼬리(33, 263)면 요와 위치와 크기가 나온다
    const nose = face[1];
    const le = face[33];
    const re = face[263];
    if (!nose || !le || !re) return;

    // 화면 중앙 기준 정규화. MediaPipe 좌표는 0~1이고 x는 거울상이다
    const rawX = clamp((0.5 - nose.x) * 2, -1, 1);
    // 요는 두 눈 중점 대비 코의 좌우 치우침으로 근사한다. 각도 추정보다 싸고 충분히 안정적이다
    const mid = (le.x + re.x) / 2;
    const span = Math.abs(re.x - le.x) || 1e-3;
    const rawYaw = clamp(((nose.x - mid) / span) * 2, -1, 1);
    // 얼굴 크기. 앞뒤 움직임이다
    const rawScale = clamp((span - 0.13) / 0.10, -1, 1);

    // 안정도. 직전 프레임 대비 움직임이 작을수록 1에 가깝다
    let steady = 0;
    if (prevRaw) {
      const jump = Math.hypot(rawX - prevRaw.x, rawYaw - prevRaw.yaw, rawScale - prevRaw.s);
      steady = clamp(1 - jump * 6, 0, 1);
    }
    prevRaw = { x: rawX, yaw: rawYaw, s: rawScale };

    m.headX += (rawX - m.headX) * EMA_FAST;
    m.headYaw += (rawYaw - m.headYaw) * EMA_FAST;
    m.scale += (rawScale - m.scale) * EMA_FAST;
    m.stability += (steady - m.stability) * EMA_SLOW;
  }

  return {
    /** 상태 변화 알림. StatusChip이 구독한다. */
    onStatusChange(fn) {
      onStatus = typeof fn === 'function' ? fn : null;
    },

    getStatus() {
      return status;
    },

    /**
     * 기동. 사용자 제스처 안에서 부른다(getUserMedia 권한 정책).
     * 어느 단계에서 실패하든 상태만 바꾸고 조용히 물러난다. 게임은 계속 돈다.
     */
    async start() {
      if (status === CAM.READY || status === CAM.REQUESTING) return;
      setStatus(CAM.REQUESTING);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });
      } catch {
        setStatus(CAM.DENIED);
        return;
      }
      if (disposed) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      video = document.createElement('video');
      video.playsInline = true;
      video.muted = true;
      video.srcObject = stream;
      try {
        await video.play();
      } catch {
        setStatus(CAM.DENIED);
        return;
      }

      try {
        // 번들에 넣지 않는다. 실패하면 근사 폴백으로 조용히 내려앉는다
        const vision = await import(/* @vite-ignore */ VISION_URL);
        const files = await vision.FilesetResolver.forVisionTasks(WASM_ROOT);
        landmarker = await vision.FaceLandmarker.createFromOptions(files, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
        });
      } catch (err) {
        console.warn('[arena] 얼굴 추적 로드 실패. 근사 폴백으로 계속한다.', err);
        setStatus(CAM.DENIED);
        return;
      }
      if (disposed) return;

      lastSeenAt = performance.now();
      // **메인 루프 밖에서 돈다.** 렌더 콜백 안에서 추론하면 프레임이 통째로 밀린다
      timer = setInterval(() => infer(performance.now()), INFER_MS);
    },

    /** 지표 4개. 렌더러가 매 프레임 읽어도 되는 값이다(추론과 분리되어 있다). */
    read() {
      return m;
    },

    /**
     * 시간 팽창 트리거. engine.setDilationTrigger에 꽂힌다.
     * **불리언 하나만 넘긴다.** 아날로그 값이 판정 경로에 들어가면 결정성이 깨진다.
     * 캠이 안 서 있으면 null을 돌려 engine이 기존 성공률 근사로 판단하게 둔다(우선순위 캠 > 근사).
     */
    dilationTrigger() {
      if (status !== CAM.READY) return null;
      return { focused: m.stability >= FOCUS_STABILITY && Math.abs(m.headYaw) <= FOCUS_YAW };
    },

    dispose() {
      disposed = true;
      if (timer) clearInterval(timer);
      timer = 0;
      landmarker?.close?.();
      landmarker = null;
      stream?.getTracks().forEach((t) => t.stop());
      stream = null;
      if (video) {
        video.srcObject = null;
        video = null;
      }
      setStatus(CAM.OFF);
    },
  };
}
