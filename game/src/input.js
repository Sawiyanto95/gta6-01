export function createInput(canvas) {
  const held = new Set(), tapped = new Set();
  let mouseX = 0, mouseY = 0, locked = false;
  const down = event => { if (!held.has(event.code)) tapped.add(event.code); held.add(event.code); if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code)) event.preventDefault(); };
  const up = event => held.delete(event.code);
  window.addEventListener('keydown', down); window.addEventListener('keyup', up);
  window.addEventListener('mousemove', event => { if (locked) { mouseX += event.movementX; mouseY += event.movementY; } });
  canvas.addEventListener('click', () => { if (!locked && document.pointerLockElement !== canvas) canvas.requestPointerLock?.(); });
  document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === canvas; });
  return { held, tapped, look: () => { const value = [mouseX, mouseY]; mouseX = mouseY = 0; return value; }, endFrame: () => tapped.clear(), dispose: () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); } };
}
