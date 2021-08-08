export const CARD_LAYOUTS = {
  normal: 'normal',
  split: 'split',
  flip: 'flip',
  transform: 'transform',
  modal_dfc: 'modal_dfc',
  meld: 'meld',
  leveler: 'leveler',
  class: 'class',
  saga: 'saga',
  adventure: 'adventure',
  planar: 'planar',
  scheme: 'scheme',
  vanguard: 'vanguard',
  token: 'token',
  double_faced_token: 'double_faced_token',
  emblem: 'emblem',
  augment: 'augment',
  host: 'host',
  art_series: 'art_series',
  double_sided: 'double_sided',
};

export const DOUBLE_SIDED_LAYOUTS = [
  CARD_LAYOUTS.transform,
  CARD_LAYOUTS.modal_dfc,
  CARD_LAYOUTS.meld,
  CARD_LAYOUTS.double_faced_token,
  CARD_LAYOUTS.art_series,
  CARD_LAYOUTS.double_sided,
];

export const CARD_WIDTH = 223;
export const CARD_WIDTH_MOBILE = CARD_WIDTH * 0.8;
export const CARD_HEIGHT = 310;
export const CARD_HEIGHT_MOBILE = CARD_HEIGHT * 0.8;
export const MOBILE_WIDTH = 768;

export const POINTER_TYPE_TOUCH = 'touch';