import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-4">
        <Skeleton className="w-full h-64" />
      </div>
    </div>
  );
}
