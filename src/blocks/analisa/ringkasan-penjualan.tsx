"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { MoreVertical } from "lucide-react"
import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

type TimePeriod = "harian" | "mingguan" | "bulanan"

const chartData = [
  { name: "outer", value: 85, color: "#3b82f6" },
  { name: "middle", value: 65, color: "#f97316" },
  { name: "inner", value: 45, color: "#22c55e" },
  { name: "center", value: 25, color: "#ef4444" },
]

const chartConfig = {
  outer: { color: "#3b82f6" },
  middle: { color: "#f97316" },
  inner: { color: "#22c55e" },
  center: { color: "#ef4444" },
}

export const RingkasanPenjualanComponent = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("bulanan")

  const tabs = [
    { id: "harian" as TimePeriod, label: "Harian" },
    { id: "mingguan" as TimePeriod, label: "Mingguan" },
    { id: "bulanan" as TimePeriod, label: "Bulanan" },
  ]

  const metrics = [
    { color: "#3b82f6", value: "00", label: "Lorem Ipsum" },
    { color: "#f97316", value: "00", label: "Lorem Ipsum" },
    { color: "#22c55e", value: "00", label: "Lorem Ipsum" },
    { color: "#ef4444", value: "00", label: "Lorem Ipsum" },
  ]

  return (
    <Card className="w-full rounded-2xl border border-gray-100 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Ringkasan Penjualan</h2>
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

      <CardContent className="px-6 pb-6">
        <div className="flex items-center gap-8">
          {/* Multi-layer Circular Chart */}
          <div className="flex-shrink-0">
            <ChartContainer config={chartConfig} className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {/* Outer ring - Blue */}
                  <Pie
                    data={[{ value: 85 }, { value: 15 }]}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={95}
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                  {/* Middle ring - Orange */}
                  <Pie
                    data={[{ value: 65 }, { value: 35 }]}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={75}
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    <Cell fill="#f97316" />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                  {/* Inner ring - Green */}
                  <Pie
                    data={[{ value: 45 }, { value: 55 }]}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={55}
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                  {/* Center ring - Red */}
                  <Pie
                    data={[{ value: 25 }, { value: 75 }]}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={35}
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    <Cell fill="#ef4444" />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Metrics Grid */}
          <div className="flex-1 grid grid-cols-2 gap-6">
            {metrics.map((metric, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-1 h-12 rounded-full" style={{ backgroundColor: metric.color }} />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                  <div className="text-sm text-gray-500">{metric.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
