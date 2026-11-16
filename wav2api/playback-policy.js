// Playback choices and tracer-light decay have no browser dependencies.
export const LIGHT_DECAY_PER_SECOND = .45;
export function nextTrackIndex(length, current, direction, mode, random = Math.random) {
  if (length <= 0) return -1;
  if (mode === 'shuffle' && length > 1 && direction > 0) {
    const choice = Math.floor(Math.min(.999999, Math.max(0, random())) * (length - 1));
    return choice >= current && current >= 0 ? choice + 1 : choice;
  }
  return ((current + direction) % length + length) % length;
}
export function waveformLightFactor(outputRms, gain) {
  const sourceRms = gain > 0 ? Math.max(0, outputRms) / gain : 0;
  return .75 + .25 * Math.min(1, Math.sqrt(sourceRms) * 2);
}
export function initialLight(volume, muted, waveformFactor) {
  return (muted ? 0 : Math.max(0, Math.min(1, volume))) * waveformFactor;
}
export function lightAt(initial, age) {
  return Math.max(0, initial - Math.max(0, age) * LIGHT_DECAY_PER_SECOND);
}
