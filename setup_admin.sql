-- ============================================================
-- PERMISOS DEL ADMIN — (correo: josealmanzaar@gmail.com)
-- ============================================================

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE flores  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT lower(auth.email()) = lower('josealmanzaar@gmail.com');
$$;

-- PEDIDOS
DROP POLICY IF EXISTS "admin lee pedidos" ON pedidos;
CREATE POLICY "admin lee pedidos" ON pedidos FOR SELECT TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "admin actualiza pedidos" ON pedidos;
CREATE POLICY "admin actualiza pedidos" ON pedidos FOR UPDATE TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin borra pedidos" ON pedidos;
CREATE POLICY "admin borra pedidos" ON pedidos FOR DELETE TO authenticated
USING (public.is_admin());

-- FLORES
DROP POLICY IF EXISTS "admin agrega flores" ON flores;
CREATE POLICY "admin agrega flores" ON flores FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin edita flores" ON flores;
CREATE POLICY "admin edita flores" ON flores FOR UPDATE TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin borra flores" ON flores;
CREATE POLICY "admin borra flores" ON flores FOR DELETE TO authenticated
USING (public.is_admin());