// 책임: 방 상태 저장소. 메모리 Map 하나만 쓴다.
// 프로세스 재시작 시 전체 소멸을 전제로 한다. DB와 파일 저장 금지.

import { randomInt } from 'node:crypto';

// 혼동 문자 0, O, 1, I, L 제외한 대문자와 숫자
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 4;
const MAX_CODE_ATTEMPTS = 64;
const ROOM_TTL_MS = 1000 * 60 * 60 * 3;

/** code -> { code, arenaId, controllerId, createdAt } */
const rooms = new Map();

function randomCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}

export function createRoom(arenaId) {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const code = randomCode();
    if (rooms.has(code)) continue;
    const room = { code, arenaId, controllerId: null, createdAt: Date.now() };
    rooms.set(code, room);
    return room;
  }
  throw new Error('방 코드 생성 실패. 사용 중인 코드가 너무 많다');
}

export function getRoom(code) {
  if (typeof code !== 'string') return null;
  return rooms.get(code.trim().toUpperCase()) ?? null;
}

/** 컨트롤러를 방에 연결한다. 실패 사유를 함께 돌려준다. */
export function joinRoom(code, controllerId) {
  const room = getRoom(code);
  if (!room) return { room: null, reason: 'not_found' };
  if (room.controllerId && room.controllerId !== controllerId) {
    return { room: null, reason: 'occupied' };
  }
  room.controllerId = controllerId;
  return { room, reason: null };
}

/** 소켓이 끊길 때 방에서 제거한다. arena가 나가면 방 자체를 없앤다. */
export function leaveRoom(socketId) {
  for (const room of rooms.values()) {
    if (room.arenaId === socketId) {
      rooms.delete(room.code);
      return { room, closed: true };
    }
    if (room.controllerId === socketId) {
      room.controllerId = null;
      return { room, closed: false };
    }
  }
  return { room: null, closed: false };
}

export function peerOf(room, socketId) {
  if (!room) return null;
  if (room.arenaId === socketId) return room.controllerId;
  if (room.controllerId === socketId) return room.arenaId;
  return null;
}

export function isPaired(room) {
  return Boolean(room && room.arenaId && room.controllerId);
}

export function roomCount() {
  return rooms.size;
}

/** 오래된 방을 비운다. 메모리 무한 증가를 막는 최소 장치. */
export function sweep(now = Date.now()) {
  let removed = 0;
  for (const room of rooms.values()) {
    if (now - room.createdAt > ROOM_TTL_MS) {
      rooms.delete(room.code);
      removed += 1;
    }
  }
  return removed;
}
