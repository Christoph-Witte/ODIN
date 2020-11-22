import * as R from 'ramda'
import * as TS from '../ts'
import { arrowCoordinates } from './arrow'

/**
 * TACGRP.C2GM.OFF.LNE.AXSADV.GRD.MANATK
 * AXIS OF ADVANCE / MAIN ATTACK
 */
export default options => {
  const { width, line, point, styles } = options
  const aps = arrowCoordinates(width, line)([
    [0, 0], [3 / 4, 1], [3 / 4, 1 / 2],
    [3 / 8, 0], [3 / 4, -1 / 2], [3 / 4, -1], [3 / 4, 0]
  ])

  const arrow = TS.polygon(R.props([0, 1, 2, 3, 4, 5, 0], aps))
  const arrowBoundary = TS.polygon(R.props([0, 1, 5, 0], aps))

  // Shorten last center line segment to arrow base and calculate buffer.
  // NOTE: Buffer is slightly increased by 1 meter, so union with
  // arrow does not produce gaps.
  const centerline = TS.lineString([...R.init(line.getCoordinates()), aps[6]])
  const buffer = TS.lineBuffer(centerline)(width / 2).buffer(1)
  const corridor = TS.difference([
    TS.union([buffer, arrowBoundary]).getBoundary(),
    TS.pointBuffer(TS.startPoint(line))(width / 2)
  ])

  return [
    styles.solidLine(TS.union([corridor, arrow])),
    styles.wireFrame(line),
    styles.handles(TS.multiPoint([point, ...TS.linePoints(line)]))
  ]
}
