-- Sectores iniciales (idempotente).
INSERT IGNORE INTO sectors (name, slug) VALUES
    ('Agroindustria',               'agroindustria'),
    ('Alimentos y bebidas',         'alimentos-y-bebidas'),
    ('Comercio electrónico',        'comercio-electronico'),
    ('Construcción e inmobiliario', 'construccion-e-inmobiliario'),
    ('Educación',                   'educacion'),
    ('Energía y medio ambiente',    'energia-y-medio-ambiente'),
    ('Entretenimiento y medios',    'entretenimiento-y-medios'),
    ('Finanzas (fintech)',          'fintech'),
    ('Impacto social',              'impacto-social'),
    ('Logística y movilidad',       'logistica-y-movilidad'),
    ('Manufactura',                 'manufactura'),
    ('Moda y diseño',               'moda-y-diseno'),
    ('Salud y bienestar',           'salud-y-bienestar'),
    ('Servicios profesionales',     'servicios-profesionales'),
    ('Tecnología y software',       'tecnologia-y-software'),
    ('Turismo y hospitalidad',      'turismo-y-hospitalidad');
