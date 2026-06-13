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
