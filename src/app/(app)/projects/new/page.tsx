import { PageHeader, Section } from "@/components/ui";
import { ProjectForm } from "@/components/project-form";
import { quarterOf, todayISO } from "@/lib/dates";
import { getCtx } from "@/server/access";
import { linkOptions, spaceOptions } from "@/server/horizons";

export default async function NewProjectPage() {
  const ctx = await getCtx();
  const links = (await linkOptions(ctx, quarterOf(todayISO()))).filter((l) => !l.value.startsWith("p:"));
  return (
    <>
      <PageHeader title="Nouveau projet" back="/projects" />
      <Section>
        <ProjectForm links={links} spaces={spaceOptions(ctx)} />
      </Section>
    </>
  );
}
