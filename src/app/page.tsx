import { notFound, redirect } from "next/navigation";
import { RxCode, RxGithubLogo } from "react-icons/rx";
import { Card, Button } from "@radix-ui/themes";

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
      <div className="mx-auto w-4/5 lg:w-2/3">
        <nav className="flex items-center space-x-3 pt-5 mb-24">
          <RxCode className="w-6 h-6" />
          <div className="text-2xl">Open Interview</div>
          <div className="flex-grow" />
          <a href="https://github.com/yuan-alex/open-interview">
            <RxGithubLogo className="w-6 h-6" />
          </a>
        </nav>
        <Card className="p-24 rounded-xl">
          <p className="mb-5 text-6xl font-bold">
            The open-source web coding interview platform
          </p>
          <p className="text-2xl">
            Interview prospective hires in a collaborative code editor. Powered
            by your own infrastucture.
          </p>
          <div className="my-10" />
          <form action={onSubmit}>
            {process.env.NEXT_PUBLIC_OPEN_INTERIVEW_AUTH_ENABLED === "true" && (
              <input
                type="password"
                name="password"
                placeholder="Secret key"
                className="p-2 text-2xl border mr-4"
              />
            )}
            <Button type="submit" size="4">
              Create session
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
