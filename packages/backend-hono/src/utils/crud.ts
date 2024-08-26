import { customAlphabet } from "nanoid";

import { Database } from "bun:sqlite";

export const db = new Database(process.env.DATABASE_URL || "database.sqlite");

const nanoid = customAlphabet("1234567890abcdef");

const animals = [
  "Elephant",
  "Giraffe",
  "Kangaroo",
  "Penguin",
  "Cheetah",
  "Octopus",
  "Hippopotamus",
  "Falcon",
  "Sloth",
  "Chimpanzee",
  "Narwhal",
  "Red Panda",
  "Koala",
  "Sea Turtle",
  "Armadillo",
  "Bison",
  "Platypus",
  "Lemur",
  "Ostrich",
  "Manatee",
];

function getRandomAnimal() {
  const randomIndex = Math.floor(Math.random() * animals.length);
  return animals[randomIndex];
}

export const getInterviewById = (id: string) => {
  const stmt = db.query("SELECT * FROM Interviews WHERE id = $1");
  return stmt.get(id);
};

export const getInterviewByToken = (token: string) => {
  const stmt = db.query("SELECT * FROM Interviews WHERE token = $1");
  return stmt.get(token);
};

export function createNewInterview(name: string) {
  const stmt = db.prepare(
    "INSERT INTO Interviews (name, token) VALUES ($name, $token) RETURNING *",
  );
  const result = stmt.get({
    $name: name,
    $token: nanoid(),
  });
  return result;
}

export function getParticipantByAuthToken(authToken: string) {
  const stmt = db.prepare(`
    SELECT * FROM Participants
    INNER JOIN Interviews ON Participants.interview_id = Interviews.id
    WHERE Participants.auth_token = $1;
  `);
  const participant = stmt.get(authToken);
  const interview = getInterviewById(participant.interview_id);
  return { ...participant, interview };
}

export const createNewParticipant = (
  interviewToken: string,
  authToken: string,
) => {
  const interview = getInterviewByToken(interviewToken);
  const stmt = db.prepare(`
    INSERT INTO Participants
    (name, auth_token, interview_id)
    VALUES ($name, $auth_token, $interview_id) RETURNING *
  `);
  const result = stmt.get({
    $name: `Anonymous ${getRandomAnimal()}`,
    $auth_token: authToken || nanoid(),
    $interview_id: interview.id,
  });
  return result;
};

export function createNewCodeSubmission(
  judge0_token: number,
  source_code: string,
  stdout: string,
  stderr: string,
  language_id: number,
  interview_id: number,
  participant_id: number,
) {
  const stmt = db.prepare(
    `INSERT INTO CodeSubmissions
      (judge0_token, source_code, stdout, stderr, language_id, interview_id, participant_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
      `,
  );
  const result = stmt.get(
    judge0_token,
    source_code,
    stdout,
    stderr,
    language_id,
    interview_id,
    participant_id,
  );
  return result;
}
