import { brandCards } from './brand-opening';

/** Creates only owned brand artwork; the controller keeps these nodes across the startup handoff. */
export function createBrandArtwork(prefix: string) {
  const iconMount = document.createElement('span'),
    wordMount = document.createElement('span'),
    layerMount = document.createElement('span');
  [iconMount, wordMount, layerMount].forEach((mount) => {
    mount.className = 'brand-opening-mount';
  });
  const shape = (index: number) => {
    const card = brandCards[index];
    return `<rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.rx}" transform="rotate(${card.angle} ${card.cx} ${card.cy})"/>`;
  };
  iconMount.innerHTML = `<svg class="brand-opening-symbol" viewBox="48 40 416 416" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs>${brandCards.map((_, index) => `<g id="${prefix}-occluder-${index}" data-occluder="${index}" fill="black" stroke="black" stroke-width="18" stroke-linejoin="round">${shape(index)}</g>`).join('')}
    ${brandCards
      .map(
        (_, index) =>
          `<mask id="${prefix}-mask-${index}" data-mask="${index}" maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512"><rect data-mask-background width="512" height="512" fill="white"/><g data-mask-uses>${brandCards
            .slice(index + 1)
            .map((_, next) => `<use href="#${prefix}-occluder-${index + next + 1}"/>`)
            .join('')}</g></mask>`,
      )
      .join('')}</defs>
    <g data-drawing>${brandCards.map((_, index) => `<g data-card-wrapper="${index}" mask="url(#${prefix}-mask-${index})"><g data-card="${index}"><g fill="none" stroke="currentColor" stroke-width="18" stroke-linejoin="round">${shape(index)}</g>${index === 3 ? `<g data-details transform="rotate(-3 235 276)" fill="currentColor"><g data-detail><circle cx="177" cy="219" r="15"/></g><g data-detail><circle cx="222" cy="210" r="15"/></g><g data-detail><rect x="180" y="274" width="112" height="20" rx="10" transform="rotate(-10 236 284)"/></g><g data-detail><rect x="183" y="319" width="108" height="20" rx="10" transform="rotate(-10 237 329)"/></g></g>` : ''}</g></g>`).join('')}</g>
  </svg>`;
  const logo = iconMount.querySelector<SVGSVGElement>('svg')!;
  const word = document.createElement('span');
  word.className = 'brand-opening-word';
  word.setAttribute('aria-hidden', 'true');
  [...'Preview.'].forEach((character, index) => {
    const letter = document.createElement('span');
    letter.dataset.letter = String(index);
    letter.textContent = character;
    word.append(letter);
  });
  wordMount.append(word);
  const layer = document.createElement('div');
  layer.className = 'brand-opening-layer';
  layer.hidden = true;
  const veil = document.createElement('div');
  veil.className = 'brand-opening-veil';
  veil.setAttribute('aria-hidden', 'true');
  const skip = document.createElement('button');
  skip.type = 'button';
  skip.className = 'brand-opening-skip';
  skip.textContent = '跳过开场';
  layer.append(veil, skip);
  layerMount.append(layer);
  return { iconMount, wordMount, layerMount, logo, word, layer, veil, skip };
}
