-- =============================================================================
-- BASE DE DATOS: GUIDESTRONOMY
-- Propósito: Guía de restaurantes del barrio La Independencia, Itagüí, Antioquia
-- Motor: MySQL 8.0+ / MariaDB 10.4+ (no ejecutar en el proyecto PostgreSQL de Supabase)
-- Codificación: UTF-8 (utf8mb4_unicode_ci)
-- =============================================================================

-- 1. CREACIÓN DE LA BASE DE DATOS
CREATE DATABASE IF NOT EXISTS guidestronomy
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- 2. SELECCIÓN DE LA BASE DE DATOS
USE guidestronomy;

-- =============================================================================
-- 3. TABLA: USUARIOS
-- Comensales, propietarios de restaurantes y administradores del sistema
-- =============================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(30) NULL,
    ciudad VARCHAR(100) NOT NULL DEFAULT 'Itagüí',
    foto_perfil VARCHAR(500) NULL,
    rol ENUM('usuario', 'propietario', 'admin') NOT NULL DEFAULT 'usuario',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_usuarios_email (email),
    INDEX idx_usuarios_rol (rol)
) ENGINE=InnoDB;

-- =============================================================================
-- 4. TABLA: CATEGORIAS
-- Tipos de comida o gastronomía disponibles en la plataforma
-- =============================================================================
CREATE TABLE IF NOT EXISTS categorias (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icono VARCHAR(30) NULL,
    descripcion VARCHAR(255) NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,

    INDEX idx_categorias_slug (slug)
) ENGINE=InnoDB;

-- =============================================================================
-- 5. TABLA: RESTAURANTES (NEGOCIOS)
-- Información principal, ubicación en La Independencia (Itagüí) y contactos
-- =============================================================================
CREATE TABLE IF NOT EXISTS restaurantes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    propietario_id BIGINT UNSIGNED NULL,
    nombre VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    especialidad VARCHAR(200) NOT NULL,
    historia TEXT NULL,
    anios_trayectoria SMALLINT UNSIGNED NULL,
    
    -- Dirección y ubicación en Itagüí
    direccion VARCHAR(255) NOT NULL,
    barrio VARCHAR(100) NOT NULL DEFAULT 'La Independencia',
    ciudad VARCHAR(100) NOT NULL DEFAULT 'Itagüí',
    departamento VARCHAR(100) NOT NULL DEFAULT 'Antioquia',
    pais VARCHAR(100) NOT NULL DEFAULT 'Colombia',
    latitud DECIMAL(10,7) NULL,
    longitud DECIMAL(10,7) NULL,
    
    -- Medios de comunicación y contacto directo
    telefono VARCHAR(30) NOT NULL,
    whatsapp VARCHAR(30) NULL,
    email VARCHAR(190) NULL,
    sitio_web VARCHAR(255) NULL,
    
    -- Rango de precio estimado: 1 = Económico, 2 = Moderado, 3 = Especial, 4 = Premium
    precio_nivel TINYINT UNSIGNED NOT NULL DEFAULT 2,
    
    -- Estado y reconocimientos
    verificado BOOLEAN NOT NULL DEFAULT FALSE,
    destacado BOOLEAN NOT NULL DEFAULT FALSE,
    joya_oculta BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_restaurante_propietario
        FOREIGN KEY (propietario_id) REFERENCES usuarios(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT chk_restaurante_precio
        CHECK (precio_nivel BETWEEN 1 AND 4),

    CONSTRAINT chk_restaurante_latitud
        CHECK (latitud IS NULL OR latitud BETWEEN -90 AND 90),

    CONSTRAINT chk_restaurante_longitud
        CHECK (longitud IS NULL OR longitud BETWEEN -180 AND 180),

    INDEX idx_restaurantes_nombre (nombre),
    INDEX idx_restaurantes_barrio (barrio, ciudad),
    INDEX idx_restaurantes_precio (precio_nivel),
    INDEX idx_restaurantes_destacados (destacado, activo),
    INDEX idx_restaurantes_joyas (joya_oculta, activo),
    INDEX idx_restaurantes_coords (latitud, longitud)
) ENGINE=InnoDB;

-- =============================================================================
-- 6. TABLA: RESTAURANTE_CATEGORIAS
-- Relación muchos a muchos entre restaurantes y sus tipos de comida
-- =============================================================================
CREATE TABLE IF NOT EXISTS restaurante_categorias (
    restaurante_id BIGINT UNSIGNED NOT NULL,
    categoria_id BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (restaurante_id, categoria_id),

    CONSTRAINT fk_rc_restaurante
        FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_rc_categoria
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_rc_categoria (categoria_id)
) ENGINE=InnoDB;

-- =============================================================================
-- 7. TABLA: HORARIOS
-- Horarios de atención de cada restaurante por día de la semana
-- Convención: 1 = Lunes, 2 = Martes, ..., 7 = Domingo
-- =============================================================================
CREATE TABLE IF NOT EXISTS horarios (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    restaurante_id BIGINT UNSIGNED NOT NULL,
    dia_semana TINYINT UNSIGNED NOT NULL,
    hora_apertura TIME NOT NULL,
    hora_cierre TIME NOT NULL,
    cerrado BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_horarios_restaurante
        FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT chk_horarios_dia
        CHECK (dia_semana BETWEEN 1 AND 7),

    INDEX idx_horarios_restaurante_dia (restaurante_id, dia_semana)
) ENGINE=InnoDB;

-- =============================================================================
-- 8. TABLA: PLATOS_MENU
-- Menú, productos ofertados y precios en Pesos Colombianos (COP)
-- =============================================================================
CREATE TABLE IF NOT EXISTS platos_menu (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    restaurante_id BIGINT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT NULL,
    precio DECIMAL(10,2) NOT NULL,
    imagen_url VARCHAR(500) NULL,
    es_especialidad BOOLEAN NOT NULL DEFAULT FALSE,
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    orden SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_platos_restaurante
        FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT chk_plato_precio
        CHECK (precio >= 0),

    INDEX idx_platos_restaurante (restaurante_id, disponible, orden)
) ENGINE=InnoDB;

-- =============================================================================
-- 9. TABLA: IMAGENES_RESTAURANTE
-- Fotografías del establecimiento, instalaciones y presentaciones de platos
-- =============================================================================
CREATE TABLE IF NOT EXISTS imagenes_restaurante (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    restaurante_id BIGINT UNSIGNED NOT NULL,
    url VARCHAR(500) NOT NULL,
    texto_alternativo VARCHAR(255) NULL,
    es_principal BOOLEAN NOT NULL DEFAULT FALSE,
    orden SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_imagen_restaurante
        FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_imagenes_restaurante (restaurante_id, orden)
) ENGINE=InnoDB;

-- =============================================================================
-- 10. TABLA: RESENAS Y CALIFICACIONES
-- Opiniones de los comensales sobre los restaurantes del barrio
-- =============================================================================
CREATE TABLE IF NOT EXISTS resenas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    restaurante_id BIGINT UNSIGNED NOT NULL,
    usuario_id BIGINT UNSIGNED NULL,
    nombre_autor VARCHAR(150) NOT NULL,
    calificacion TINYINT UNSIGNED NOT NULL,
    comentario TEXT NULL,
    verificada BOOLEAN NOT NULL DEFAULT FALSE,
    estado ENUM('publicada', 'pendiente', 'oculta') NOT NULL DEFAULT 'publicada',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_resena_restaurante
        FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_resena_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT chk_resena_calificacion
        CHECK (calificacion BETWEEN 1 AND 5),

    INDEX idx_resenas_restaurante_estado (restaurante_id, estado, fecha_creacion)
) ENGINE=InnoDB;

-- =============================================================================
-- 11. TABLA: FAVORITOS
-- Restaurantes guardados por los usuarios registrados
-- =============================================================================
CREATE TABLE IF NOT EXISTS favoritos (
    usuario_id BIGINT UNSIGNED NOT NULL,
    restaurante_id BIGINT UNSIGNED NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (usuario_id, restaurante_id),

    CONSTRAINT fk_fav_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_fav_restaurante
        FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- 12. TABLA: SOLICITUDES_REGISTRO
-- Registros propuestos desde el formulario web por dueños o vecinos de Itagüí
-- =============================================================================
CREATE TABLE IF NOT EXISTS solicitudes_registro (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre_negocio VARCHAR(150) NOT NULL,
    nombre_propietario VARCHAR(150) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    categoria_sugerida VARCHAR(100) NOT NULL,
    precio_nivel TINYINT UNSIGNED NOT NULL DEFAULT 2,
    horarios VARCHAR(255) NOT NULL,
    especialidad VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    estado ENUM('pendiente', 'aprobada', 'rechazada') NOT NULL DEFAULT 'pendiente',
    fecha_solicitud TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_solicitudes_estado (estado, fecha_solicitud)
) ENGINE=InnoDB;

-- =============================================================================
-- 13. TABLA: EVENTOS
-- Actividades gastronómicas, ferias y festivales comunitarios en Itagüí
-- =============================================================================
CREATE TABLE IF NOT EXISTS eventos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(180) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    imagen_url VARCHAR(500) NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NULL,
    lugar VARCHAR(255) NOT NULL,
    direccion VARCHAR(255) NULL,
    estado ENUM('borrador', 'publicado', 'finalizado') NOT NULL DEFAULT 'publicado',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_eventos_fechas (fecha_inicio, estado)
) ENGINE=InnoDB;

-- =============================================================================
-- 14. TABLA: SUSCRIPTORES
-- Personas suscritas al boletín gastronómico de La Independencia
-- =============================================================================
CREATE TABLE IF NOT EXISTS suscriptores (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_suscripcion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================================================
-- 15. TABLA: TESTIMONIOS
-- Reseñas destacadas de la comunidad publicadas en la página principal
-- =============================================================================
CREATE TABLE IF NOT EXISTS testimonios (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre_autor VARCHAR(150) NOT NULL,
    ciudad VARCHAR(100) NOT NULL DEFAULT 'Itagüí',
    comentario TEXT NOT NULL,
    calificacion TINYINT UNSIGNED NOT NULL DEFAULT 5,
    publicado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_testimonio_calificacion
        CHECK (calificacion BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- =============================================================================
-- INSERCIÓN DE DATOS DE PRUEBA (EJEMPLOS FICTICIOS VERIFICADOS PARA ITAGÜÍ)
-- =============================================================================

-- Categorías
INSERT INTO categorias (nombre, slug, icono, descripcion) VALUES
('Comida típica', 'comida-tipica', '🍲', 'Sancochos, frijoles montañeros y cazuelas antioqueñas'),
('Cafetería', 'cafe', '☕', 'Café especial, métodos de filtrado y repostería artesanal'),
('Panadería', 'panaderia', '🥐', 'Pandequeso, buñuelos calientes y panadería de barrio'),
('Hamburguesas', 'hamburguesas', '🍔', 'Hamburguesas artesanales con carnes seleccionadas'),
('Pizza', 'pizza', '🍕', 'Pizzas rústicas de masa madre al horno'),
('Asados y Parrilla', 'parrilla', '🥩', 'Cortes de carne al carbón, chorizos y picadas'),
('Comida rápida', 'comida-rapida', '🌭', 'Chuzos desgranados, salchipapas y perros calientes'),
('Desayunos', 'desayunos', '🍳', 'Arepas de choclo, calentados y desayunos criollos'),
('Postres y Helados', 'postres', '🍰', 'Tortas caseras, tres leches y copas de helado'),
('Saludable / Veggie', 'vegetariana', '🥗', 'Opciones vegetarianas y jugos naturales frescos')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Usuario Administrador de Prueba
INSERT INTO usuarios (nombre, apellido, email, password_hash, rol) VALUES
('Administrador', 'Guidestronomy', 'admin@guidestronomy.local', '$2y$10$e8V9M.Yj8T4K3vN7kM/iueNqN3qjFj0GfF4H5j9oZ2m8eK4qU5O.e', 'admin')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Restaurantes en La Independencia, Itagüí
INSERT INTO restaurantes (
    id, nombre, slug, descripcion, especialidad, direccion, barrio, ciudad, latitud, longitud,
    telefono, whatsapp, precio_nivel, verificado, destacado, joya_oculta
) VALUES
(
    1,
    'Fonda Tradicional Doña Rosa',
    'fonda-tradicional-dona-rosa',
    'Fonda familiar con más de 24 años de tradición culinaria en La Independencia. Sus preparaciones a fuego lento conservan la sazón de las abuelas antioqueñas.',
    'Sancocho trifásico en leña',
    'Calle 31 con Carrera 57',
    'La Independencia',
    'Itagüí',
    6.1755000,
    -75.6118000,
    '+57 311 450 1234',
    '573114501234',
    2,
    TRUE,
    TRUE,
    TRUE
),
(
    2,
    'Café & Tertulia El Encuentro',
    'cafe-tertulia-el-encuentro',
    'Un rincón acogedor para disfrutar de café cosechado en el suroeste antioqueño, métodos de filtrado manual y repostería artesanal horneada cada mañana.',
    'Café filtrado de origen y tostada francesa',
    'Carrera 58 # 31-40',
    'La Independencia',
    'Itagüí',
    6.1748000,
    -75.6125000,
    '+57 301 234 8976',
    '573012348976',
    1,
    TRUE,
    TRUE,
    FALSE
),
(
    3,
    'Panadería y Repostería El Portal del Trigo',
    'panaderia-el-portal-del-trigo',
    'El aroma a pan caliente de cada madrugada. Punto de encuentro predilecto de los vecinos de La Independencia para el desayuno y el algo.',
    'Pandequeso caliente y buñuelos rellenos',
    'Carrera 58 # 32-15',
    'La Independencia',
    'Itagüí',
    6.1742000,
    -75.6112000,
    '+57 314 567 4321',
    '573145674321',
    1,
    TRUE,
    FALSE,
    TRUE
),
(
    4,
    'Hamburguesas Urbanas La 58',
    'hamburguesas-urbanas-la-58',
    'Emprendimiento de jóvenes itagüiseños con carne 100% de res molida a diario, pan de papa artesanal y salsas de la casa.',
    'Hamburguesa La Independiente con tocineta caramelizada',
    'Calle 32 # 58-10',
    'La Independencia',
    'Itagüí',
    6.1762000,
    -75.6128000,
    '+57 319 876 5432',
    '573198765432',
    2,
    TRUE,
    TRUE,
    FALSE
),
(
    5,
    'Asados y Parrilla Donde Carlos',
    'asados-y-parrilla-donde-carlos',
    'Asadero tradicional de fines de semana. Cortes frescos preparados al carbón vegetal con chimichurri casero.',
    'Churrasco a la brasa y picada familiar',
    'Calle 30A # 56-20',
    'La Independencia',
    'Itagüí',
    6.1768000,
    -75.6105000,
    '+57 315 678 9012',
    '573156789012',
    3,
    TRUE,
    TRUE,
    TRUE
)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Relación Restaurante - Categorías
INSERT INTO restaurante_categorias (restaurante_id, categoria_id) VALUES
(1, 1), -- Fonda Doña Rosa -> Comida típica
(2, 2), -- Café El Encuentro -> Cafetería
(3, 3), -- El Portal del Trigo -> Panadería
(4, 4), -- Hamburguesas La 58 -> Hamburguesas
(5, 6)  -- Donde Carlos -> Asados y Parrilla
ON DUPLICATE KEY UPDATE restaurante_id = VALUES(restaurante_id);

-- Platos del Menú de Prueba con precios en Pesos Colombianos (COP)
INSERT INTO platos_menu (restaurante_id, nombre, descripcion, precio, es_especialidad, disponible, orden) VALUES
(1, 'Sancocho Trifásico Tradicional', 'Res, cerdo y gallina campesina con yuca, plátano, papa, arroz blanco y aguacate.', 24000.00, TRUE, TRUE, 1),
(1, 'Bandeja Paisa de la Casa', 'Frijoles con garra, arroz, chicharrón crocante de 5 patas, carne molida, huevo, tajada y arepa.', 26000.00, FALSE, TRUE, 2),
(1, 'Cazuela de Frijoles Montañera', 'Frijol cargamanto con maíz tierno, maduritos en dados, chicharrón y ripio de papa.', 20000.00, FALSE, TRUE, 3),
(2, 'Capuchino Artesanal', 'Espresso doble con leche texturizada y toque de canela silvestre.', 7500.00, FALSE, TRUE, 1),
(2, 'Café Prensa Francesa (Para dos)', 'Café de origen con notas achocolatadas y florales servido en mesa.', 11000.00, TRUE, TRUE, 2),
(2, 'Tostada Francesa con Miel de Flores', 'Pan brioche artesanal con frutas de temporada y queso campesino fresco.', 13000.00, TRUE, TRUE, 3),
(3, 'Pandequeso Tradicional al Horno', 'Masa de maíz y queso costeño horneada en el punto exacto.', 3500.00, TRUE, TRUE, 1),
(3, 'Buñuelo Gigante con Arequipe', 'Crocante por fuera y esponjoso por dentro con relleno dulce.', 4000.00, FALSE, TRUE, 2),
(4, 'Hamburguesa La Independiente (180g)', 'Carne madurada, queso cheddar fundido, tocineta en reducción de panela y cebolla crispy.', 23000.00, TRUE, TRUE, 1),
(4, 'Papas Rústicas en Cascos', 'Papas rústicas con paprika, sal marina y salsa tártara de la casa.', 9500.00, FALSE, TRUE, 2),
(5, 'Picada Mixta Familiar', 'Churrasco, costilla ahumada, morcilla envigadeña, chunchurria, papa criolla y arepas.', 58000.00, TRUE, TRUE, 1),
(5, 'Churrasco Argentino (350g)', 'Corte grueso a la brasa con papas francesas, ensalada fresca y chimichurri.', 32000.00, TRUE, TRUE, 2)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Horarios de Atención de Prueba
INSERT INTO horarios (restaurante_id, dia_semana, hora_apertura, hora_cierre, cerrado) VALUES
-- Fonda Doña Rosa (Mar a Dom)
(1, 2, '11:30:00', '16:30:00', FALSE),
(1, 3, '11:30:00', '16:30:00', FALSE),
(1, 4, '11:30:00', '16:30:00', FALSE),
(1, 5, '11:30:00', '16:30:00', FALSE),
(1, 6, '11:30:00', '17:00:00', FALSE),
(1, 7, '11:30:00', '17:00:00', FALSE),
(1, 1, '00:00:00', '00:00:00', TRUE)
ON DUPLICATE KEY UPDATE hora_apertura = VALUES(hora_apertura);

-- Imágenes de Prueba
INSERT INTO imagenes_restaurante (restaurante_id, url, texto_alternativo, es_principal, orden) VALUES
(1, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80', 'Plato típico en Fonda Doña Rosa, Itagüí', TRUE, 1),
(2, 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=700&q=80', 'Cafetería El Encuentro en La Independencia', TRUE, 1),
(3, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80', 'Panadería tradicional El Portal del Trigo', TRUE, 1),
(4, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80', 'Hamburguesa artesanal en La Independencia', TRUE, 1),
(5, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80', 'Carne a la parrilla en Asados Donde Carlos', TRUE, 1)
ON DUPLICATE KEY UPDATE url = VALUES(url);

-- Eventos de Prueba
INSERT INTO eventos (titulo, slug, descripcion, fecha_inicio, fecha_fin, lugar, direccion) VALUES
(
    'Festival del Café y Sabores de Barrio',
    'festival-del-cafe-y-sabores-de-barrio',
    'Muestra comunitaria de panaderías tradicionales, baristas de café y reposterías de La Independencia.',
    '2026-11-15 09:00:00',
    '2026-11-15 18:00:00',
    'Cancha La Independencia',
    'Carrera 58 con Calle 31, Itagüí'
),
(
    'Ruta Gastronómica de la Empanada y el Asado',
    'ruta-gastronomica-de-la-empanada-y-el-asado',
    'Ruta para degustar las mejores recetas tradicionales de empanadas de iglesia y cortes a la parrilla.',
    '2026-11-28 16:00:00',
    '2026-11-28 22:00:00',
    'Bulevar Carrera 58',
    'Barrio La Independencia, Itagüí'
)
ON DUPLICATE KEY UPDATE titulo = VALUES(titulo);

-- Testimonios de Prueba
INSERT INTO testimonios (nombre_autor, ciudad, comentario, calificacion, publicado) VALUES
('Mauricio Henao', 'Itagüí', 'Vivo en Itagüí hace 10 años y gracias a Guidestronomy descubrí una fonda con el mejor ajiaco a tres cuadras de mi casa que no tenía letrero grande.', 5, TRUE),
('Carolina Zapata', 'Envigado', 'Tener los números de WhatsApp directos y los precios claros ayuda un montón para pedir almuerzos caseros de buena calidad.', 5, TRUE),
('Julián Montoya', 'Itagüí', 'Inscribí mi negocio de hamburguesas artesanales y cada semana llegan comensales nuevos que vieron la ficha en la página.', 5, TRUE)
ON DUPLICATE KEY UPDATE comentario = VALUES(comentario);

-- =============================================================================
-- FIN DEL SCRIPT SQL PARA MYSQL
-- =============================================================================
