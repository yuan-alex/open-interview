"use server";

import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { DocumentManager } from "@y-sweet/sdk";
import { customAlphabet } from "nanoid/non-secure";

import * as crud from "../../../utils/crud";
import { getRandomAnimalName } from "../../../utils/user";

const Interview = dynamic(() => import("./interview"), { ssr: false });

const nanoid = customAlphabet("1234567890abcdef");

export default async function InterviewServerComponent({ params }) {
  const interviewToken = params.token;

  const interview = await crud.getInterviewByToken(interviewToken);
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
  crud.createNewParticipant(interviewToken, authToken, name);

  return (
    <div>
      <Interview authToken={authToken} ySweetAuth={ySweetToken} />
    </div>
  );
}
