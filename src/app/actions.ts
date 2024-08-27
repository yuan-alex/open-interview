"use server";

import Database from "libsql";
import * as Y from "yjs";
import { DocumentManager } from "@y-sweet/sdk";

import * as crud from "../utils/crud";
import { getLanguageById } from "../utils/languages";
import { Judge0Api } from "../utils/judge0";

const judge0 = new Judge0Api(
  process.env.JUDGE0_API_URL,
  process.env.JUDGE0_AUTH_TOKEN,
);

const yDocumentManager = new DocumentManager(
  process.env.Y_SWEET_CONNECTION_STRING,
);

export async function runCode(
  authToken: string,
  languageId: number,
  sourceCode: string,
) {
  const db = new Database(process.env.LIBSQL_URL, {
    authToken: process.env.LIBSQL_AUTH_TOKEN,
  });

  const participant = crud.getParticipantByAuthToken(db, authToken);
  const language = getLanguageById(languageId);

  const submission = crud.createNewCodeSubmission(
    db,
    null,
    sourceCode,
    null,
    null,
    languageId,
    participant.interview_id,
    participant.id,
  );

  const judge0Result = await judge0.compileCodeSync(languageId, sourceCode);

  const stmt = db.prepare(
    "UPDATE CodeSubmissions SET judge0_token = ?, stdout = ?, stderr = ?, compile_output = ? WHERE id = ?",
  );
  stmt.run(
    judge0Result.token,
    judge0Result.stdout,
    judge0Result.stderr,
    judge0Result.compile_output,
    submission.lastInsertRowid,
  );

  const doc = new Y.Doc();
  doc.getArray("code_submissions").insert(0, [
    {
      id: submission.lastInsertRowid,
      languageLabel: language.label,
      stdout: judge0Result.stdout,
      stderr: judge0Result.stderr,
      compileOutput: judge0Result.compile_output,
    },
  ]);
  const update = Y.encodeStateAsUpdate(doc);

  const interview = crud.getInterviewById(db, participant.interview_id);
  await yDocumentManager.updateDoc(interview.token, update);

  return submission;
}
