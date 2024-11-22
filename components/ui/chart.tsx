"use client"

import * as React from "react"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  LegendProps
} from "recharts"
import { cn } from "@/lib/utils"

// Define theme constants
const THEMES = { light: "", dark: ".dark" } as const

// Type definitions
interface ChartConfig {
  [key: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
    theme?: Record<keyof typeof THEMES, string>
  }
}

interface ChartContextProps {
  config: ChartConfig
}

interface PayloadItem {
  value: number | string
  dataKey?: string
  name?: string
  color?: string
  payload?: Record<string, unknown>
}

// Context setup
const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart must be used within a ChartContainer")
  return context
}

// Helper function
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: PayloadItem,
  key: string
) {
  const configKey = payload[key as keyof PayloadItem] as string || key
  return config[configKey] || config[payload.dataKey || ""] || null
}

// Main components
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ReactElement
  }
>(({ id, className, children, config, ...props }, ref) => {
  const chartId = React.useId().replace(/:/g, "")
  
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          "[&_.recharts-cartesian-grid_line]:stroke-border/50",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <ResponsiveContainer>
          {React.cloneElement(children)}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean
    payload?: PayloadItem[]
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
    label?: string
    labelFormatter?: (label: React.ReactNode, payload: PayloadItem[]) => React.ReactNode
    formatter?: (value: number | string, name: string, item: PayloadItem, index: number, payload: Record<string, unknown>) => React.ReactNode
  }
>(({ active, payload, className, indicator = "dot", hideLabel = false, ...props }, ref) => {
  const { config } = useChart()
  
  if (!active || !payload?.length) return null

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] gap-1.5 rounded-lg border bg-background p-2.5 shadow-md",
        className
      )}
    >
      {payload.map((item, index) => {
        const key = item.dataKey || "value"
        const itemConfig = getPayloadConfigFromPayload(config, item, key)
        
        return (
          <div key={key} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm font-medium">
              {itemConfig?.label || item.name}: {item.value}
            </span>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([_, cfg]) => cfg.theme || cfg.color)
  if (!colorConfig.length) return null

  const styles = Object.entries(THEMES)
    .map(([theme, prefix]) => `
      ${prefix} [data-chart=${id}] {
        ${colorConfig
          .map(([key, cfg]) => {
            const color = cfg.theme?.[theme as keyof typeof THEMES] || cfg.color
            return color ? `--color-${key}: ${color};` : ""
          })
          .filter(Boolean)
          .join("\n")}
      }
    `)
    .join("\n")

  return <style dangerouslySetInnerHTML={{ __html: styles }} />
}

export {
  ChartContainer,
  ChartTooltipContent,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Line,
  LineChart,
  XAxis,
  YAxis
}
