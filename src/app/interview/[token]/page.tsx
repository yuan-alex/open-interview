import { YDocProvider } from "@y-sweet/react";
import { DocumentManager } from "@y-sweet/sdk";
import { customAlphabet } from "nanoid/non-secure";
import { notFound } from "next/navigation";

import * as crud from "@/utils/crud";
import { getRandomAnimalName } from "@/utils/user";
import { Interview } from "./interview";

const nanoid = customAlphabet("1234567890abcdef");

export default async function InterviewServerComponent({ params }) {
  const { token } = await params;

  const interview = await crud.getInterviewByToken(token);
  if (!interview) {
    notFound();
  }

  const yDocumentManager = new DocumentManager(
    process.env.Y_SWEET_CONNECTION_STRING!,
  );

  const ySweetToken = await yDocumentManager.getOrCreateDocAndToken(token);

  const authToken = ySweetToken.token ?? nanoid();
  const name = `Anonymous ${getRandomAnimalName()}`;
  crud.createNewParticipant(token, authToken, name);

  return (
    <YDocProvider clientToken={ySweetToken}>
      <Interview authToken={authToken} ySweetAuth={ySweetToken} />
    </YDocProvider>
  );
}
