"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import dynamic from "next/dynamic";
import useProject from "@/hooks/use-project";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import CommitLog from "./_components/CommitLog";
import AskQuestionCard from "./_components/AskQuestionCard";
import MeetingCard from "./_components/MeetingCard";
import ArchiveButton from "./_components/ArchiveButton";
import TeamMembers from "./_components/TeamMembers";

// Dynamically import InviteButton
const InviteButton = dynamic(() => import("./_components/InviteButton"), {
  ssr: false,
  loading: () => <div>Loading Invite...</div>, // optional loading state
});

type Props = {};

const Page = ({}: Props) => {
  const router = useRouter();
  const { user, isLoading } = useKindeAuth();
  const { project } = useProject();

  // useEffect(() => {
  //   if (!isLoading && !user) {
  //     router.push("/");
  //   }
  // }, [user, isLoading, router]);

  // if (isLoading || !user) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        {/* GITHUB LINK */}
        <div className="w-fit rounded-md bg-primary px-4 py-3">
          <div className="flex items-center">
            <Github className="size-5 text-white" />
            <div className="ml-2">
              <p className="text-sm font-medium text-white">
                This project is linked to{" "}
                <Link
                  href={project?.githuburl ?? ""}
                  className="inline-flex items-center text-white/80 hover:underline"
                  target="_blank"
                >
                  {project?.githuburl}
                  <ExternalLink className="ml-1 size-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="h-4" />

        {/* TEAM MEMBERS, INVITE, ARCHIVE */}
        <div className="flex items-center gap-4">
          <TeamMembers />
          <InviteButton />
          <ArchiveButton />
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <AskQuestionCard />
          <MeetingCard />
        </div>
      </div>

      <div className="mt-8" />

      <CommitLog />
    </div>
  );
};

export default Page;
