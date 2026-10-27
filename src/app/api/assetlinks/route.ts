import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Servi sur /.well-known/assetlinks.json (rewrite) : lie l'APK TWA au domaine.
export function GET() {
  const fingerprints = (process.env.TWA_SHA256_FINGERPRINTS ?? "")
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);
  return NextResponse.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: process.env.TWA_PACKAGE_NAME ?? "pt.circulofacetado.basepalmela",
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ]);
}
