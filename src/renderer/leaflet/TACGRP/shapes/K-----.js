import L from 'leaflet'
import { calcStruts, line } from './geo-helper'

// TODO: can we parameterize this with different arrows?
// TODO: provide adequate styling information
// TODO: 'CATK' label in first segment
export const corridorShape = group => {
  const outline = L.SVG.path({
    stroke: 'black',
    'stroke-width': 5,
    'stroke-dasharray': '16 8', // 24
    fill: 'none',
    'stroke-linejoin': 'round'
  })

  const path = L.SVG.path({
    stroke: 'RGB(255, 48, 49)',
    'stroke-width': 3,
    'stroke-dasharray': '0 2 12 10', // 24
    fill: 'none',
    'stroke-linejoin': 'round'
  })

  group.appendChild(outline)
  group.appendChild(path)

  // NOTE: fully width envelope
  const updateFrame = ({ center, envelope }) => {
    const s = calcStruts(center, envelope)([ 0.38 ])

    // Interpolate points for corridor width (half of arrow width)
    // TODO: remove/simplify shape when minimum width is below a certain limit
    const struts = envelope.map(line).slice(1)

    const points = [[
      ...struts.map(s => s.point(0.75)).reverse(),
      s[0].point(0.75), s[0].point(1),
      center[0],
      s[0].point(0), s[0].point(0.25),
      ...struts.map(s => s.point(0.25))
    ]]

    const closed = false
    path.setAttribute('d', L.SVG.pointsToPath(points, closed))
    outline.setAttribute('d', L.SVG.pointsToPath(points, closed))
  }

  return { updateFrame }
}
