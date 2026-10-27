"use server";

import { revalidatePath } from "next/cache";
import { todayISO } from "@/lib/dates";
import { getCtx } from "../access";
import { acceptProposed, saveBrief } from "../brief";
import { guard } from "./form";

export async function acceptBriefPriorities() {
  return guard(async () => {
    const ctx = await getCtx();
    await acceptProposed(ctx, todayISO());
    revalidatePath("/brief");
    revalidatePath("/today");
  });
}

export async function regenerateBrief() {
  return guard(async () => {
    const ctx = await getCtx();
    await saveBrief(ctx, todayISO());
    revalidatePath("/brief");
  });
}
