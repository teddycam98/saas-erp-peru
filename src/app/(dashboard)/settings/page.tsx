import SettingsClient from "./settings-client";
import { getEmpresa } from "@/actions/empresa";

export default async function SettingsGeneralPage() {
  const empresa = await getEmpresa();
  return <SettingsClient initialData={empresa} />;
}
