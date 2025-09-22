import InsuranceFlowDemo from "@/components/InsuranceFlowDemo";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function pickFirst(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function safeDecode(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
}

export default function AsesorPage({ searchParams = {} }: PageProps) {
  const advisorName = safeDecode(pickFirst(searchParams.name)) || "Asesor Demo";
  const advisorEmail = safeDecode(pickFirst(searchParams.email)) || "asesor@demo.mx";
  const startStepParam = pickFirst(searchParams.step);
  const startStep = startStepParam ? Number.parseInt(startStepParam, 10) : 0;

  return (
    <InsuranceFlowDemo
      startStep={Number.isFinite(startStep) ? Math.max(0, Math.min(5, startStep)) : 0}
      initialAdvisorName={advisorName}
      initialEmail={advisorEmail}
    />
  );
}
