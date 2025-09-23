"use client";

import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { loadStripe } from "@stripe/stripe-js";

type ProductType = "auto" | "gmm" | "vida";
type FeatureType = "money" | "pct" | "days" | "binary" | "number";

type CriteriaMeta = {
  label: string;
  help: string;
  type: FeatureType;
};

type Policy = {
  id: string;
  brand: string;
  name: string;
  tagline?: string;
  pros?: string[];
  cons?: string[];
  features: Record<string, number>;
  condicionesURL?: string;
};

const POLICIES_AUTO: Policy[] = [
  {
    id: "axa-plus",
    brand: "AXA",
    name: "Auto Plus",
    tagline: "Equilibrio costo-cobertura",
    pros: ["Talleres certificados amplios", "App con seguimiento de siniestros"],
    cons: ["Deducible no negociable"],
    condicionesURL: "https://example.com/axa/condiciones.pdf",
    features: {
      priceMonthly: 879,
      liability: 4000,
      collision: 300,
      theft: 250,
      roadside: 1,
      glass: 1,
      legalAid: 1,
      deductible: 5,
      claimDays: 4,
      nps: 63,
      workshopNetwork: 950,
      telematicsDiscount: 10,
    },
  },
  {
    id: "gnp-elite",
    brand: "GNP",
    name: "Elite",
    tagline: "Cobertura alta y rapido siniestro",
    pros: ["Gestion agil de siniestros", "Coberturas altas en colision"],
    cons: ["Precio mensual elevado"],
    condicionesURL: "https://example.com/gnp/condiciones.pdf",
    features: {
      priceMonthly: 1099,
      liability: 6000,
      collision: 500,
      theft: 350,
      roadside: 1,
      glass: 1,
      legalAid: 1,
      deductible: 5,
      claimDays: 3,
      nps: 71,
      workshopNetwork: 800,
      telematicsDiscount: 5,
    },
  },
  {
    id: "qualitas-flex",
    brand: "Qualitas",
    name: "Flex",
    tagline: "Buen precio con red enorme",
    pros: ["Red muy amplia", "Precio competitivo"],
    cons: ["NPS medio"],
    condicionesURL: "https://example.com/qualitas/condiciones.pdf",
    features: {
      priceMonthly: 799,
      liability: 3500,
      collision: 280,
      theft: 260,
      roadside: 1,
      glass: 0,
      legalAid: 1,
      deductible: 7,
      claimDays: 5,
      nps: 58,
      workshopNetwork: 1200,
      telematicsDiscount: 0,
    },
  },
];

const CRITERIA_AUTO: Record<string, CriteriaMeta> = {
  priceMonthly: { label: "Precio mensual", help: "Prima estimada por mes (MXN).", type: "money" },
  liability: { label: "RC (terceros)", help: "Limite de responsabilidad civil en miles de MXN.", type: "number" },
  collision: { label: "Danos materiales", help: "Suma asegurada para colision en miles de MXN.", type: "number" },
  theft: { label: "Robo total", help: "Suma asegurada para robo total en miles de MXN.", type: "number" },
  roadside: { label: "Asistencia vial", help: "Grua, paso de corriente, cambio de llanta.", type: "binary" },
  glass: { label: "Cristales", help: "Cobertura de rotura de cristales.", type: "binary" },
  legalAid: { label: "Asistencia legal", help: "Apoyo legal en siniestros.", type: "binary" },
  deductible: { label: "Deducible", help: "Porcentaje a cargo del asegurado.", type: "pct" },
  claimDays: { label: "Tiempo de pago", help: "Dias promedio para liquidacion.", type: "days" },
  nps: { label: "Satisfaccion (NPS)", help: "Indice (0 a 100).", type: "number" },
  workshopNetwork: { label: "Red de talleres", help: "Cantidad de talleres.", type: "number" },
  telematicsDiscount: { label: "Descuento telematico", help: "% de ahorro por conduccion segura.", type: "pct" },
};

const POLICIES_GMM: Policy[] = [
  {
    id: "axa-salud-total",
    brand: "AXA",
    name: "Salud Total",
    tagline: "Red amplia y telemedicina",
    features: {
      priceMonthly: 1450,
      deductibleMx: 20000,
      copay: 10,
      hospitalNetwork: 180,
      maternityWait: 10,
      preexistences: 0,
      telemedicine: 1,
      claimDays: 7,
    },
  },
  {
    id: "gnp-medica-elite",
    brand: "GNP",
    name: "Medica Elite",
    tagline: "Coberturas altas y rapida autorizacion",
    features: {
      priceMonthly: 1890,
      deductibleMx: 15000,
      copay: 10,
      hospitalNetwork: 150,
      maternityWait: 12,
      preexistences: 0,
      telemedicine: 1,
      claimDays: 6,
    },
  },
  {
    id: "sura-cuidado-plus",
    brand: "SURA",
    name: "Cuidado Plus",
    tagline: "Precio competitivo y red solida",
    features: {
      priceMonthly: 1190,
      deductibleMx: 25000,
      copay: 15,
      hospitalNetwork: 120,
      maternityWait: 12,
      preexistences: 0,
      telemedicine: 1,
      claimDays: 9,
    },
  },
];

const CRITERIA_GMM: Record<string, CriteriaMeta> = {
  priceMonthly: { label: "Precio mensual", help: "Prima estimada por mes (MXN).", type: "money" },
  deductibleMx: { label: "Deducible", help: "Deducible en MXN.", type: "money" },
  copay: { label: "Coaseguro", help: "% del gasto cubierto por el asegurado.", type: "pct" },
  hospitalNetwork: { label: "Red hospitalaria", help: "Numero de hospitales en la red.", type: "number" },
  maternityWait: { label: "Carencia maternidad", help: "Meses de espera para maternidad.", type: "days" },
  preexistences: { label: "Cubre preexistencias", help: "Cobertura para preexistencias.", type: "binary" },
  telemedicine: { label: "Telemedicina", help: "Consultas por videollamada incluidas.", type: "binary" },
  claimDays: { label: "Tiempo de reembolso", help: "Dias promedio para reembolso.", type: "days" },
};

const POLICIES_VIDA: Policy[] = [
  {
    id: "axa-vida-flex",
    brand: "AXA",
    name: "Vida Flex",
    tagline: "Term life con riders",
    features: {
      priceMonthly: 520,
      sumAssuredM: 1.5,
      termYears: 20,
      accidentalDeath: 1,
      criticalIllness: 1,
      cashValue: 0,
      issueAgeMax: 65,
      claimDays: 8,
    },
  },
  {
    id: "gnp-vida-tranquila",
    brand: "GNP",
    name: "Vida Tranquila",
    tagline: "Proteccion y ahorro",
    features: {
      priceMonthly: 780,
      sumAssuredM: 2.0,
      termYears: 25,
      accidentalDeath: 1,
      criticalIllness: 0,
      cashValue: 1,
      issueAgeMax: 65,
      claimDays: 7,
    },
  },
  {
    id: "sura-vida-simple",
    brand: "SURA",
    name: "Vida Simple",
    tagline: "Termino puro, precio accesible",
    features: {
      priceMonthly: 430,
      sumAssuredM: 1.0,
      termYears: 15,
      accidentalDeath: 0,
      criticalIllness: 0,
      cashValue: 0,
      issueAgeMax: 60,
      claimDays: 10,
    },
  },
];

const CRITERIA_VIDA: Record<string, CriteriaMeta> = {
  priceMonthly: { label: "Precio mensual", help: "Prima estimada por mes (MXN).", type: "money" },
  sumAssuredM: { label: "Suma asegurada", help: "Millones de MXN a indemnizar.", type: "number" },
  termYears: { label: "Plazo", help: "Duracion de la poliza en anos.", type: "number" },
  accidentalDeath: { label: "Muerte accidental (rider)", help: "Cobertura adicional por muerte accidental.", type: "binary" },
  criticalIllness: { label: "Enfermedades graves", help: "Rider de enfermedades graves.", type: "binary" },
  cashValue: { label: "Valor en efectivo", help: "Genera valor en efectivo.", type: "binary" },
  issueAgeMax: { label: "Edad max. contratacion", help: "Edad maxima para contratar.", type: "number" },
  claimDays: { label: "Tiempo de pago", help: "Dias promedio para liquidacion.", type: "days" },
};

const policiesByType: Record<ProductType, Policy[]> = {
  auto: POLICIES_AUTO,
  gmm: POLICIES_GMM,
  vida: POLICIES_VIDA,
};

const criteriaByType: Record<ProductType, Record<string, CriteriaMeta>> = {
  auto: CRITERIA_AUTO,
  gmm: CRITERIA_GMM,
  vida: CRITERIA_VIDA,
};

// Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function formatMoney(mx: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(mx);
}

function formatValue(criteria: Record<string, CriteriaMeta>, key: string, value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "-";
  const meta = criteria[key];
  switch (meta?.type) {
    case "money":
      return formatMoney(value);
    case "pct":
      return `${value}%`;
    case "days":
      return `${value} dias`;
    case "binary":
      return value ? "Si" : "No";
    default:
      return new Intl.NumberFormat("es-MX").format(value);
  }
}

function extraSuffix(productType: ProductType, key: string) {
  if (productType === "auto" && ["liability", "collision", "theft"].includes(key)) return " (mil MXN)";
  if (productType === "vida" && key === "sumAssuredM") return " M";
  return "";
}

type FlowProps = {
  startStep?: number;
  initialAdvisorName?: string;
  initialEmail?: string;
};

export default function InsuranceFlowDemo({
  startStep = 0,
  initialAdvisorName = "Luis Valencia",
  initialEmail = "asesor@demo.mx",
}: FlowProps) {
  // Paso actual
  const [step, setStep] = useState<number>(Math.max(0, Math.min(5, startStep)));
  // Default product
  const [productType, setProductType] = useState<ProductType>("vida");

  // Checklist por producto (editable)
  const [productDocs, setProductDocs] = useState<{ vida: string[]; gmm: string[]; auto: string[] }>({
    vida: [],
    gmm: [],
    auto: [],
  });
  const [newDoc, setNewDoc] = useState<{ vida: string; gmm: string; auto: string }>({
    vida: "",
    gmm: "",
    auto: "",
  });

  // Estado para los archivos subidos por documento
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});

  const [advisorName] = useState(initialAdvisorName);
  const [email] = useState(initialEmail);

  const [client, setClient] = useState({
    nombre: "Maria Lopez",
    curp: "LOPM850101HDFRRS08",
    rfc: "LOPM850101ABC",
    email: "maria@example.com",
    telefono: "+52 55 1234 5678",
    domicilio: "Av. Siempre Viva 123, CDMX",
    prioridades: ["Buen precio", "Bajo deducible", "Asistencia vial"],
  });

  const [vehicle, setVehicle] = useState({
    marca: "Nissan",
    modelo: "Versa",
    anio: 2022,
    version: "Sense MT",
    vin: "3N1CN7AD2JK123456",
    placas: "ABC-123-CDMX",
    uso: "Particular",
    valorFactura: 265000,
  });

  const [health, setHealth] = useState({
    edad: 34,
    sexo: "F",
    fuma: "No",
    hospitalPreferido: "ABC Observatorio",
  });

  const [life, setLife] = useState({
    edad: 35,
    sexo: "F",
    fuma: "No",
    beneficiarios: "Juan (50%), Ana (50%)",
    sumaDeseada: 1000000,
  });

  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [chosenPolicyId, setChosenPolicyId] = useState<string | null>(null);

  const [billing, setBilling] = useState({
    metodoPago: "Tarjeta de credito",
    frecuencia: "Mensual",
    titular: "Maria Lopez",
    direccionFiscal: "Av. Siempre Viva 123, CDMX",
  });

  const [generatedPDFUrl, setGeneratedPDFUrl] = useState<string | null>(null);
  const [dispatchFolio, setDispatchFolio] = useState<string | null>(null);

  const activePolicies = useMemo(() => policiesByType[productType], [productType]);
  const currentCriteria = useMemo(() => criteriaByType[productType], [productType]);

  useEffect(() => {
    const defaults = activePolicies.slice(0, 2).map((policy) => policy.id);
    setSelectedIds(defaults);
    setChosenPolicyId(activePolicies[0]?.id ?? null);
  }, [activePolicies]);

  useEffect(() => {
    return () => {
      if (generatedPDFUrl) URL.revokeObjectURL(generatedPDFUrl);
    };
  }, [generatedPDFUrl]);

  const filteredPolicies = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return activePolicies;
    return activePolicies.filter((policy) => `${policy.brand} ${policy.name}`.toLowerCase().includes(term));
  }, [activePolicies, query]);

  const selected = useMemo(
    () => activePolicies.filter((policy) => selectedIds.includes(policy.id)),
    [activePolicies, selectedIds]
  );

  const chosenPolicy = useMemo(
    () => activePolicies.find((policy) => policy.id === chosenPolicyId) ?? activePolicies[0] ?? null,
    [activePolicies, chosenPolicyId]
  );

  function annualCost(policy: Policy) {
    return (policy.features.priceMonthly ?? 0) * 12;
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  function next() {
    setStep((prev) => Math.min(prev + 1, 5));
  }
  function prev() {
    setStep((prev) => Math.max(prev - 1, 0));
  }

  function generatePDF() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 56;
    const marginY = 56;
    const line = 18;
    let y = marginY;

    const ramo = productType === "auto" ? "Auto" : productType === "gmm" ? "GMM" : "Vida";

    doc.setFont("helvetica", "bold").setFontSize(16);
    doc.text(`Propuesta de Seguro - ${ramo}`, marginX, y);
    y += line;

    doc.setFont("helvetica", "normal").setFontSize(10);
    doc.text(`Asesor: ${advisorName}  -  Email: ${email}`, marginX, y);
    y += line;
    doc.text(`Cliente: ${client.nombre}  -  Tel: ${client.telefono}  -  Email: ${client.email}`, marginX, y);
    y += line;
    doc.text(`Prioridades: ${client.prioridades.join(", ") || "N/D"}`, marginX, y);
    y += line;

    if (productType === "auto") {
      doc.text(`Vehiculo: ${vehicle.marca} ${vehicle.modelo} ${vehicle.anio} - VIN ${vehicle.vin}`, marginX, y);
      y += line;
      doc.text(`Placas: ${vehicle.placas} - Uso: ${vehicle.uso} - Valor factura: ${formatMoney(vehicle.valorFactura)}`, marginX, y);
      y += line;
    } else if (productType === "gmm") {
      doc.text(`Edad: ${health.edad} - Sexo: ${health.sexo} - Fuma: ${health.fuma} - Hospital: ${health.hospitalPreferido}`, marginX, y);
      y += line;
    } else {
      doc.text(`Edad: ${life.edad} - Sexo: ${life.sexo} - Fuma: ${life.fuma} - Beneficiarios: ${life.beneficiarios}`, marginX, y);
      y += line;
      doc.text(`Suma deseada: ${formatMoney(life.sumaDeseada)}`, marginX, y);
      y += line;
    }

    y += line;
    doc.setFont("helvetica", "bold").setFontSize(12);
    doc.text("Comparativa (resumen)", marginX, y);
    y += line;

    doc.setFont("helvetica", "normal").setFontSize(10);
    const criteriaEntries = Object.entries(currentCriteria);
    const items = selected.length > 0 ? selected : activePolicies.slice(0, 3);

    items.forEach((policy, index) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${policy.brand} - ${policy.name}`, marginX, y);
      y += line;
      doc.setFont("helvetica", "normal");

      criteriaEntries.forEach(([key, meta]) => {
        const value = formatValue(currentCriteria, key, policy.features[key]);
        const suffix = extraSuffix(productType, key);
        doc.text(`- ${meta.label}: ${value}${suffix}`, marginX + 14, y);
        y += line;
        if (y > 760) {
          doc.addPage();
          y = marginY;
        }
      });

      y += 6;
      if (y > 760) {
        doc.addPage();
        y = marginY;
      }
    });

    if (chosenPolicy) {
      y += line;
      doc.setFont("helvetica", "bold");
      doc.text("Plan seleccionado", marginX, y);
      y += line;
      doc.setFont("helvetica", "normal");

      const anual = formatMoney(annualCost(chosenPolicy));
      const deducible =
        chosenPolicy.features.deductible !== undefined ? `${chosenPolicy.features.deductible}%` : "N/D";
      doc.text(`${chosenPolicy.brand} - ${chosenPolicy.name}  |  Costo anual: ${anual}  |  Deducible: ${deducible}`, marginX, y);
      y += line;
    }

    y += line;
    doc.setFont("helvetica", "bold");
    doc.text("Consentimientos y privacidad (demo)", marginX, y);
    y += line;

    doc.setFont("helvetica", "normal");
    doc.text(
      "El cliente ha sido informado de coberturas, exclusiones y deducibles. Autoriza el tratamiento de datos para cotizar y emitir la poliza.",
      marginX,
      y,
      { maxWidth: 482 }
    );
    y += line * 2;

    doc.setFontSize(8).setTextColor(120);
    doc.text("*Documento demostrativo sin validez legal. Condiciones generales disponibles con cada aseguradora.", marginX, y);

    if (generatedPDFUrl) URL.revokeObjectURL(generatedPDFUrl);
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    setGeneratedPDFUrl(url);
    setDispatchFolio(null);
  }

  function sendToInsurer() {
    if (!chosenPolicy) return;
    const suffix = Date.now().toString().slice(-6);
    const folio = `FOLIO-${chosenPolicy.brand}-${suffix}`;
    setDispatchFolio(folio);
  }

  // Cobro simulado con Stripe Checkout (mantiene tu lógica)
  async function handleSimulatedCharge() {
    if (!chosenPolicy) return;

    const amountMx = Number(chosenPolicy.features.priceMonthly ?? 0);
    if (!amountMx || amountMx <= 0) {
      alert("Monto inválido.");
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountMx,
          currency: "mxn",
          policyId: chosenPolicy.id,
          policyName: `${chosenPolicy.brand} - ${chosenPolicy.name}`,
          customerEmail: client.email,
          metadata: {
            ramo: productType,
            cliente: client.nombre,
            telefono: client.telefono,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error(data);
        alert("No se pudo iniciar el cobro (demo). Revisa la consola.");
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) {
        alert("Stripe no se pudo cargar.");
        return;
      }

      const { error } = await stripe.redirectToCheckout({ sessionId: data.id });
      if (error) {
        console.error(error);
        alert("Error al redirigir a Stripe.");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error iniciando el cobro.");
    }
  }

  const prioridadesInput = client.prioridades.join(", ");

  const stepLabels = [
    "Descubrimiento",
    productType === "vida" ? "Comparar Vida" : productType === "gmm" ? "Comparar GMM" : "Comparar Auto",
    "Solicitud",
    "Cotización",
    "Emisión",
  ];

  // Helpers para checklist editable
  const currentDocs = productDocs[productType];
  const currentNewDoc = newDoc[productType];
  const addDoc = () => {
    const text = currentNewDoc.trim();
    if (!text) return;
    setProductDocs((prev) => ({ ...prev, [productType]: [...prev[productType], text] }));
    setNewDoc((prev) => ({ ...prev, [productType]: "" }));
  };
  const removeDoc = (idx: number) => {
    setProductDocs((prev) => ({
      ...prev,
      [productType]: prev[productType].filter((_, i) => i !== idx),
    }));
  };

  // Helpers para manejo de archivos
  const handleFileUpload = (documentName: string, file: File) => {
    setUploadedFiles(prev => ({
      ...prev,
      [documentName]: file
    }));
  };

  const removeFile = (documentName: string) => {
    setUploadedFiles(prev => ({
      ...prev,
      [documentName]: null
    }));
  };

  // Checklist base por producto (items por defecto)
  const defaultChecklist: Record<ProductType, string[]> = {
    auto: [
      "Identificación oficial (INE/Pasaporte)",
      "Licencia de conducir vigente",
      "Comprobante de domicilio (< 3 meses)",
      "Factura o tenencia (si aplica)",
      "Fotos del vehículo (frente, laterales, VIN)",
    ],
    gmm: [
      "Identificacion oficial",
      "Cuestionario medico",
      "Comprobante de domicilio",
      "Estado de cuenta para Domiciliación",
    ],
    vida: [
      "Identificacion oficial",
      "Cuestionario de salud",
      "Comprobante de domicilio",
      "Acta de nacimiento (si aplica)",
    ],
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center gap-3">
          <div className="font-black text-base sm:text-lg md:text-xl tracking-tight">
            Seguros Demo <span className="text-[#7494ec]">| Flujo Completo</span>
          </div>
          <div className="ml-auto text-xs sm:text-sm text-neutral-600">
            Asesor: <b>{advisorName}</b>
          </div>
        </div>
      </header>

      {/* Barra de progreso clickeable */}
      <nav aria-label="Progreso" className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4">
        <ol className="flex flex-wrap gap-2 text-[11px] sm:text-xs md:text-sm">
          {stepLabels.map((label, idx) => {
            const state =
              step === idx
                ? "bg-[#7494ec] text-white border-[#7494ec]"
                : step > idx
                ? "bg-[#e3edff] text-[#7494ec] border-[#b3cdfa]"
                : "bg-white text-neutral-600 border-neutral-200";
            return (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => setStep(idx)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-full border transition ${state}`}
                >
                  {idx + 1}. {label}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* PASO 0: Producto arriba, Cliente abajo */}
        {step === 0 && (
          <section className="grid gap-4 lg:grid-cols-[1.35fr,1fr]">
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Producto a cotizar (ARRIBA) */}
              <div>
                <h2 className="font-bold text-base sm:text-lg mb-2">Producto a cotizar</h2>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { type: "vida", label: "Vida" },
                      { type: "gmm", label: "GMM" },
                      { type: "auto", label: "Auto" },
                    ] as { type: ProductType; label: string }[]
                  ).map((option) => (
                    <button
                      key={option.type}
                      className={`rounded-xl px-3 sm:px-4 py-2 border text-sm font-semibold ${
                        productType === option.type
                          ? "bg-[#7494ec] text-white border-[#7494ec]"
                          : "bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50"
                      }`}
                      onClick={() => setProductType(option.type)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Datos del cliente (ABAJO) */}
              <div>
                <h2 className="font-bold text-base sm:text-lg mb-2">Informacion del cliente</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  <label className="text-sm font-medium">
                    Nombre completo
                    <input
                      className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-3 sm:py-2"
                      value={client.nombre}
                      onChange={(e) => setClient({ ...client, nombre: e.target.value })}
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Email
                    <input
                      className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-3 sm:py-2"
                      value={client.email}
                      onChange={(e) => setClient({ ...client, email: e.target.value })}
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Telefono
                    <input
                      className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-3 sm:py-2"
                      value={client.telefono}
                      onChange={(e) => setClient({ ...client, telefono: e.target.value })}
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Domicilio
                    <input
                      className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-3 sm:py-2"
                      value={client.domicilio}
                      onChange={(e) => setClient({ ...client, domicilio: e.target.value })}
                    />
                  </label>
                  <label className="text-sm font-medium">
                    CURP
                    <input
                      className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-3 sm:py-2"
                      value={client.curp}
                      onChange={(e) => setClient({ ...client, curp: e.target.value })}
                    />
                  </label>
                  <label className="text-sm font-medium">
                    RFC
                    <input
                      className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-3 sm:py-2"
                      value={client.rfc}
                      onChange={(e) => setClient({ ...client, rfc: e.target.value })}
                    />
                  </label>
                </div>
                <label className="text-sm font-medium block mt-4">
                  Prioridades (separadas por coma)
                  <input
                    className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-3 sm:py-2"
                    value={prioridadesInput}
                    onChange={(event) =>
                      setClient({
                        ...client,
                        prioridades: event.target.value
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3 justify-end">
                <button
                  className="rounded-xl px-4 py-2 bg-[#7494ec] text-white font-semibold hover:bg-[#5a7be0]"
                  onClick={next}
                >
                  Continuar a comparacion
                </button>
              </div>
            </div>

            {/* Panel derecho (datos del riesgo) */}
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-4 sm:p-6">
              {productType === "auto" && (
                <>
                  <h2 className="font-bold text-base sm:text-lg mb-2">Datos del vehiculo</h2>
                  {(
                    [
                      ["Marca", "marca"],
                      ["Modelo", "modelo"],
                      ["Ano", "anio"],
                      ["Version", "version"],
                      ["VIN", "vin"],
                      ["Placas", "placas"],
                      ["Uso", "uso"],
                      ["Valor factura (MXN)", "valorFactura"],
                    ] as const
                  ).map(([label, key]) => (
                    <div key={key} className="mt-2">
                      <label className="text-sm font-medium">{label}</label>
                      <input
                        className="mt-1 w-full rounded-xl border border-transparent bg-[#f1f3f8] px-4 py-3 text-base sm:text-lg font-semibold text-neutral-800 placeholder:text-neutral-500 tracking-wide outline-none focus:ring-4 transition box-shadow"
                        style={{ boxShadow: "none" }}
                        value={(vehicle as Record<string, string | number>)[key]}
                        onChange={(event) =>
                          setVehicle({
                            ...vehicle,
                            [key]:
                              key === "anio" || key === "valorFactura"
                                ? Number(event.target.value)
                                : (event.target.value as any),
                          })
                        }
                        onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "#1a237e")}
                        onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "transparent")}
                      />
                    </div>
                  ))}
                </>
              )}

              {productType === "gmm" && (
                <>
                  <h2 className="font-bold text-base sm:text-lg mb-2">Datos de salud</h2>
                  {(
                    [
                      ["Edad", "edad"],
                      ["Sexo (M/F)", "sexo"],
                      ["Fuma (Si/No)", "fuma"],
                      ["Hospital preferido", "hospitalPreferido"],
                    ] as const
                  ).map(([label, key]) => (
                    <div key={key} className="mt-2">
                      <label className="text-sm font-medium">{label}</label>
                      <input
                        className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-[#7494ec]"
                        value={(health as Record<string, string | number>)[key]}
                        onChange={(event) =>
                          setHealth({
                            ...health,
                            [key]: key === "edad" ? Number(event.target.value) : (event.target.value as any),
                          })
                        }
                      />
                    </div>
                  ))}
                </>
              )}

              {productType === "vida" && (
                <>
                  <h2 className="font-bold text-base sm:text-lg mb-2">Datos de vida</h2>
                  {(
                    [
                      ["Edad", "edad"],
                      ["Sexo (M/F)", "sexo"],
                      ["Fuma (Si/No)", "fuma"],
                      ["Beneficiarios", "beneficiarios"],
                      ["Suma deseada (MXN)", "sumaDeseada"],
                    ] as const
                  ).map(([label, key]) => (
                    <div key={key} className="mt-2">
                      <label className="text-sm font-medium">{label}</label>
                      <input
                        className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-[#7494ec]"
                        value={(life as Record<string, string | number>)[key]}
                        onChange={(event) =>
                          setLife({
                            ...life,
                            [key]: key === "edad" || key === "sumaDeseada" ? Number(event.target.value) : (event.target.value as any),
                          })
                        }
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          </section>
        )}

        {/* PASO 1: Comparación */}
        {step === 1 && (
          <section>
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-3 sm:p-4 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <label className="sr-only" htmlFor="buscar">
                Buscar plan
              </label>
              <input
                id="buscar"
                className="w-full sm:w-80 rounded-xl border border-transparent bg-[#f1f3f8] px-4 py-3 text-[16px] text-neutral-800 font-medium outline-none focus:ring-4 transition box-shadow"
                style={{ boxShadow: "none" }}
                placeholder="Buscar aseguradora o plan"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <span className="text-xs sm:text-sm text-neutral-600">Selecciona 2 o 3 para comparar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {filteredPolicies.map((policy) => (
                <article
                  key={policy.id}
                  className={`rounded-2xl border ${
                    selectedIds.includes(policy.id)
                      ? "border-[#7494ec] ring-2 ring-[#e3edff]"
                      : "border-neutral-200"
                  } bg-white shadow-sm p-4`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center text-sm font-bold">
                      {policy.brand[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">
                        {policy.brand} - {policy.name}
                      </h3>
                      <p className="text-sm text-neutral-600 truncate">{policy.tagline}</p>
                    </div>
                    <button
                      className={`shrink-0 rounded-xl px-3 py-2 text-sm font-semibold border focus:outline-none focus:ring-2 ${
                        selectedIds.includes(policy.id)
                          ? "bg-[#7494ec] text-white border-[#7494ec] hover:bg-[#5a7be0]"
                          : "bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50"
                      }`}
                      onClick={() => toggleSelect(policy.id)}
                      aria-pressed={selectedIds.includes(policy.id)}
                    >
                      {selectedIds.includes(policy.id) ? "Quitar" : "Seleccionar"}
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-2xl font-extrabold">{formatMoney(policy.features.priceMonthly)}</span>
                    <span className="text-sm text-neutral-500">/ mes</span>
                  </div>
                  <div className="text-sm text-neutral-600">
                    {productType === "auto" && (
                      <span>
                        Anual: <b>{formatMoney(annualCost(policy))}</b> - Deducible: <b>{policy.features.deductible}%</b>
                      </span>
                    )}
                    {productType === "gmm" && (
                      <span>
                        Deducible: <b>{formatMoney((policy.features as any).deductibleMx)}</b> - Coaseguro:{" "}
                        <b>{(policy.features as any).copay}%</b>
                      </span>
                    )}
                    {productType === "vida" && (
                      <span>
                        Suma asegurada:{" "}
                        <b>{new Intl.NumberFormat("es-MX").format((policy.features as any).sumAssuredM)} M</b> - Plazo:{" "}
                        <b>{(policy.features as any).termYears} anos</b>
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
              <header className="px-4 py-3 border-b bg-neutral-50 flex items-center gap-3">
                <h2 className="font-bold text-sm sm:text-base">Comparativa (unidades reales)</h2>
                <span className="text-xs text-neutral-500">Valores como los reporta cada poliza</span>
              </header>

              {/* contenedor con scroll y pista de deslizamiento */}
              <div className="relative">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-600">
                        <th className="text-left px-4 py-3 w-64 sm:w-72">Criterio</th>
                        {selected.map((policy) => (
                          <th key={policy.id} className="text-left px-4 py-3 w-56 sm:w-64">
                            {policy.brand} - {policy.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(currentCriteria).map((key) => (
                        <tr key={key} className="border-t">
                          <td className="align-top px-4 py-3">
                            <div className="font-semibold">{currentCriteria[key].label}</div>
                            <div className="text-neutral-500 text-[11px] sm:text-xs">{currentCriteria[key].help}</div>
                          </td>
                          {selected.map((policy) => (
                            <td key={policy.id} className="align-top px-4 py-3">
                              <span className="font-medium">
                                {formatValue(currentCriteria, key, policy.features[key])}
                                {extraSuffix(productType, key)}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Fade lateral para hint de scroll */}
                <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent hidden sm:block" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button onClick={prev} className="rounded-xl px-4 py-2 border border-neutral-300 hover:bg-neutral-50">
                Atras
              </button>
              <button
                disabled={!selected.length}
                onClick={next}
                className="rounded-xl px-4 py-2 bg-[#7494ec] text-white font-semibold hover:bg-[#5a7be0] disabled:opacity-50"
              >
                Continuar a solicitud
              </button>
            </div>
          </section>
        )}

        {/* PASO 2: Solicitud */}
        {step === 2 && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-4 sm:p-6">
              <h2 className="font-bold text-base sm:text-lg mb-2">Plan elegido</h2>
              <select
                className="w-full rounded-xl border border-neutral-300 px-3 py-3 sm:py-2"
                value={chosenPolicyId ?? ""}
                onChange={(event) => setChosenPolicyId(event.target.value)}
              >
                {activePolicies.map((policy) => (
                  <option key={policy.id} value={policy.id}>
                    {policy.brand} - {policy.name} (Anual {formatMoney(annualCost(policy))})
                  </option>
                ))}
              </select>

              <h3 className="font-semibold mt-4">Datos de facturacion / pago</h3>
              {(
                [
                  ["Metodo de pago", "metodoPago"],
                  ["Frecuencia", "frecuencia"],
                  ["Titular del pago", "titular"],
                  ["Direccion fiscal", "direccionFiscal"],
                ] as const
              ).map(([label, key]) => (
                <div key={key} className="mt-2">
                  <label className="text-sm font-medium">{label}</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-3 sm:py-2"
                    value={(billing as Record<string, string>)[key]}
                    onChange={(event) => setBilling({ ...billing, [key]: event.target.value })}
                  />
                </div>
              ))}
            </div>

            {/* Checklist editable */}
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-4 sm:p-6">
              <h2 className="font-bold text-base sm:text-lg mb-2">Checklist de documentos ({productType.toUpperCase()})</h2>

              <div className="space-y-3 sm:space-y-4">
                {defaultChecklist[productType].map((item, i) => (
                  <div key={`def-${i}`} className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center justify-between p-3 border border-neutral-200 rounded-lg">
                    <span className="text-sm text-neutral-700">{item}</span>
                    <div className="flex items-center gap-2">
                      {uploadedFiles[item] ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            {uploadedFiles[item]?.name}
                          </span>
                          <button
                            onClick={() => removeFile(item)}
                            className="text-xs text-red-600 hover:text-red-800"
                            type="button"
                            aria-label="Eliminar archivo"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(item, file);
                              }
                            }}
                          />
                          <span className="text-xs rounded-lg px-3 py-2 bg-[#7494ec] text-white hover:bg-[#5a7be0] font-semibold">
                            Subir documento
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                ))}
                {currentDocs.map((doc, i) => (
                  <div key={`extra-${i}`} className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center justify-between p-3 border border-neutral-200 rounded-lg">
                    <span className="text-sm text-neutral-700">{doc}</span>
                    <div className="flex items-center gap-2">
                      {uploadedFiles[doc] ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            {uploadedFiles[doc]?.name}
                          </span>
                          <button
                            onClick={() => removeFile(doc)}
                            className="text-xs text-red-600 hover:text-red-800"
                            type="button"
                            aria-label="Eliminar"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(doc, file);
                              }
                            }}
                          />
                          <span className="text-xs rounded-lg px-3 py-2 bg-[#7494ec] text-white hover:bg-[#5a7be0] font-semibold">
                            Subir documento
                          </span>
                        </label>
                      )}
                      <button
                        onClick={() => removeDoc(i)}
                        className="text-xs rounded-lg px-2 py-1 border border-neutral-300 hover:bg-neutral-50"
                        type="button"
                        aria-label="Eliminar"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>



              <p className="text-xs text-neutral-500 mt-2">*Lista demostrativa; añade o quita documentos según la aseguradora.</p>

              <div className="mt-4 flex gap-3">
                <button onClick={prev} className="rounded-xl px-4 py-2 border border-neutral-300 hover:bg-neutral-50">
                  Atras
                </button>
                <button
                  onClick={next}
                  className="rounded-xl px-4 py-2 bg-[#7494ec] text-white font-semibold hover:bg-blue-600"
                >
                  Ir a cotización
                </button>
              </div>
            </div>
          </section>
        )}

        {/* PASO 3: Cotización (RESPONSIVO) */}
        {step === 3 && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Resumen (1ro en mobile, 2do en desktop) */}
            <div className="order-1 lg:order-2 rounded-2xl border border-neutral-200 bg-white shadow-sm p-4 sm:p-6 overflow-hidden">
              <h2 className="font-bold text-base sm:text-lg mb-2">Resumen del plan elegido</h2>
              {chosenPolicy ? (
                <div className="break-words">
                  <div className="font-semibold truncate">
                    {chosenPolicy.brand} - {chosenPolicy.name}
                  </div>
                  <div className="text-sm text-neutral-600">
                    Anual: <b>{formatMoney(annualCost(chosenPolicy))}</b> - Deducible:{" "}
                    <b>{chosenPolicy.features.deductible ?? "N/D"}%</b>
                  </div>
                  <ul className="mt-3 text-sm text-neutral-700 space-y-1">
                    {Object.keys(currentCriteria).map((key) => (
                      <li key={key} className="flex gap-2">
                        <span className="shrink-0 text-neutral-600">{currentCriteria[key].label}:</span>
                        <span className="font-medium break-words">
                          {formatValue(currentCriteria, key, chosenPolicy.features[key])}
                          {extraSuffix(productType, key)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-neutral-600">Selecciona una poliza para ver el resumen.</p>
              )}
            </div>

            {/* Previsualización (2do en mobile, 1ro en desktop) */}
            <div className="order-2 lg:order-1 rounded-2xl border border-neutral-200 bg-white shadow-sm p-4 sm:p-6">
              <h2 className="font-bold text-base sm:text-lg mb-2">Previsualizacion rapida</h2>
              <p className="text-sm text-neutral-700">
                El PDF incluira datos del cliente, producto seleccionado, comparativa, plan elegido y consentimientos.
              </p>

              <div className="mt-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                <button
                  onClick={generatePDF}
                  className="w-full sm:w-auto rounded-xl px-4 py-2 bg-[#7494ec] text-white font-semibold hover:bg-[#5a7be0]"
                >
                  Generar PDF
                </button>
                {generatedPDFUrl && (
                  <a
                    href={generatedPDFUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto text-center rounded-xl px-4 py-2 border border-neutral-300 hover:bg-neutral-50"
                  >
                    Abrir o descargar PDF
                  </a>
                )}
              </div>

              <p className="text-xs text-neutral-500 mt-2">*Generado con jsPDF en el navegador.</p>

              {/* Acciones en desktop/tablet */}
              <div className="mt-4 hidden sm:flex gap-3">
                <button onClick={prev} className="rounded-xl px-4 py-2 border border-neutral-300 hover:bg-neutral-50">
                  Atras
                </button>
                <button
                  onClick={next}
                  disabled={!generatedPDFUrl}
                  className="rounded-2xl px-4 py-2 bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  Ir a envio
                </button>
              </div>
            </div>

            {/* Barra inferior sticky solo en móvil */}
            <div className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-t border-neutral-200 px-3 py-3">
              <div className="max-w-7xl mx-auto flex gap-3">
                <button
                  onClick={prev}
                  className="w-1/2 rounded-xl px-4 py-3 border border-neutral-300 text-neutral-800"
                >
                  Atras
                </button>
                <button
                  onClick={next}
                  disabled={!generatedPDFUrl}
                  className="w-1/2 rounded-xl px-4 py-3 bg-indigo-600 text-white font-semibold disabled:opacity-50"
                >
                  Ir a envio
                </button>
              </div>
            </div>
            {/* ——— Fin barra sticky ——— */}
          </section>
        )}

        {/* PASO 4: Emisión */}
        {step === 4 && (
          <section className="max-w-3xl mx-auto rounded-2xl border border-neutral-200 bg-white shadow-sm p-4 sm:p-6">
            <h2 className="font-bold text-base sm:text-lg mb-2">Emisión de expediente a aseguradora (simulado)</h2>
            <p className="text-neutral-700 text-sm">
              Se enviará el PDF generado más los metadatos de la solicitud. Revisa el desglose antes de enviar:
            </p>

            {/* Desglose de la información generada en el PDF */}
            <div className="mb-6 p-4 rounded-xl border border-neutral-300 bg-neutral-50">
              <h3 className="font-semibold mb-2">Preeliminar de cotización</h3>
              <div className="mb-2">
                <b>Cliente:</b> {client.nombre} - <b>Tel:</b> {client.telefono} - <b>Email:</b> {client.email}
              </div>
              <div className="mb-2">
                <b>Prioridades:</b> {client.prioridades.join(", ") || "N/D"}
              </div>
              {productType === "auto" && (
                <div className="mb-2">
                  <b>Vehículo:</b> {vehicle.marca} {vehicle.modelo} {vehicle.anio} - VIN {vehicle.vin}
                  <br />
                  <b>Placas:</b> {vehicle.placas} - <b>Uso:</b> {vehicle.uso} - <b>Valor factura:</b>{" "}
                  {formatMoney(vehicle.valorFactura)}
                </div>
              )}
              {productType === "gmm" && (
                <div className="mb-2">
                  <b>Edad:</b> {health.edad} - <b>Sexo:</b> {health.sexo} - <b>Fuma:</b> {health.fuma} -{" "}
                  <b>Hospital:</b> {health.hospitalPreferido}
                </div>
              )}
              {productType === "vida" && (
                <div className="mb-2">
                  <b>Edad:</b> {life.edad} - <b>Sexo:</b> {life.sexo} - <b>Fuma:</b> {life.fuma} -{" "}
                  <b>Beneficiarios:</b> {life.beneficiarios}
                  <br />
                  <b>Suma deseada:</b> {formatMoney(life.sumaDeseada)}
                </div>
              )}
              <div className="mb-2">
                <b>Plan seleccionado:</b> {chosenPolicy ? `${chosenPolicy.brand} - ${chosenPolicy.name}` : "N/D"}
              </div>
              {chosenPolicy && (
                <ul className="mb-2 text-sm text-neutral-700 space-y-1">
                  {Object.keys(currentCriteria).map((key) => (
                    <li key={key}>
                      {currentCriteria[key].label}: {formatValue(currentCriteria, key, chosenPolicy.features[key])}
                      {extraSuffix(productType, key)}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mb-2">
                <b>Datos de facturación/pago:</b>
              </div>
              <ul className="mb-2 text-sm text-neutral-700 space-y-1">
                <li>Método de pago: {billing.metodoPago}</li>
                <li>Frecuencia: {billing.frecuencia}</li>
                <li>Titular: {billing.titular}</li>
                <li>Dirección fiscal: {billing.direccionFiscal}</li>
              </ul>
              {!!currentDocs.length && (
                <>
                  <div className="mb-1">
                    <b>Documentos extra anexados:</b>
                  </div>
                  <ul className="list-disc list-inside text-sm text-neutral-700">
                    {currentDocs.map((d, i) => (
                      <li key={`emit-${i}`}>{d}</li>
                    ))}
                  </ul>
                </>
              )}
              <div className="mb-2 text-xs text-neutral-500">*Consentimientos y privacidad incluidos en el PDF.</div>
            </div>

            <div className="mt-3">
              <label className="text-sm font-medium">Aseguradora destino</label>
              <select
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-3 sm:py-2"
                value={chosenPolicyId ?? ""}
                onChange={(event) => setChosenPolicyId(event.target.value)}
              >
                {activePolicies.map((policy) => (
                  <option key={policy.id} value={policy.id}>
                    {policy.brand} - {policy.name}
                  </option>
                ))}
              </select>
              <div className="mt-4 flex items-center gap-3">
                <button onClick={prev} className="rounded-xl px-4 py-2 border border-neutral-300 hover:bg-neutral-50">
                  Atras
                </button>
              </div>
            </div>

            {/* Simulación de cobro con Stripe */}
            {chosenPolicy && (
              <div className="mt-6 p-4 rounded-xl border border-blue-300 bg-blue-50">
                <h3 className="font-semibold mb-2 text-blue-800">Simulación de cobro</h3>
                <div className="mb-2 text-lg">
                  <b>Monto a cobrar:</b> {formatMoney(chosenPolicy.features.priceMonthly ?? 0)}{" "}
                  <span className="text-sm text-neutral-600">(mensual)</span>
                </div>
                <button
                  type="button"
                  className="rounded-xl px-4 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-700"
                  onClick={handleSimulatedCharge}
                >
                  Realizar cobro simulado
                </button>
              </div>
            )}

            {dispatchFolio && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                <b>Envio exitoso.</b> Folio de referencia: {dispatchFolio}
              </div>
            )}

            {!generatedPDFUrl && <p className="text-xs text-rose-600 mt-2">Primero genera el PDF en el paso anterior.</p>}
          </section>
        )}
      </main>

      <footer className="py-10 px-[env(safe-area-inset-left)] text-center text-sm text-neutral-500">
        <p>* DEMO con datos ficticios. Para produccion, integra APIs y flujos de firma electronica.</p>
      </footer>
    </div>
  );
}
