import { customAlphabet } from "nanoid/non-secure";

import { tursoClient } from "./tursoClient";

export const nanoid = customAlphabet("1234567890abcdef");

export async function getInterviewById(id: string) {
  const result = await tursoClient().execute({
    sql: "SELECT * FROM Interviews WHERE id = ?",
    args: [id],
  });
  return result.rows[0];
}

export async function getInterviewByToken(token: string) {
  const result = await tursoClient().execute({
    sql: "SELECT * FROM Interviews WHERE token = ?",
    args: [token],
  });
  return result.rows[0];
}

export async function createNewInterview(name: string, token: string) {
  return await tursoClient().execute({
    sql: "INSERT INTO Interviews (name, token) VALUES (?, ?)",
    args: [name, token],
  });
}

export async function getParticipantByAuthToken(authToken: string) {
  const result = await tursoClient().execute({
    sql: "SELECT * FROM Participants WHERE auth_token = ?",
    args: [authToken],
  });
  return result.rows[0];
}

export async function createNewParticipant(
  interviewToken: string,
  authToken: string,
  name: string,
) {
  const interview = await getInterviewByToken(interviewToken);
  return await tursoClient().execute({
    sql: "INSERT INTO Participants (name, auth_token, interview_id) VALUES (?, ?, ?)",
    args: [name, authToken, interview.id],
  });
}

export async function createNewCodeSubmission(
  judge0_token: number,
  source_code: string,
  stdout: string,
  stderr: string,
  language_id: number,
  interview_id: number,
  participant_id: number,
) {
  return await tursoClient().execute({
    sql: `INSERT INTO CodeSubmissions
      (judge0_token, source_code, stdout, stderr, language_id, interview_id, participant_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      judge0_token,
      source_code,
      stdout,
      stderr,
      language_id,
      interview_id,
      participant_id,
    ],
  });
}
