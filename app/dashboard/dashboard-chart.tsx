"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartPoint } from "@/lib/dashboard";
import { formatDistance } from "@/lib/workouts";

const RED = "#D8222A";
const INK = "#141414";
const MUTED = "#4b4b4b";
const GRID = "#e4e1d6";

// What shows when you hover or tap a bar.
function BarTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChartPoint }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="chart-tip">
      <strong>{point.label}</strong>
      <span>{formatDistance(point.meters)} of hard reps</span>
    </div>
  );
}

// One bar per session: how many meters of hard reps you ran that day.
export default function DashboardChart({ points }: { points: ChartPoint[] }) {
  return (
    <div
      role="img"
      aria-label={`Bar chart of hard-rep distance for each of ${points.length} sessions. The same numbers are in the table below.`}
      className="chart-box"
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: INK }} tick={{ fill: MUTED, fontSize: 12 }} interval="preserveStartEnd" />
          <YAxis
            width={56}
            tickLine={false}
            axisLine={false}
            tick={{ fill: MUTED, fontSize: 12 }}
            tickFormatter={(value: number) => formatDistance(value)}
          />
          <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(20,20,20,0.06)" }} />
          <Bar dataKey="meters" fill={RED} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
