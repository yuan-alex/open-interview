import Database from "libsql";

const url = process.env.LIBSQL_URL;
const authToken = process.env.LIBSQL_AUTH_TOKEN;

const opts = {
  authToken: authToken,
};

export const db = new Database(url, opts);

export const getInterviewById = (id: string) => {
  const stmt = db.prepare("SELECT * FROM Interviews WHERE id = ?");
  return stmt.get(id);
};

export const getInterviewByToken = (token: string) => {
  const stmt = db.prepare("SELECT * FROM Interviews WHERE token = ?");
  return stmt.get(token);
};

export function createNewInterview(name: string, token: string) {
  const stmt = db.prepare(
    "INSERT INTO Interviews (name, token) VALUES (?, ?) RETURNING *",
  );
  const result = stmt.get(name, token);
  return result;
}

export function getParticipantByAuthToken(authToken: string) {
  const stmt = db.prepare("SELECT * FROM Participants WHERE auth_token = ?");
  return stmt.get(authToken);
}

export const createNewParticipant = (
  interviewToken: string,
  authToken: string,
  name: string,
) => {
  const interview = getInterviewByToken(interviewToken);
  const stmt = db.prepare(
    "INSERT INTO Participants (name, auth_token, interview_id) VALUES (?, ?, ?)",
  );
  const result = stmt.run(name, authToken, interview.id);
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
