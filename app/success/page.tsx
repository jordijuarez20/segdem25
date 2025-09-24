import SuccessClient from "@/app/success/SuccessClient";

// Ensure this page is rendered dynamically to avoid prerender/export errors
export const dynamic = "force-dynamic";

export default function SuccessPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const raw = searchParams?.session_id;
  const sessionId = Array.isArray(raw) ? raw[0] : raw;
  return <SuccessClient sessionId={sessionId} />;
}
