// Экран 1. Заставка и загрузка: логотип, который покачивается, полоска и проценты.
import { makeScreenRoot } from '../ui.js';

export function createLoadingScreen() {
  // Анимация логотипа (стили лежат здесь, чтобы не трогать style.css)
  const st = document.createElement('style');
  st.textContent = `
    @keyframes ecoBounce { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-12px) scale(1.04); } }
    .loadLogo { animation: ecoBounce 1.6s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) { .loadLogo { animation: none; } }
  `;
  document.head.appendChild(st);

  const s = makeScreenRoot(`
    <img class="loadLogo" src="assets/logo/logo-round.png" alt="Экотоп" style="width:min(50vw,230px);height:auto;border-radius:50%;margin-bottom:14px;">
    <h1 class="logo">Юный Эколог</h1>
    <p class="big" id="loadText">Загрузка… 0%</p>
    <div class="bar"><div class="barFill" id="barFill"></div></div>
  `, 'solid green');
  s.show();

  return {
    setProgress(p) {
      const pct = Math.round(Math.min(1, p) * 100);
      s.$('#barFill').style.width = pct + '%';
      s.$('#loadText').textContent = 'Загрузка… ' + pct + '%';
    },
    showError(text) {
      s.root.classList.remove('green');
      s.root.classList.add('red');
      s.root.innerHTML = `<h1 class="logo">Ой, не загрузилось</h1><p class="big">${text}</p>`;
    },
    hide() { s.hide(); },
  };
}
