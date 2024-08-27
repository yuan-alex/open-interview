import Database from "libsql";
import { notFound, redirect } from "next/navigation";

import * as crud from "@/utils/crud";

export default function Home() {
  async function onSubmit(event: FormData) {
    "use server";

    if (
      !event.get("password") ||
      event.get("password") !== process.env.SECRET_KEY!
    ) {
      return notFound();
    }

    const db = new Database(process.env.LIBSQL_URL, {
      authToken: process.env.LIBSQL_AUTH_TOKEN,
    });
    const token = crud.nanoid();

    await crud.createNewInterview(db, `New Interview ${new Date()}`, token);

    return redirect(`/interview/${token}`);
  }

  return (
    <div className="min-h-screen">
      <div className="text-2xl text-center my-5 font-light">Open Interview</div>
      <div className="mx-auto w-3/5 py-20">
        <p className="mb-5 text-4xl font-medium text-gray-700">
          The <span className="text-blue-700">open-source</span> coding
          interview platform.
        </p>
        <p className="text-lg text-gray-700">
          Open Interview is a web programming platform built for technical
          interviews. Interview prospective hires in a collaborative code editor
          all on your own infrastructure.
        </p>
        <div className="my-10" />
        <form className="flex space-x-3" action={onSubmit}>
          <input
            type="password"
            name="password"
            placeholder="Secret key (env var SECRET_KEY)"
            className="input input-bordered w-full max-w-xs"
          />
          <button type="submit" className="btn">
            Create session
          </button>
        </form>
      </div>
    </div>
  );
}
