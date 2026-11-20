// Conexión a Supabase (la usan index.html y admin.html).
// Estos dos datos son PÚBLICOS. La seguridad la dan las políticas (RLS) en Supabase.
// NUNCA pongas aquí la llave "secret" o "service_role".
const db = supabase.createClient(
  "https://jwxmhzmusckwksfewlkk.supabase.co",
  "sb_publishable_4WeI_cGo8Kw6-uQhJa6Hhg_t6zLLC3W"
);
