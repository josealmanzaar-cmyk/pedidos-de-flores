-- ============================================================
-- PERMISOS DEL ADMIN (córrelo UNA vez en Supabase > SQL Editor)
-- ============================================================
-- ANTES DE CORRERLO:
--   1) Cambia  TU_CORREO@ejemplo.com  por el correo con el que
--      vas a entrar al admin (hay 7 lugares, usa buscar y reemplazar).
--   2) Crea ese usuario en Supabase:
--      Authentication > Users > Add user > Create new user
--      (pon tu correo y una contraseña larga, y marca "Auto Confirm User").
--   3) Apaga los registros nuevos:
--      Authentication > Sign In / Providers > desactiva "Allow new users to sign up".
--
-- Ya existen (no los repitas):
--   - tabla flores  + política "lectura publica"  (todos leen el catálogo)
--   - tabla pedidos + política "crear pedidos"    (todos pueden enviar pedidos)
-- Con esto, SOLO tú podrás leer/editar/borrar pedidos y editar flores.
-- ============================================================

-- ---------- PEDIDOS: solo el admin lee, cambia y borra ----------
DROP POLICY IF EXISTS "admin lee pedidos" ON pedidos;
CREATE POLICY "admin lee pedidos"
ON pedidos FOR SELECT TO authenticated
USING ((auth.jwt() ->> 'email') = 'josealmanzaar@gamil.com');

DROP POLICY IF EXISTS "admin actualiza pedidos" ON pedidos;
CREATE POLICY "admin actualiza pedidos"
ON pedidos FOR UPDATE TO authenticated
USING ((auth.jwt() ->> 'email') = 'josealmanzaar@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'josealmanzaar@gmail.com');

DROP POLICY IF EXISTS "admin borra pedidos" ON pedidos;
CREATE POLICY "admin borra pedidos"
ON pedidos FOR DELETE TO authenticated
USING ((auth.jwt() ->> 'email') = 'josealmanzaar@gmail.com');

-- ---------- FLORES: solo el admin agrega, edita y borra ----------
DROP POLICY IF EXISTS "admin agrega flores" ON flores;
CREATE POLICY "admin agrega flores"
ON flores FOR INSERT TO authenticated
WITH CHECK ((auth.jwt() ->> 'email') = 'josealmanzaar@gmail.com');

DROP POLICY IF EXISTS "admin edita flores" ON flores;
CREATE POLICY "admin edita flores"
ON flores FOR UPDATE TO authenticated
USING ((auth.jwt() ->> 'email') = 'josealmanzaar@gmail.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'josealmanzaar@gmail.com');

DROP POLICY IF EXISTS "admin borra flores" ON flores;
CREATE POLICY "admin borra flores"
ON flores FOR DELETE TO authenticated
USING ((auth.jwt() ->> 'email') = 'josealmanzaar@gmail.com');
