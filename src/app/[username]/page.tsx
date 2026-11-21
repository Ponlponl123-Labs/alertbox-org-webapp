import React, { cache } from "react";
import { Metadata } from "next";
import { getApiUrl } from "@/lib/api";
import { allowed_uri } from "@/consts/regex";
import { safeDecodeURIComponent } from "@/lib/security";
import PublicProfileClient, { PublicProfileData } from "./PublicProfileClient";
import Footer from "./footer";

type Props = {
  params: Promise<{ username: string }>;
};

const fetchProfileData = cache(
  async (username: string): Promise<PublicProfileData | null> => {
    const decodedUsername = safeDecodeURIComponent(username);
    if (!decodedUsername || !decodedUsername.startsWith("@")) {
      return null;
    }
    const uri = decodedUsername.slice(1);
    if (!allowed_uri.test(uri)) {
      return null;
    }
    try {
      const res = await fetch(
        getApiUrl(`/api/v1/profile/${encodeURIComponent(uri)}/details`),
        {
          cache: "no-store",
          signal: AbortSignal.timeout(4000),
        },
      );
      if (!res.ok) return null;
      return (await res.json()) as PublicProfileData;
    } catch {
      return null;
    }
  },
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const data = await fetchProfileData(username);
  if (!data) {
    return {
      title: "Streamer Profile - TipTo.Me!",
      description: "Support streamers on TipTo.Me!",
    };
  }

  const title = `${data.displayName || data.name} - TipTo.Me!`;
  const description =
    data.bio ||
    `Support ${data.displayName || data.name} on TipTo.Me! powered by Alertbox.org`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: data.avatar ? [data.avatar] : undefined,
    },
    icons: data.avatar ? { icon: data.avatar } : undefined,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const initialData = await fetchProfileData(username);

  return (
    <>
      <section className="w-screen min-h-dvh">
        <PublicProfileClient username={username} initialData={initialData} />
      </section>
      <Footer username={username} initialData={initialData} />
    </>
  );
}
