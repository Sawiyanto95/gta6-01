export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.06;
  const resize = () => renderer.setSize(innerWidth, innerHeight, false); window.addEventListener('resize', resize);
  return { renderer, resize };
}
export function chaseCamera(camera, actor, vehicle, dt, look) {
  const root = vehicle ? vehicle.root : actor.root;
  const yaw = (vehicle ? vehicle.yaw : actor.yaw) + Math.PI + look[0] * 0.0018;
  const distance = vehicle ? 15 : 8.4, rise = vehicle ? 5.5 : 3.7;
  const goal = new THREE.Vector3(root.position.x + Math.sin(yaw) * distance, root.position.y + rise, root.position.z + Math.cos(yaw) * distance);
  camera.position.lerp(goal, 1 - Math.exp(-dt * 4.2)); camera.lookAt(root.position.x, root.position.y + (vehicle ? 1.1 : 1.35) - look[1] * 0.004, root.position.z);
  camera.fov += ((vehicle ? 68 + Math.min(Math.abs(vehicle.speed), 22) * 0.25 : 61) - camera.fov) * Math.min(1, dt * 2); camera.updateProjectionMatrix();
  if (!vehicle) actor.yaw -= look[0] * 0.0018;
}
