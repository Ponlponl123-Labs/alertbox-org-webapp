import React from "react";
import { Metadata } from "next";
import { getApiUrl } from "@/lib/api";
import PublicProfileClient, { PublicProfileData } from "./PublicProfileClient";
import Footer from "./footer";

type Props = {
  params: Promise<{ username: string }>;
};

async function fetchProfileData(
  username: string,
): Promise<PublicProfileData | null> {
  const decodedUsername = decodeURIComponent(username);
  if (!decodedUsername.startsWith("@")) {
    return null;
  }
  const uri = decodedUsername.slice(1);
  try {
    const res = await fetch(getApiUrl(`/api/v1/profile/${uri}/details`), {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

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
      <section className="min-h-screen">
        <PublicProfileClient username={username} initialData={initialData} />
      </section>
      <Footer username={username} initialData={initialData} />
    </>
  );
}
