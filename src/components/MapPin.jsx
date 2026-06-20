// Icône custom Leaflet pour les pins 💩
import L from 'leaflet'

export const createCacaIcon = () =>
  L.divIcon({
    className: '',
    html: `<div style="
      font-size: 28px;
      line-height: 1;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));
      cursor: pointer;
    ">💩</div>`,
    iconSize:   [32, 32],
    iconAnchor: [16, 32],
    popupAnchor:[0, -34],
  })
