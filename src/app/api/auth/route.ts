import { getOrCreateDocAndToken } from "@y-sweet/sdk";
import { notFound } from "next/navigation";

import * as crud from "@/utils/crud";

export async function POST(request: Request) {
  const { docId } = await request.json();

  const interview = await crud.getInterviewByToken(docId);
  if (!interview) {
    notFound();
  }

  const clientToken = await getOrCreateDocAndToken(
    process.env.Y_SWEET_CONNECTION_STRING,
    docId,
  );

  return Response.json(clientToken);
}
