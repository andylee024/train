import { Dashboard } from "@/components/dashboard";
import { loadDashboard } from "@/lib/load";

export const revalidate = 300;

/** Server-rendered Analyst dashboard. Data is fetched again about every five minutes. */
export default async function Page() {
  const data = await loadDashboard();
  return <Dashboard data={data} />;
}
