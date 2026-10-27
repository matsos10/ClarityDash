import { AccountForm } from "@/components/account-form";
import { PageHeader, Section } from "@/components/ui";

export default function NewAccountPage() {
  return (
    <>
      <PageHeader title="Nouveau compte" back="/trading" />
      <Section>
        <AccountForm />
      </Section>
    </>
  );
}
