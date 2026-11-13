import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { StatsSummary } from "@/components/dashboard/StatsSummary";
import { ExpiringAlert } from "@/components/dashboard/ExpiringAlert";
import { PriorityList } from "@/components/dashboard/PriorityList";
import { TodayRecipeHighlight } from "@/components/dashboard/TodayRecipeHighlight";
import { RecipeSuggestions } from "@/components/dashboard/RecipeSuggestions";
import { ImpactCard } from "@/components/dashboard/ImpactCard";
import { DailyTip } from "@/components/dashboard/DailyTip";

/**
 * Layout follows Gestalt proximity: what the user must act on (alert, urgent
 * foods, recipe of the day) sits together near the top; motivation (impact,
 * tip) at the end.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <GreetingHeader />
      <StatsSummary />
      <ExpiringAlert />
      <div className="grid lg:grid-cols-5 gap-6 items-stretch">
        <div className="lg:col-span-3">
          <PriorityList />
        </div>
        <div className="lg:col-span-2">
          <TodayRecipeHighlight />
        </div>
      </div>
      <RecipeSuggestions />
      <div className="grid md:grid-cols-2 gap-6">
        <ImpactCard />
        <DailyTip />
      </div>
    </div>
  );
}
