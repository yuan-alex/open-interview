"use server";

import * as Y from "yjs";
import { DocumentManager } from "@y-sweet/sdk";

import * as crud from "../utils/crud";
import { getLanguageById } from "../utils/languages";
import { Judge0Api } from "../utils/judge0";
import { tursoClient } from "@/utils/tursoClient";

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
  const participant = await crud.getParticipantByAuthToken(authToken);
  const language = getLanguageById(languageId);

  const submission = await crud.createNewCodeSubmission(
    null,
    sourceCode,
    null,
    null,
    languageId,
    participant.interview_id,
    participant.id,
  );

  const judge0Result =
    process.env.NODE_ENV == "development"
      ? {
          token: `STAGING ${new Date()}`,
          stdout: sourceCode,
          time: 0,
          memory: 0,
          stderr: null,
          compile_output: null,
          message: null,
        }
      : await judge0.compileCodeSync(languageId, sourceCode);

  await tursoClient().execute({
    sql: "UPDATE CodeSubmissions SET judge0_token = ?, stdout = ?, stderr = ?, compile_output = ? WHERE id = ?",
    args: [
      judge0Result.token,
      judge0Result.stdout,
      judge0Result.stderr,
      judge0Result.compile_output,
      submission.lastInsertRowid,
    ],
  });

  const result = {
    id: submission.lastInsertRowid,
    languageLabel: language.label,
    stdout: judge0Result.stdout,
    stderr: judge0Result.stderr,
    compileOutput: judge0Result.compile_output,
  };

  /*
  this still doesn't work yet... no idea why but 500 errors on cloud

  const doc = new Y.Doc();
  doc.getArray("code_submissions").insert(0, [result]);
  const update = Y.encodeStateAsUpdate(doc);

  const interview = await crud.getInterviewById(participant.interview_id);
  await yDocumentManager.updateDoc(interview.token, update);
  */

  return result;
}
