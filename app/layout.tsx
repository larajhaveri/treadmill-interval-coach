import type { Metadata } from "next";
import "./globals.css";
import AnalyticsIdentify from "./analytics-identify";

export const metadata: Metadata = {
  title: "Treadmill Interval Coach",
  description: "A voice coach for treadmill interval workouts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AnalyticsIdentify />
        {children}
      </body>
    </html>
  );
}
