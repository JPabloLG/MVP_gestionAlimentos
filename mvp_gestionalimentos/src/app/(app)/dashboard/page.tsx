import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { StatsSummary } from "@/components/dashboard/StatsSummary";
import { ExpiringAlert } from "@/components/dashboard/ExpiringAlert";
import { PriorityList } from "@/components/dashboard/PriorityList";
import { TodayRecipeHighlight } from "@/components/dashboard/TodayRecipeHighlight";
import { RecipeSuggestions } from "@/components/dashboard/RecipeSuggestions";
import { DailyTip } from "@/components/dashboard/DailyTip";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <GreetingHeader />
      <StatsSummary />
      <ExpiringAlert />
      <div className="grid lg:grid-cols-2 gap-6">
        <PriorityList />
        <TodayRecipeHighlight />
      </div>
      <RecipeSuggestions />
      <DailyTip />
    </div>
  );
}
