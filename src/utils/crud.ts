import type Database from "libsql";
import { customAlphabet } from "nanoid/non-secure";

export const nanoid = customAlphabet("1234567890abcdef");

export function getInterviewById(db: Database, id: string) {
  const stmt = db.prepare("SELECT * FROM Interviews WHERE id = ?");
  return stmt.get(id);
}

export function getInterviewByToken(db: Database, token: string) {
  const stmt = db.prepare("SELECT * FROM Interviews WHERE token = ?");
  return stmt.get(token);
}

export function createNewInterview(db: Database, name: string, token: string) {
  const stmt = db.prepare("INSERT INTO Interviews (name, token) VALUES (?, ?)");
  const result = stmt.run(name, token);
  return result;
}

export function getParticipantByAuthToken(db: Database, authToken: string) {
  const stmt = db.prepare("SELECT * FROM Participants WHERE auth_token = ?");
  return stmt.get(authToken);
}

export function createNewParticipant(
  db: Database,
  interviewToken: string,
  authToken: string,
  name: string,
) {
  const interview = getInterviewByToken(db, interviewToken);
  const stmt = db.prepare(
    "INSERT INTO Participants (name, auth_token, interview_id) VALUES (?, ?, ?)",
  );
  const result = stmt.run(name, authToken, interview.id);
  return result;
}

export function createNewCodeSubmission(
  db: Database,
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
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  const result = stmt.run(
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
