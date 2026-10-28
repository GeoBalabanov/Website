// Shared with the layout (a server component), so it can't live in the client look-store.
export const LOOK_KEY = "gb:look";
/** The earlier Plain / Gradient switch: "1" = gradient. */
export const OLD_LOOK_KEY = "gb:gradient";

/** Runs in <head> before paint: applies the saved look so a dark visit never starts white. */
export const LOOK_SCRIPT = `try{var l=localStorage.getItem("${LOOK_KEY}");if(l!=="plain"&&l!=="gradient"&&l!=="dark")l=localStorage.getItem("${OLD_LOOK_KEY}")==="1"?"gradient":"plain";document.documentElement.dataset.look=l}catch(e){}`;
