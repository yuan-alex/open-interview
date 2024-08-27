DROP TABLE IF EXISTS Interviews;
CREATE TABLE IF NOT EXISTS Interviews (
    id INTEGER PRIMARY KEY,
    name TEXT,
    token TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS Participants;
CREATE TABLE IF NOT EXISTS Participants (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    auth_token TEXT UNIQUE,
    interview_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (interview_id) REFERENCES Interviews(id)
);

DROP TABLE IF EXISTS CodeSubmissions;
CREATE TABLE IF NOT EXISTS CodeSubmissions (
    id INTEGER PRIMARY KEY,
    judge0_token INTEGER UNIQUE,
    source_code TEXT,
    stdout TEXT,
    stderr TEXT,
    compile_output TEXT,
    language_id INTEGER,
    interview_id INTEGER,
    participant_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (interview_id) REFERENCES Interviews(id),
    FOREIGN KEY (participant_id) REFERENCES Participants(id)
);
