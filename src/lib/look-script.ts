// Shared with the layout (a server component), so it can't live in the client look-store.
/** Light / Dark. */
export const THEME_KEY = "gb:theme";
/** Plain / Gradient: "1" = gradient (the original key, so earlier choices carry over). */
export const GRADIENT_KEY = "gb:gradient";
/** The short-lived single Plain / Gradient / Dark switch, migrated on read. */
export const LEGACY_LOOK_KEY = "gb:look";

/** Runs in <head> before paint: applies the saved theme so a dark visit never starts white. */
export const LOOK_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark")t=localStorage.getItem("${LEGACY_LOOK_KEY}")==="dark"?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`;
