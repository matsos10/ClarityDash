import { NextResponse } from "next/server";
import { getProvidersForCountry } from "@/lib/providers";
import { computeStats } from "@/lib/report";
import type { Listing, ProviderError, SearchReport } from "@/lib/types";
import { validateSpec } from "@/lib/validateSpec";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const validation = validateSpec(body);
  if ("error" in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const { spec } = validation;

  const providers = getProvidersForCountry(spec.country);
  if (providers.length === 0) {
    return NextResponse.json(
      { error: `Aucune source disponible pour le pays ${spec.country}.` },
      { status: 400 }
    );
  }

  const listings: Listing[] = [];
  const errors: ProviderError[] = [];

  const results = await Promise.allSettled(providers.map((p) => p.search(spec)));

  results.forEach((result, i) => {
    const provider = providers[i];
    if (result.status === "fulfilled") {
      listings.push(...result.value);
    } else {
      errors.push({
        source: provider.name,
        message:
          result.reason instanceof Error ? result.reason.message : String(result.reason),
      });
    }
  });

  const report: SearchReport = {
    spec,
    generatedAt: new Date().toISOString(),
    listings,
    stats: computeStats(listings),
    errors,
  };

  return NextResponse.json(report);
}
