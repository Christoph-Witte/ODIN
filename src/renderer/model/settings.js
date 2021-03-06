import path from 'path'
import settings from 'electron-settings'

// Dedicated file for map settings:
settings.setPath(path.format({
  dir: path.dirname(settings.file()),
  base: 'MapSettings'
}))

const TILE_PROVIDER = 'tileProvider'
const HIDPI_SUPPORT = 'hiDPISupport'
const MAP_VISIBLE = 'mapVisible'
const PALETTE_VISIBLE = 'paletteVisible'
const LINE_SMOOTHING = 'lineSmoothing'
const HIDE_LABELS = 'hideLabels'
const VIEW_PORT = 'viewPort'
const COORDINATE_FORMAT = 'coordinateFormat'
const OSD_VISIBLE = 'osdVisible'
const OSD_OPTIONS = 'osdOptions'
const BOOKMARKS = 'bookmarks'
const OPENED_SET_INDEX = 'openSetIndex'
const USED_RECENTLY = 'usedRecently'

export default {
  map: {
    visible: () => settings.has(MAP_VISIBLE) ? settings.get(MAP_VISIBLE) : true,
    show: () => settings.set(MAP_VISIBLE, true),
    hide: () => settings.set(MAP_VISIBLE, false),
    getViewPort: () => settings.get(VIEW_PORT),
    setViewPort: viewPort => settings.set(VIEW_PORT, viewPort),
    getLineSmoothing: () => settings.get(LINE_SMOOTHING),
    setLineSmoothing: args => settings.set(LINE_SMOOTHING, args),
    getHideLabels: () => settings.get(HIDE_LABELS) || false,
    setHideLabels: value => settings.set(HIDE_LABELS, value)
  },
  palette: {
    visible: () => settings.has(PALETTE_VISIBLE) ? settings.get(PALETTE_VISIBLE) : true,
    show: () => settings.set(PALETTE_VISIBLE, true),
    hide: () => settings.set(PALETTE_VISIBLE, false),
    getOpenedSetIndex: () => settings.has(OPENED_SET_INDEX) ? settings.get(OPENED_SET_INDEX) : -1,
    setOpenSet: index => settings.set(OPENED_SET_INDEX, index),
    getRecentlyUsed: () => settings.get(USED_RECENTLY),
    setRecentlyUsed: arr => settings.set(USED_RECENTLY, arr)
  },
  tileProvider: {
    get: defaultProvider => settings.get(TILE_PROVIDER) || defaultProvider,
    set: tileProvider => settings.set(TILE_PROVIDER, tileProvider)
  },
  hidpi: {
    get: () => settings.get(HIDPI_SUPPORT) || false,
    set: enabled => settings.set(HIDPI_SUPPORT, enabled)
  },
  formats: {
    coordinate: {
      set: format => settings.set(COORDINATE_FORMAT, format),
      get: defaultFormat => settings.get(COORDINATE_FORMAT) || defaultFormat
    }
  },
  osd: {
    visible: () => settings.has(OSD_VISIBLE) ? settings.get(OSD_VISIBLE) : true,
    options: () => settings.get(OSD_OPTIONS) || ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'],
    setOptions: options => settings.set(OSD_OPTIONS, options)
  },
  bookmarks: {
    get: () => settings.get(BOOKMARKS) || {},
    set: bookmarks => settings.set(BOOKMARKS, bookmarks)
  }
}
