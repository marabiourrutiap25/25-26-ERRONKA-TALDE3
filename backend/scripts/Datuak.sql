INSERT INTO
    kategoria (id, izena)
VALUES
    (1, 'Ordenagailuak'),
    (2, 'Proiektoreak'),
    (3, 'Soinu-ekipoa'),
    (4, 'Periferikoak');

INSERT INTO
    ekipamendua (
        id,
        izena,
        deskribapena,
        marka,
        modelo,
        stock,
        idKategoria
    )
VALUES
    (
        1,
        'Portatil HP',
        'HP 15" ordenagailu eramangarria',
        'HP',
        '15s-eq2000',
        10,
        1
    ),
    (
        2,
        'Portatil Lenovo',
        'ThinkPad serieko ordenagailua',
        'Lenovo',
        'ThinkPad E15',
        8,
        1
    ),
    (
        3,
        'Proiektorea Epson',
        'HD proiekzio ekipoa',
        'Epson',
        'EB-S41',
        4,
        2
    ),
    (
        4,
        'Bozgorailuak',
        'Ikasgelako soinu ekipoa',
        'Sony',
        'SS-CS5',
        6,
        3
    ),
    (
        5,
        'Sagua Logitech',
        'USB haridun sagua',
        'Logitech',
        'M100',
        25,
        4
    );

INSERT INTO
    inbentarioa (etiketa, idEkipamendu, erosketaData)
VALUES
    ('INV0001', 1, '2023-09-10'),
    ('INV0002', 1, '2023-09-11'),
    ('INV0003', 2, '2023-09-12'),
    ('INV0004', 3, '2022-05-02'),
    ('INV0005', 4, '2021-11-20'),
    ('INV0006', 5, '2024-01-15');

INSERT INTO
    gela (id, izena, taldea)
VALUES
    (1, 'G101', 'DAW1'),
    (2, 'G102', 'DAW2'),
    (3, 'L201', 'ASIR1'),
    (4, 'L202', 'ASIR2');

INSERT INTO
    kokalekua (etiketa, idGela, hasieraData, amaieraData)
VALUES
    ('INV0001', 1, '2023-09-15', NULL),
    ('INV0002', 2, '2023-09-20', NULL),
    ('INV0003', 3, '2023-10-01', NULL),
    ('INV0004', 1, '2022-06-01', '2023-09-01'),
    ('INV0004', 4, '2023-09-15', NULL),
    ('INV0005', 2, '2021-11-25', NULL),
    ('INV0006', 3, '2024-01-20', NULL);

INSERT INTO
    erabiltzailea (
        nan,
        izena,
        abizena,
        erabiltzailea,
        pasahitza,
        api_key,
        rola
    )
VALUES
    (
        '12345678A',
        'Jon',
        'López',
        'jlopez',
        '$2y$10$yBCMMsF00qeFEBJao2KnOeT9rpupjD5XtQToKKX8PiEGgMRj4JI.W', --'a'
        NULL,
        'a'
    ),
    (
        '87654321B',
        'Ane',
        'Garcia',
        'agarcia',
        '$2y$10$$2y$10$yBCMMsF00qeFEBJao2KnOeT9rpupjD5XtQToKKX8PiEGgMRj4JI.W', --'a'
        NULL,
        'e'
    ),
    (
        '11223344C',
        'Markel',
        'Ibarra',
        'mibarra',
        '$2y$10$$2y$10$yBCMMsF00qeFEBJao2KnOeT9rpupjD5XtQToKKX8PiEGgMRj4JI.W', --'a'
        NULL,
        'e'
    );