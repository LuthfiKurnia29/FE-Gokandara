"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Cell, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"

const chartData = [
  { category: "saleProperties", value: 56, fill: "var(--color-saleProperties)" },
  { category: "greenCard", value: 25, fill: "var(--color-greenCard)" },
  { category: "yellowCard", value: 10, fill: "var(--color-yellowCard)" },
  { category: "rentedProperties", value: 6, fill: "var(--color-rentedProperties)" },
  { category: "purpleCard", value: 3, fill: "var(--color-purpleCard)" },
]

const chartConfig = {
  saleProperties: {
    label: "Sale Properties",
    color: "#3b82f6", // Blue
  },
  greenCard: {
    label: "Green Card",
    color: "#22c55e", // Green
  },
  yellowCard: {
    label: "Yellow Card",
    color: "#eab308", // Yellow
  },
  rentedProperties: {
    label: "Rented Properties",
    color: "#f97316", // Orange
  },
  purpleCard: {
    label: "Purple Card",
    color: "#8b5cf6", // Purple
  },
} satisfies ChartConfig

const renderActiveShape = (props: PieSectorDataItem) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={(outerRadius || 0) + 15}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))",
          transition: "all 0.3s ease-in-out",
        }}
      />
    </g>
  )
}

export const DiagramPenjualanComponent = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [hoveredLegend, setHoveredLegend] = useState<number | null>(null)

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(0) // Reset to default active (blue segment)
  }

  const onLegendEnter = (index: number) => {
    setHoveredLegend(index)
    setActiveIndex(index)
  }

  const onLegendLeave = () => {
    setHoveredLegend(null)
    setActiveIndex(0)
  }

  const legendItems = [
    { category: "saleProperties", label: "Sale Properties" },
    { category: "rentedProperties", label: "Rented Properties" },
    { category: "purpleCard", label: "Purple Card" },
    { category: "yellowCard", label: "Yellow Card" },
    { category: "greenCard", label: "Green Card" },
  ]

  return (
    <Card className="w-full rounded-2xl border border-gray-100 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <h2 className="text-xl font-bold text-gray-900">Diagram Penjualan</h2>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <div className="grid grid-cols-1 items-center gap-6">
          {/* Interactive Chart */}
          <div className="flex justify-center relative">
            <ChartContainer config={chartConfig} className="aspect-square w-full max-w-[280px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      const config = chartConfig[data.category as keyof typeof chartConfig]
                      return (
                        <div className="scale-105 transform rounded-lg border border-gray-200 bg-white p-3 shadow-xl transition-all duration-200">
                          <div className="mb-1 flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: config.color }} />
                            <span className="text-sm font-semibold text-gray-900">{config.label}</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            <span className="text-lg font-bold text-gray-900">{data.value}%</span> of total
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="category"
                  innerRadius={60}
                  outerRadius={110}
                  strokeWidth={2}
                  stroke="#ffffff"
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  style={{ cursor: "pointer" }}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartConfig[entry.category as keyof typeof chartConfig].color}
                      style={{
                        transition: "all 0.3s ease-in-out",
                        opacity: activeIndex === index ? 1 : 0.8,
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* Center Percentage Display - Properly positioned */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
                <span className="text-2xl font-bold text-gray-900">{chartData[activeIndex]?.value || 56}%</span>
              </div>
            </div>
          </div>

          {/* Interactive Legend */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {legendItems.map((item, index) => {
              const dataItem = chartData.find((d) => d.category === item.category)
              return (
                <div
                  key={item.category}
                  className={`flex cursor-pointer items-center justify-between rounded-lg p-2 transition-all duration-300 ${
                    hoveredLegend === index || activeIndex === index
                      ? "scale-105 transform bg-gray-50 shadow-sm"
                      : "hover:bg-gray-25"
                  }`}
                  onMouseEnter={() => onLegendEnter(chartData.findIndex((d) => d.category === item.category))}
                  onMouseLeave={onLegendLeave}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full transition-all duration-300 ${
                        hoveredLegend === index ||
                        activeIndex === chartData.findIndex((d) => d.category === item.category)
                          ? "h-4 w-4 shadow-md"
                          : ""
                      }`}
                      style={{
                        backgroundColor: chartConfig[item.category as keyof typeof chartConfig].color,
                      }}
                    />
                    <span
                      className={`text-sm font-medium transition-all duration-300 ${
                        hoveredLegend === index ||
                        activeIndex === chartData.findIndex((d) => d.category === item.category)
                          ? "font-semibold text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-medium transition-all duration-300 ${
                      hoveredLegend === index ||
                      activeIndex === chartData.findIndex((d) => d.category === item.category)
                        ? "text-base font-bold text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {dataItem?.value || 0}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
