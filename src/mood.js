// «Настроение» мира: при неверном ответе мир становится серым и постепенно возвращает цвет.
// Как это работает: каждый предмет мира получает «серую добавку» в свою раскраску.
// Одно число (grayUniform) управляет сразу всем миром: 0 — обычные цвета, 1 — чёрно-белый.
import * as THREE from 'three';
import { SKY, GRAY_MAX, GRAY_IN, GRAY_HOLD, GRAY_OUT } from './config.js';

export const grayUniform = { value: 0 };

// Делает материал (раскраску предмета) способным сереть. Герой и окна ворот это не используют,
// поэтому остаются цветными.
export function grayable(material) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uGray = grayUniform;
    shader.fragmentShader = 'uniform float uGray;\n' + shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
       float grayLum = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
       gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(grayLum * 0.9), uGray);`);
  };
  return material;
}

export function createMood(scene, lights) {
  const skyNormal = new THREE.Color(SKY);
  const skySad = new THREE.Color(0x9ba3a8);
  const tmp = new THREE.Color();
  const base = { hemi: lights.hemi.intensity, sun: lights.sun.intensity };
  let level = 0, hold = 0;

  function apply() {
    grayUniform.value = level;
    tmp.copy(skyNormal).lerp(skySad, level);
    scene.background.copy(tmp);
    scene.fog.color.copy(tmp);
    lights.hemi.intensity = base.hemi * (1 - 0.25 * level);   // чуть темнее
    lights.sun.intensity = base.sun * (1 - 0.25 * level);
  }

  return {
    sadden() { hold = GRAY_HOLD; },       // вызывается при неверном ответе
    reset() { hold = 0; level = 0; apply(); },
    update(dt) {
      if (hold > 0) {
        hold -= dt;
        level = Math.min(GRAY_MAX, level + dt * GRAY_MAX / GRAY_IN);
      } else if (level > 0) {
        level = Math.max(0, level - dt * GRAY_MAX / GRAY_OUT);
      } else return;
      apply();
    },
  };
}
