import { runCode } from "@/utils/code";

export async function POST(request: Request) {
  const { authToken, languageId, sourceCode } = await request.json();
  const result = await runCode(authToken, languageId, sourceCode);
  return Response.json(result);
}
