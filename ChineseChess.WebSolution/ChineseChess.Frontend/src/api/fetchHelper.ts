const base = import.meta.env.VITE_API_BASE_URL?.trim();

// In dev, base will be empty: we’ll use relative paths so Vite proxy kicks in.
// In prod, base is your Azure API host.
export const apiUrl = (path: string) => {
  if (!base) return path;               // dev → "/api/...", "/hub/..."
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`; // prod → "https://api.../api/..."
};