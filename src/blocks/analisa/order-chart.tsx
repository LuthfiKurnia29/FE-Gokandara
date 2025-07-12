"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { MoreVertical } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useState } from "react"

const dailyData = [
  { period: "Sen", pemesanan: 120 },
  { period: "Sel", pemesanan: 180 },
  { period: "Rab", pemesanan: 150 },
  { period: "Kam", pemesanan: 220 },
  { period: "Jum", pemesanan: 280 },
  { period: "Sab", pemesanan: 320 },
  { period: "Min", pemesanan: 200 },
]

const weeklyData = [
  { period: "Minggu 1", pemesanan: 450 },
  { period: "Minggu 2", pemesanan: 380 },
  { period: "Minggu 3", pemesanan: 520 },
  { period: "Minggu 4", pemesanan: 350 },
]

const monthlyData = [
  { period: "Minggu 01", pemesanan: 450 },
  { period: "Minggu 02", pemesanan: 180 },
  { period: "Minggu 03", pemesanan: 320 },
  { period: "Minggu 04", pemesanan: 520 },
  { period: "Minggu 05", pemesanan: 280 },
  { period: "Minggu 06", pemesanan: 150 },
  { period: "Minggu 07", pemesanan: 380 },
  { period: "Minggu 08", pemesanan: 250 },
]

const chartConfig = {
  pemesanan: {
    label: "Pemesanan",
    color: "#22c55e",
  },
} satisfies ChartConfig

type TimePeriod = "harian" | "mingguan" | "bulanan"

export const OrderChartComponent = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("bulanan")

  const getChartData = () => {
    switch (selectedPeriod) {
      case "harian":
        return dailyData
      case "mingguan":
        return weeklyData
      case "bulanan":
        return monthlyData
      default:
        return monthlyData
    }
  }

  const tabs = [
    { id: "harian" as TimePeriod, label: "Harian" },
    { id: "mingguan" as TimePeriod, label: "Mingguan" },
    { id: "bulanan" as TimePeriod, label: "Bulanan" },
  ]

  return (
    <Card className="w-full rounded-2xl border border-gray-100 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Statistik Pemesanan</h3>
          <div className="flex items-center gap-4">
            {/* Time Period Tabs */}
            <div className="flex items-center gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedPeriod(tab.id)}
                  className={`relative pb-1 text-sm font-medium transition-colors ${
                    selectedPeriod === tab.id ? "text-green-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  {selectedPeriod === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
            <MoreVertical className="h-4 w-4 text-gray-600" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={getChartData()}
            margin={{
              left: 20,
              right: 20,
              top: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              domain={[0, 600]}
              ticks={[0, 150, 300, 450, 600]}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="pemesanan"
              type="monotone"
              fill="#22c55e"
              fillOpacity={0.3}
              stroke="#22c55e"
              strokeWidth={3}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
