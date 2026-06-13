CREATE DATABASE IF NOT EXISTS monarchy_esports;
USE monarchy_esports;

-- =====================================
-- ADMINS
-- =====================================

CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- TOURNAMENTS
-- =====================================

CREATE TABLE tournaments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    game_name VARCHAR(100),
    banner_image VARCHAR(500),
    rulebook_url VARCHAR(500),
    prize_pool DECIMAL(10,2) DEFAULT 0,

    status ENUM(
        'Upcoming',
        'Ongoing',
        'Completed'
    ) DEFAULT 'Upcoming',

    registration_start DATETIME,
    registration_end DATETIME,

    tournament_start DATETIME,
    tournament_end DATETIME,

    show_registration BOOLEAN DEFAULT FALSE,
    show_schedule BOOLEAN DEFAULT FALSE,
    show_results BOOLEAN DEFAULT FALSE,

    max_teams INT DEFAULT 32,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- REGISTRATIONS
-- =====================================

CREATE TABLE registrations (

    id INT AUTO_INCREMENT PRIMARY KEY,

    tournament_id INT NOT NULL,

    team_name VARCHAR(100) NOT NULL,
    team_logo VARCHAR(500),

    captain_name VARCHAR(100) NOT NULL,
    captain_email VARCHAR(150),
    captain_phone VARCHAR(30),

    discord_username VARCHAR(100),

    lobby_screenshot VARCHAR(500),

    status ENUM(
        'Pending',
        'Approved',
        'Rejected'
    ) DEFAULT 'Pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tournament_id)
    REFERENCES tournaments(id)
    ON DELETE CASCADE
);

-- =====================================
-- PLAYERS
-- =====================================

CREATE TABLE players (

    id INT AUTO_INCREMENT PRIMARY KEY,

    registration_id INT NOT NULL,

    real_name VARCHAR(100) NOT NULL,
    ign VARCHAR(100) NOT NULL,

    mlbb_id VARCHAR(50) NOT NULL,
    server_id VARCHAR(50) NOT NULL,

    player_photo VARCHAR(500),

    is_substitute BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (registration_id)
    REFERENCES registrations(id)
    ON DELETE CASCADE
);



-- =====================================
-- ANNOUNCEMENTS
-- =====================================

CREATE TABLE announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- NEWS
-- =====================================

CREATE TABLE news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT,
    cover_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- GALLERY
-- =====================================

CREATE TABLE gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT,
    image_url VARCHAR(500),
    caption VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tournament_id)
    REFERENCES tournaments(id)
    ON DELETE CASCADE
);

-- =====================================
-- CONTACT MESSAGES
-- =====================================

CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150),
    subject VARCHAR(255),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- =====================================
-- MATCHES
-- =====================================
CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,

    tournament_id INT NOT NULL,

    team1 VARCHAR(255) NOT NULL,
    team2 VARCHAR(255) NOT NULL,

    winner VARCHAR(255),

    match_date DATETIME,

    status ENUM(
        'Upcoming',
        'Live',
        'Completed'
    ) DEFAULT 'Upcoming',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tournament_id)
    REFERENCES tournaments(id)
    ON DELETE CASCADE
);

ALTER TABLE tournaments
ADD COLUMN tournament_format ENUM(
  'Bracket Only',
  'Round Robin + Bracket'
) DEFAULT 'Bracket Only';

ALTER TABLE matches
ADD COLUMN stage ENUM(
  'Round Robin',
  'Bracket'
) DEFAULT 'Bracket',
ADD COLUMN bracket_round VARCHAR(100),
ADD COLUMN match_no INT;


CREATE TABLE round_robin_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    group_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tournament_id)
    REFERENCES tournaments(id)
    ON DELETE CASCADE
);

CREATE TABLE round_robin_group_teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    registration_id INT,
    team_name VARCHAR(150) NOT NULL,

    full_matches INT DEFAULT 0,
    played INT DEFAULT 0,
    won INT DEFAULT 0,
    lost INT DEFAULT 0,
    bp INT DEFAULT 0,
    points INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (group_id)
    REFERENCES round_robin_groups(id)
    ON DELETE CASCADE,

    FOREIGN KEY (registration_id)
    REFERENCES registrations(id)
    ON DELETE SET NULL
);
-- =====================================
-- DUMMY ADMIN
-- =====================================

INSERT INTO admins
(username,email,password_hash)
VALUES
(
'admin',
'admin@monarchyesports.com',
'admin123'
);

-- =====================================
-- DUMMY TOURNAMENTS
-- =====================================

INSERT INTO tournaments
(
title,
subtitle,
description,
game_name,
banner_image,
rulebook_url,
prize_pool,
status,
show_registration,
show_schedule,
show_results,
max_teams
)
VALUES

(
'Echoes of Destiny',
'Second Resonance',
'Official Monarchy Esports MLBB Tournament',
'Mobile Legends: Bang Bang',
'/banners/echoes2.jpg',
'/rules/echoes-rulebook.pdf',
100000,
'Ongoing',
TRUE,
TRUE,
FALSE,
32
),

(
'Monarchy MLBB Cup',
'Season 1',
'Upcoming Community Tournament',
'Mobile Legends: Bang Bang',
'/banners/mlbbcup.jpg',
'/rules/mlbb-cup-rulebook.pdf',
50000,
'Upcoming',
TRUE,
FALSE,
FALSE,
32
),

(
'Echoes of Destiny',
'First Resonance',
'Completed Tournament',
'Mobile Legends: Bang Bang',
'/banners/echoes1.jpg',
'/rules/echoes1-rulebook.pdf',
75000,
'Completed',
FALSE,
FALSE,
TRUE,
32
);

-- =====================================
-- DUMMY REGISTRATION
-- =====================================

INSERT INTO registrations
(
    tournament_id,
    team_name,
    team_logo,
    captain_name,
    captain_email,
    captain_phone,
    discord_username,
    lobby_screenshot,
    status
)
VALUES
(
    1,
    'Team Phoenix',
    '/uploads/team_phoenix.png',
    'Kavidu',
    'kavidu@example.com',
    '0771234567',
    'kavidu#1234',
    '/uploads/lobby.jpg',
    'Pending'
);

-- =====================================
-- DUMMY PLAYERS
-- =====================================

INSERT INTO players
(
    registration_id,
    real_name,
    ign,
    mlbb_id,
    server_id,
    player_photo,
    is_substitute
)
VALUES

(1,'Kavidu Wijenayaka','Phoenix','12345678','5678','/uploads/p1.jpg',FALSE),
(1,'Player Two','Shadow','22345678','5678','/uploads/p2.jpg',FALSE),
(1,'Player Three','Reaper','32345678','5678','/uploads/p3.jpg',FALSE),
(1,'Player Four','Storm','42345678','5678','/uploads/p4.jpg',FALSE),
(1,'Player Five','Blaze','52345678','5678','/uploads/p5.jpg',FALSE),

(1,'Sub One','Ghost','62345678','5678','/uploads/s1.jpg',TRUE),
(1,'Sub Two','Nova','72345678','5678','/uploads/s2.jpg',TRUE);



-- =====================================
-- DUMMY ANNOUNCEMENTS
-- =====================================

INSERT INTO announcements
(title,message)
VALUES
(
'Registration Open',
'Registrations are now open for Monarchy MLBB Cup.'
),
(
'Tournament Schedule Released',
'Check the website for updated match schedules.'
);

-- =====================================
-- DUMMY NEWS
-- =====================================

INSERT INTO news
(title,content,cover_image)
VALUES
(
'Monarchy Esports Launches New Season',
'Welcome to the newest season of Monarchy Esports tournaments.',
'/news/news1.jpg'
);

-- =====================================
-- DUMMY GALLERY
-- =====================================

INSERT INTO gallery
(
tournament_id,
image_url,
caption
)
VALUES
(
3,
'/gallery/finals1.jpg',
'Grand Finals'
),
(
3,
'/gallery/finals2.jpg',
'Champion Celebration'
),
(
3,
'/gallery/finals3.jpg',
'Prize Ceremony'
);

-- =====================================
-- DUMMY CONTACT MESSAGE
-- =====================================

INSERT INTO contact_messages
(
name,
email,
subject,
message
)
VALUES
(
'Test User',
'test@example.com',
'Tournament Inquiry',
'When will registration close?'
);
