import React from "react";
import { ShowcaseHubView } from "@/components/demo/ShowcaseHubView";

export default function DemoPage() {
  return (
    <React.Suspense fallback={null}>
      <ShowcaseHubView />
    </React.Suspense>
  );
}
