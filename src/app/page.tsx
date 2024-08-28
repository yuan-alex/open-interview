import { notFound, redirect } from "next/navigation";

import * as crud from "../utils/crud";

export default function Home() {
  async function onSubmit(event: FormData) {
    "use server";

    if (
      process.env.OPEN_INTERVIEW_AUTH_ENABLED === "true" &&
      (!event.get("password") ||
        event.get("password") !== process.env.SECRET_KEY!)
    ) {
      return notFound();
    }

    const token = crud.nanoid();

    await crud.createNewInterview(`New Interview ${new Date()}`, token);

    return redirect(`/interview/${token}`);
  }

  return (
    <div className="min-h-screen">
      <div className="text-2xl text-center my-5 font-light">Open Interview</div>
      <div className="mx-auto w-3/5 py-20">
        <p className="mb-5 text-xl font-medium text-gray-700">
          👋 All up and running!
        </p>
        <p className="text-lg text-gray-700">
          Welcome to <span className="text-blue-700">Open Interview</span>, the
          open-source web coding interview platform. You can now start
          interviewing prospective hires in a collaborative code editor all on
          your own infrastructure.
        </p>
        <div className="my-10" />
        <form action={onSubmit}>
          {process.env.NEXT_PUBLIC_OPEN_INTERIVEW_AUTH_ENABLED === "true" && (
            <input
              type="password"
              name="password"
              placeholder="OPEN_INTERVIEW_SECRET_KEY"
              className="input input-bordered w-full max-w-xs mr-4"
            />
          )}
          <button type="submit" className="btn">
            Create session
          </button>
        </form>
      </div>
    </div>
  );
}
