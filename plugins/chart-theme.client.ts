import { defineNuxtPlugin } from '#app'
import { ArcElement, BarElement, Chart, Legend, LineElement, PointElement, Tooltip } from 'chart.js'
import { chartFontFamily, chartToken } from '~/utils/chartTheme'

/**
 * Applies the design system to every Chart.js chart: fonts, text colour, gridlines and
 * tooltips. Purely presentational. Light mode only, so the defaults are set once at startup.
 */
export default defineNuxtPlugin(() => {
  // Each chart component registers what it uses, but plugin and element defaults only exist once
  // registered, so register them here first. All of them already ship in the chart bundle.
  Chart.register(Tooltip, Legend, BarElement, LineElement, PointElement, ArcElement)

  function apply() {
    const ink = chartToken('--c-ink', '#172131')
    const muted = chartToken('--c-ink-muted', '#4b5768')
    const rule = chartToken('--c-rule', '#d5deea')
    const surface = chartToken('--c-surface', '#ffffff')

    Chart.defaults.font.family = chartFontFamily
    Chart.defaults.font.size = 12
    Chart.defaults.color = muted
    Chart.defaults.borderColor = rule

    Chart.defaults.plugins.legend.labels.color = muted
    Chart.defaults.plugins.legend.labels.usePointStyle = true
    Chart.defaults.plugins.legend.labels.boxWidth = 8
    Chart.defaults.plugins.legend.labels.boxHeight = 8

    const tooltip = Chart.defaults.plugins.tooltip
    tooltip.backgroundColor = ink
    tooltip.titleColor = surface
    tooltip.bodyColor = surface
    tooltip.borderColor = ink
    tooltip.borderWidth = 0
    tooltip.cornerRadius = 6
    tooltip.padding = 10
    tooltip.boxPadding = 4
    tooltip.titleFont = { family: chartFontFamily, size: 12, weight: 600 }
    tooltip.bodyFont = { family: chartFontFamily, size: 12 }
    tooltip.usePointStyle = true

    Chart.defaults.elements.bar.borderRadius = 3
    Chart.defaults.elements.line.tension = 0.3
    Chart.defaults.elements.line.borderWidth = 2
    Chart.defaults.elements.point.radius = 0
    Chart.defaults.elements.point.hoverRadius = 4
    Chart.defaults.elements.arc.borderColor = surface
    Chart.defaults.elements.arc.borderWidth = 2
  }

  apply()
})
