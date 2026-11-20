-- ============================================================
-- CATÁLOGO DESDE LA BASE DE DATOS (córrelo UNA vez en SQL Editor)
-- Deja tus 6 flores con las descripciones completas, igual que antes.
-- ============================================================

-- Columna para el texto junto al precio ("c/u", "por cada flor"...)
ALTER TABLE flores ADD COLUMN IF NOT EXISTS unidad TEXT DEFAULT 'c/u';

UPDATE flores SET unidad = 'por cada flor' WHERE nombre = 'Arreglo de gerberas';

-- Descripciones completas (si escribes un apóstrofe en SQL, va doble: baby''s)
UPDATE flores SET descripcion = 'Espectacular peonía artesanal en foami blanco puro. Centro tupido de pétalos rizados, matiz verde tierno en el corazón y hojas verdes con nervaduras marcadas.' WHERE nombre = 'Peonia';
UPDATE flores SET descripcion = 'Composición de mesa con botones y flores de obelisco rojo en foami. Pétalos estilizados y cálices verdes, presentado en florero de cristal con listón de yute.' WHERE nombre = 'Obelisco';
UPDATE flores SET descripcion = 'Rosa gigante de foami rojo intenso con pétalos voluminosos y curvados. Montada sobre tallo erguido de gran altura con hojas anchas, asentada en base decorativa.' WHERE nombre = 'Rosa gigante';
UPDATE flores SET descripcion = 'Girasol de gran formato en foami amarillo. Múltiples capas de pétalos finos modelados a mano y centro oscuro texturizado. Tallo firme ideal para eventos.' WHERE nombre = 'Girasol gigante';
UPDATE flores SET descripcion = 'Dos rosas rojas de gran tamaño, tulipanes en tonos blanco, rojo y rosa, detalles amarillos y baby''s breath. Montado en maceta rectangular terracota.' WHERE nombre = 'Arreglo floral';
UPDATE flores SET descripcion = 'Centro de mesa vibrante con 5 flores tipo gerbera gigantes en foami. Colores vivos y hojas verdes de gran tamaño. Base pequeña ideal para mesas o escritorios.' WHERE nombre = 'Arreglo de gerberas';

-- Revisa el resultado (deben salir 6 filas)
SELECT id, nombre, precio, unidad, imagen, disponible FROM flores ORDER BY id;
