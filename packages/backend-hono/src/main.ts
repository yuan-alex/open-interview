import { DocumentManager } from "@y-sweet/sdk";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import { customAlphabet } from "nanoid";
import * as Y from "yjs";

import { db } from "./utils/crud";
import * as crud from "./utils/crud";
import { Judge0Api } from "./utils/judge0";
import * as languageUtils from "./utils/languages";
import { getRandomAnimalName } from "./utils/user";

const nanoid = customAlphabet("1234567890abcdef");

const judge0 = new Judge0Api(
  process.env.JUDGE0_API_URL,
  process.env.JUDGE0_AUTH_TOKEN,
);

const yDocumentManager = new DocumentManager(
  process.env.Y_SWEET_CONNECTION_STRING,
);

const app = new Hono();

app.use(logger());

app.get("/api/create-interview", (c) => {
  const interview = crud.createNewInterview(
    `New Interview ${new Date()}`,
    nanoid(),
  );
  return c.redirect(`/interview?token=${interview.token}`);
});

app.get("/api/interview/:token/join", async (c) => {
  const interviewToken = c.req.param().token;
  const interview = crud.getInterviewByToken(interviewToken);
  if (!interview) {
    return c.notFound();
  }

  const clientToken =
    await yDocumentManager.getOrCreateDocAndToken(interviewToken);

  const authToken = clientToken.token ?? nanoid();
  const name = `Anonymous ${getRandomAnimalName()}`;
  crud.createNewParticipant(interviewToken, authToken, name);

  return c.json({
    auth_token: authToken,
    name,
    y_sweet: clientToken,
  });
});

app.post("/api/interview/submit-code", async (c) => {
  const authToken = c.req.header("Authorization");
  if (!authToken) {
    return c.notFound();
  }

  const participant = crud.getParticipantByAuthToken(authToken);
  if (!participant) {
    return c.notFound();
  }

  const body = await c.req.json();

  const language = languageUtils.getLanguageById(body.language_id);
  if (!language) {
    return c.text("Invalid language id", 400);
  }

  const submission = crud.createNewCodeSubmission(
    null,
    body.source_code,
    null,
    null,
    body.language_id,
    participant.interview_id,
    participant.id,
  );

  const judge0Result = await judge0.compileCodeSync(
    body.language_id,
    body.source_code,
  );

  const stmt = db.prepare(
    "UPDATE CodeSubmissions SET judge0_token = ?, stdout = ?, stderr = ? WHERE id = ?",
  );
  stmt.run(
    judge0Result.token,
    judge0Result.stdout,
    judge0Result.stderr,
    submission.lastInsertRowid,
  );

  const doc = new Y.Doc();
  doc.getArray("code_submissions").insert(0, [
    {
      language_label: language.label,
      stdout: judge0Result.stdout,
      stderr: judge0Result.stderr,
      compile_output: judge0Result.compile_output,
    },
  ]);
  const update = Y.encodeStateAsUpdate(doc);

  const interview = crud.getInterviewById(participant.interview_id);
  await yDocumentManager.updateDoc(interview.token, update);

  return c.text("ok");
});

app.use(
  "*",
  serveStatic({
    path:
      process.env.NODE_ENV === "development"
        ? "../client-svelte/dist/client/"
        : "../client/",
    mimes: {
      js: "application/javascript",
    },
  }),
);

const server = Bun.serve({
  port: process.env.PORT || 3001,
  fetch: app.fetch,
});

console.log(`🚀 Starting server on port ${server.port}`);
