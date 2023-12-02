// Colors from green -> blue
export const GRADIENT_COLORS = [
  "#0ea052",
  "#0d925b",
  "#0c8464",
  "#0b776d",
  "#095782",
];

export const SCREEN_SIZES = {
  TY: "479px",
  XS: "576px",
  SM: "766px",
  MD: "992px",
  LG: "1200px",
  XL: "1400px",
};

export const DEBOUNCE_DELAY = 200; // ms

export const LOGO_HEIGHT = 40; // px
export const NAV_BAR_SIDE_WIDTH = 160; // px
export const NAV_BAR_TOP_WIDTH = 50; // px

export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
export const URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

export const SITE_NAME = "SellScale";

export const API_URL = import.meta.env.VITE_API_URL;
export const PROXY_SERVER_URL = import.meta.env.VITE_PROXY_SERVER_URL;
export const ICON_GRABBER_URL = import.meta.env.VITE_ICON_GRABBER_URL;
