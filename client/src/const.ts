export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO = "/travel-leisure-co-official-logo.png";

// Return simple login page URL
export const getLoginUrl = () => {
  return "/login";
};
