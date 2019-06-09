import React from 'react'
import L from 'leaflet'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { ipcRenderer } from 'electron'
import evented from '../../evented'
import 'leaflet/dist/leaflet.css'
import './leaflet-icons'
import { K } from '../../../shared/combinators'
import Leaflet from '../../leaflet'
import '../../layers/L.GeoJSON.Symbols'
import { zoomLevels } from './zoom-levels'
import { defaultValues } from '../ipc/display-filters'
import { tileProvider } from '../ipc/tile-provider'
import ipcHandlers from '../ipc/ipc'
import coord from '../../coord-format'
import settings from './settings'
import '../../layers/poi-layer'
import '../../layers/symbol-layer'

const updateScaleDisplay = map => () => {
  const level = zoomLevels[map.getZoom()]
  if (level) evented.emit('OSD_MESSAGE', { slot: 'C2', message: level.scale })
}

const saveViewPort = ({ target }) => {
  const { lat, lng } = target.getCenter()
  const zoom = target.getZoom()
  settings.map.setViewPort({ lat, lng, zoom })
}

const updateDisplayFilter = map => values => {
  const filter = Object.entries(values)
    .map(([name, { value, unit }]) => `${name}(${value}${unit})`)
    .join(' ')

  Leaflet
    .panes(layer => layer /* instanceof L.TileLayer */)(map)
    .map(pane => pane.style)
    .forEach(style => (style.filter = filter))
}

const updateCoordinateDisplay = ({ latlng }) => {
  evented.emit('OSD_MESSAGE', { slot: 'C3', message: `${coord.format(latlng)}` })
}

class Map extends React.Component {
  componentDidMount () {
    const { id, options, onMoveend, onZoomend } = this.props
    const viewPort = settings.map.getViewPort()

    // Override center/zoom options if available from settings:
    if (viewPort) {
      options.center = L.latLng(viewPort.lat, viewPort.lng)
      options.zoom = viewPort.zoom
    }

    this.map = K(L.map(id, options))(map => {
      evented.emit('MAP_CREATED', map)

      const mapVisible = settings.map.visible()
      if (mapVisible) L.tileLayer(tileProvider().url, tileProvider()).addTo(map)

      map.on('moveend', saveViewPort)
      map.on('moveend', event => onMoveend(event.target.getCenter()))
      map.on('zoom', updateScaleDisplay(map))
      map.on('zoomend', event => onZoomend(event.target.getZoom()))
      map.on('mousemove', updateCoordinateDisplay)
      map._container.focus()
    })

    evented.on('OSD_MOUNTED', updateScaleDisplay(this.map))
    evented.on('MAP:DISPLAY_FILTER_CHANGED', updateDisplayFilter(this.map))
    evented.emit('MAP:DISPLAY_FILTER_CHANGED', settings.map.getDisplayFilters(defaultValues()))

    // Bind command handlers after map was initialized:
    const context = { map: this.map }
    Object.entries(ipcHandlers).forEach(([channel, handler]) => {
      ipcRenderer.on(channel, (_, args) => handler(context)(args))
    })
  }

  componentDidUpdate (prevProps) {
    const map = this.map
    const { center, zoom } = this.props
    const centerChanged = center && !prevProps.center.equals(center)
    const zoomChanged = zoom && prevProps.zoom !== zoom

    if (centerChanged && zoomChanged) map.flyTo(center, zoom)
    else {
      if (centerChanged) map.panTo(center)
      if (zoomChanged) map.setZoom(zoom)
    }
  }

  render () {
    const { classes, id } = this.props
    return (
      <div
        id={ id }
        className={ classes.root }
      >
      </div>
    )
  }
}

Map.propTypes = {
  classes: PropTypes.any.isRequired,
  options: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  center: PropTypes.any.isRequired,
  zoom: PropTypes.any.isRequired,
  onMoveend: PropTypes.func.isRequired,
  onZoomend: PropTypes.func.isRequired
}

const styles = {
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 10
  }
}

export default withStyles(styles)(Map)
