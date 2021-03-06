import EventEmitter from 'events'
import React from 'react'
import { ListItemText } from '@material-ui/core'
import L from 'leaflet'
import evented from '../evented'
import nominatim from './nominatim'

let map
evented.once('MAP_CREATED', reference => (map = reference))

export default register => {
  const contributor = new EventEmitter()
  const term = register(contributor)

  const searchOptions = {
    limit: 15, // default: 10, maximun: 50
    addressdetails: 1,
    namedetails: 0,
    dedupe: 1
  }

  contributor.updateFilter = () => {
    const { lat, lng } = map.getCenter()

    nominatim(searchOptions)(term()).then(rows => {
      const distance = x => Math.sqrt(
        Math.pow((lat - Number.parseFloat(x.lat)), 2) +
        Math.pow((lng - Number.parseFloat(x.lon)), 2)
      )

      return rows
        .sort((a, b) => distance(a) - distance(b))
        .map(row => ({
          key: row.place_id, // mandatory
          text: <ListItemText primary={ row.display_name } secondary={ 'Place' }/>,
          action: () => evented.emit('map.center', L.latLng(row.lat, row.lon))
        }))
    }).then(items => contributor.emit('updated', items))
  }
}
