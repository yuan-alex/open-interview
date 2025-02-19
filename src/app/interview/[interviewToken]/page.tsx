import { YDocProvider } from "@y-sweet/react";
import { customAlphabet } from "nanoid/non-secure";
import { notFound } from "next/navigation";

import { Interview } from "@/components/interview";
import * as crud from "@/utils/crud";
import { getRandomAnimalName } from "@/utils/user";

const nanoid = customAlphabet("1234567890abcdef");

export default async function InterviewServerComponent({ params }) {
  const { interviewToken } = await params;

  const interview = await crud.getInterviewByToken(interviewToken);
  if (!interview) {
    notFound();
  }

  const authToken = nanoid();
  const name = `Anonymous ${getRandomAnimalName()}`;
  crud.createNewParticipant(interviewToken, authToken, name);

  return (
    <YDocProvider docId={interviewToken} authEndpoint="/api/auth">
      <Interview authToken={authToken} />
    </YDocProvider>
  );
}
