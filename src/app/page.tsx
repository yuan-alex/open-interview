import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { RxGithubLogo } from "react-icons/rx";
import { Button } from "@radix-ui/themes";

import demo from "./demo.png";
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
    <div className="mx-auto w-4/5 lg:w-2/3">
      <nav className="flex items-center space-x-3 pt-5 mb-24">
        <div className="text-2xl">Open Interview</div>
        <div className="flex-grow" />
        <a href="https://github.com/yuan-alex/open-interview">
          <RxGithubLogo className="w-6 h-6" />
        </a>
      </nav>
      <div className="my-32">
        <p className="mb-5 text-3xl md:text-6xl font-bold">
          The open-source web coding interview platform
        </p>
        <p className="text-lg md:text-2xl">
          Interview prospective hires in a collaborative code editor. Powered by
          your own infrastucture.
        </p>
        <div className="my-10" />
        <form action={onSubmit}>
          {process.env.NEXT_PUBLIC_OPEN_INTERIVEW_AUTH_ENABLED === "true" && (
            <input
              type="password"
              name="password"
              placeholder="Secret key"
              className="py-2 px-5 text-2xl border border-gray-600 mr-4 rounded-full"
            />
          )}
          <Button type="submit" size="4">
            Create session
          </Button>
        </form>
      </div>
      <div className="my-32">
        <Image alt="demo" src={demo} />
      </div>
    </div>
  );
}
