"use server";

import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { DocumentManager } from "@y-sweet/sdk";
import { customAlphabet } from "nanoid/non-secure";
import Database from "libsql";

import * as crud from "@/utils/crud";
import { getRandomAnimalName } from "@/utils/user";

const Interview = dynamic(() => import("./interview"), { ssr: false });

const nanoid = customAlphabet("1234567890abcdef");

export default async function InterviewServerComponent({ params }) {
  const db = new Database(process.env.LIBSQL_URL!, {
    authToken: process.env.LIBSQL_AUTH_TOKEN!,
  });

  const interviewToken = params.token;

  const interview = await crud.getInterviewByToken(db, interviewToken);
  if (!interview) {
    notFound();
  }

  const yDocumentManager = new DocumentManager(
    process.env.Y_SWEET_CONNECTION_STRING!,
  );

  const ySweetToken =
    await yDocumentManager.getOrCreateDocAndToken(interviewToken);

  const authToken = ySweetToken.token ?? nanoid();
  const name = `Anonymous ${getRandomAnimalName()}`;
  crud.createNewParticipant(db, interviewToken, authToken, name);

  return (
    <div>
      <Interview authToken={authToken} ySweetAuth={ySweetToken} />
    </div>
  );
}
