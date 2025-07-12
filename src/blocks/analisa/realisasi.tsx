"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import * as React from "react"

const RealisasiComponent = React.memo(() => {
  return (
    <Card className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Realisasi</h1>
          <p className="text-sm leading-relaxed text-gray-500">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit psu olor
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-6 pb-6">
        {/* Hari Ini */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Hari Ini</h3>
            <span className="text-sm text-gray-400">00/00</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div className="h-2 rounded-full bg-orange-400" style={{ width: "75%" }}></div>
          </div>
        </div>

        {/* Minggu Ini */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Minggu Ini</h3>
            <span className="text-sm text-gray-400">00/00</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div className="h-2 rounded-full bg-orange-400" style={{ width: "75%" }}></div>
          </div>
        </div>

        {/* Bulan Ini */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Bulan Ini</h3>
            <span className="text-sm text-gray-400">00/00</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div className="h-2 rounded-full bg-orange-400" style={{ width: "90%" }}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

RealisasiComponent.displayName = "RealisasiComponent"

export { RealisasiComponent }
