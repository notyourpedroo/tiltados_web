/** Chave do localStorage com a escolha de tema ("light" | "dark"; ausente = sistema). */
export const THEME_STORAGE_KEY = "theme";

/** Roda antes da pintura para aplicar o tema salvo, sem piscar o tema errado. */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
