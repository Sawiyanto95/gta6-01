export const CITY = { name: 'Pelagic Coast', district: 'Old Quay', extent: 245, roadPitch: 56, roadWidth: 17, seed: 46219 };
export const SAVE_KEY = 'saltline-harbor-run-v1';
export const COLORS = { ink: 0x1b3030, asphalt: 0x384447, sand: 0xd5bd93, water: 0x438c91, police: 0x263d48, gold: 0xd9954c };
export const JOBS = [
  { name: 'A Borrowed Sunset', brief: 'Mara needs wheels before the marina gates close.', meet:[0,0,15], time: 100, reward: 850, steps: ['Take the amber coupe on Pier Street.', 'Lose the patrol and reach the lighthouse road.'] },
  { name: 'Glass Current', brief: 'A sealed case is waiting in the canal district.', meet:[-28,0,15], time: 125, reward: 1250, steps: ['Pick up the case by the old cannery.', 'Drop it at the tide market.'] },
  { name: 'Last Ferry Out', brief: 'One final pickup, then disappear into the islands.', meet:[28,0,15], time: 145, reward: 2000, steps: ['Collect Mara at the south marina.', 'Shake the Harbor Patrol and reach the north ferry.'] }
];
export const TARGETS = [ [[0,0,0],[-112,0,81]], [[-84,0,-86],[112,0,-111]], [[154,0,154],[18,0,-208]] ];
