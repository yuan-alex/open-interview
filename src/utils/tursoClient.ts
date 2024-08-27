import { Client, createClient } from "@libsql/client/http";

export function tursoClient(): Client {
  const url = process.env.LIBSQL_URL?.trim();
  if (url === undefined) {
    throw new Error("LIBSQL_URL is not defined");
  }

  const authToken = process.env.LIBSQL_AUTH_TOKEN?.trim();
  if (authToken === undefined) {
    if (!url.includes("file:")) {
      throw new Error("LIBSQL_AUTH_TOKEN is not defined");
    }
  }

  return createClient({
    url: process.env.LIBSQL_URL as string,
    authToken: process.env.LIBSQL_AUTH_TOKEN as string,
  });
}
