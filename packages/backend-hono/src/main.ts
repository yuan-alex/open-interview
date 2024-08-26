import { DocumentManager } from "@y-sweet/sdk";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import * as Y from "yjs";

import { db } from "./utils/crud";
import * as crud from "./utils/crud";
import { Judge0Api } from "./utils/judge0";
import * as languageUtils from "./utils/languages";

const judge0 = new Judge0Api(
  process.env.JUDGE0_API_URL,
  process.env.JUDGE0_AUTH_TOKEN,
);

const yDocumentManager = new DocumentManager(
  process.env.Y_SWEET_CONNECTION_STRING,
);

function parseData(data: string) {
  try {
    const parsed = JSON.parse(data);
    return parsed;
  } catch {
    return null;
  }
}

const rooms = new Map();

function joinRoom(client, roomName) {
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }
  rooms.get(roomName).add(client);
  client.room = roomName;
}

function leaveRoom(client) {
  if (client.room) {
    if (rooms.get(client.room).length === 1) {
      rooms.delete(client.room);
    } else {
      rooms.get(client.room).delete(client);
    }
    client.room = null;
  }
}

function broadcastToRoom(roomName, message) {
  if (rooms.has(roomName)) {
    for (const client of rooms.get(roomName)) {
      client.send(JSON.stringify(message));
    }
  }
}

const app = new Hono();

app.use(logger());

app.get("/api/create-interview", (c) => {
  const interview = crud.createNewInterview(`New Interview ${new Date()}`);
  return c.redirect(`/interview?token=${interview.token}`);
});

app.get("/api/interview/:token/join", async (c) => {
  const interview = crud.getInterviewByToken(c.req.param().token);
  if (!interview) {
    return c.notFound();
  }

  const clientToken = await yDocumentManager.getOrCreateDocAndToken(
    interview.token,
  );

  const participant = crud.createNewParticipant(
    interview.token,
    clientToken.token,
  );

  return c.json({
    ...participant,
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
    null,
    body.language_id,
    participant.interview_id,
    participant.id,
  );

  const result = await judge0.compileCodeSync(
    body.language_id,
    body.source_code,
  );

  const stmt = db.prepare(
    "UPDATE CodeSubmissions SET judge0_token = $1, stdout = $2, stderr = $3 WHERE id = $4",
  );
  stmt.run(result.token, result.stdout, result.stderr, submission.id);

  const doc = new Y.Doc();
  doc.getArray("code_submissions").insert(0, [
    {
      language_label: language.label,
      stdout: result.stdout,
      stderr: result.stderr,
      compile_output: result.compile_output,
    },
  ]);
  const update = Y.encodeStateAsUpdate(doc);
  await yDocumentManager.updateDoc(participant.interview.token, update);

  return c.text("ok");
});

app.use(
  "*",
  serveStatic({
    path: process.env.NODE_ENV === "development" ? "../client-svelte/dist/client/" : "../client/",
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
