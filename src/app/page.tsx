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
      <div className="mx-auto w-4/5 lg:w-3/5">
        <div className="text-2xl mt-5 mb-24 font-light">Open Interview</div>
        <p className="mb-5 text-6xl font-bold">
          The open-source web coding interview platform
        </p>
        <p className="text-lg text-gray-700">
          Interview prospective hires in a collaborative code editor. Powered by
          your own infrastucture.
        </p>
        <div className="my-10" />
        <form action={onSubmit}>
          {process.env.NEXT_PUBLIC_OPEN_INTERIVEW_AUTH_ENABLED === "true" && (
            <input
              type="password"
              name="password"
              placeholder="OPEN_INTERVIEW_SECRET_KEY"
              className="input input-bordered input-lg w-full max-w-xs mr-4"
            />
          )}
          <button type="submit" className="btn btn-lg">
            Create session
          </button>
        </form>
      </div>
    </div>
  );
}
