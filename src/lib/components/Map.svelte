<script lang="ts">
  // @ts-nocheck
  import { onMount, onDestroy } from 'svelte';
  import { Map } from 'mapbox-gl';
  import 'mapbox-gl/dist/mapbox-gl.css';
  
  export let data;
  export let lng, lat, zoom

  let map;
  let mapContainer;

  onMount(() => {
    const { dmas, markets, venues } = data

    let featuresDMA = [];
    if(dmas) {
      dmas.forEach(d => {
        const coordinates = JSON.parse(d.geometry);  // Assuming `d.geometry` is a valid JSON string
        featuresDMA.push({
          'type': 'Feature',
          'geometry': {
            ...coordinates
          }
        });
      });
    }

    const geojsonDMAData = {
      'type': 'FeatureCollection',
      'features': featuresDMA
    };

    let features = [];
    if(markets) {
      markets.forEach(d => {
        if(d.coordinates === "['na', 'na']") {
          features.push({
            'type': 'Feature',
            "geometry": {
              "type": "Point",
              "coordinates": []
            },
          })
        } else {
          const coordinates = JSON.parse(d.coordinates);  // Assuming `d.geometry` is a valid JSON string
          features.push({
            'type': 'Feature',
            "geometry": {
              "type": "Point",
              "coordinates": [coordinates[1], coordinates[0]]
            },
          });
        }
      });
    }

    const geojsonMarketData = {
      'type': 'FeatureCollection',
      'features': features
    };

    let featuresVenues = [];

    if(venues) {
      venues.forEach(d => {
        featuresVenues.push({
          'type': 'Feature',
          "geometry": {
            "type": "Point",
            "coordinates": [+d.longitude, +d.latitude]
          },
        });
      });
    }

    const geojsonVenueData = {
      'type': 'FeatureCollection',
      'features': featuresVenues
    };

    const initialState = { lng: lng, lat: lat, zoom: zoom };

    map = new Map({
      container: mapContainer,
      accessToken: "pk.eyJ1IjoiZGlhbmFtZW93IiwiYSI6ImNtMjdiYTlsMDE2dnQyanNkY3QwZGM1MDYifQ.RcyFRsVLVXDuEdtToBuGkw",
      style: `mapbox://styles/mapbox/dark-v11`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom
    });

    map.on('load', () => {
      // Add a GeoJSON data source
      map.addSource('dmas', {
        'type': 'geojson',
        'data': geojsonDMAData  // Proper GeoJSON structure
      });

      // Add a new layer to visualize the polygon.
      map.addLayer({
        'id': 'dmas',
        'type': 'fill',
        'source': 'dmas', // Reference the data source
        'layout': {},
        'paint': {
          "stroke-color": '#1e3a8a',
          "stroke-opacity": 1,
          'fill-color': '#1e3a8a',  // Blue color fill
          'fill-opacity': 0.5
        }
      });

      // Add the line layer (the stroke around the polygon)
      map.addLayer({
        'id': 'polygon-outline',
        'type': 'line',
        'source': 'dmas',
        'paint': {
            'line-color': 'black', // Stroke color
            'line-width': [
                'interpolate', // Use 'interpolate' to define zoom-dependent values
                ['linear'],    // Linear interpolation
                ['zoom'],      // Based on the zoom level
                5, 1,          // At zoom level 5, line-width is 1px
                10, 2,         // At zoom level 10, line-width is 2px
                15, 4,         // At zoom level 15, line-width is 4px
                20, 8          // At zoom level 20, line-width is 8px
            ]
        }
      });

      // Add a GeoJSON data source
      map.addSource('markets', {
        'type': 'geojson',
        'data': geojsonMarketData  // Proper GeoJSON structure
      });

      // Add a new layer to visualize the polygon.
      map.addLayer({
        'id': 'markets',
        'type': 'circle',
        'source': 'markets', // Reference the data source
        'layout': {},
        'paint': {
          'circle-color': '#2563eb', // Circle color
          'circle-radius': [
              'interpolate', // Use 'interpolate' to define zoom-dependent values
              ['linear'],    // Linear interpolation
              ['zoom'],      // Based on the zoom level
              5, 3,          // At zoom level 5, line-width is 1px
              10, 6,         // At zoom level 10, line-width is 2px
              15, 9,         // At zoom level 15, line-width is 4px
              20, 12          // At zoom level 20, line-width is 8px
          ],
          'circle-opacity': 0.8 // Circle opacity
        }
      });

      // Add a GeoJSON data source
      map.addSource('venues', {
        'type': 'geojson',
        'data': geojsonVenueData  // Proper GeoJSON structure
      });

      // Add a new layer to visualize the polygon.
      map.addLayer({
        'id': 'venues',
        'type': 'circle',
        'source': 'venues', // Reference the data source
        'layout': {},
        'paint': {
          'circle-color': '#fff', // Circle color
          'circle-radius': 3, // Circle radius
          'circle-opacity': 0.8 // Circle opacity
        }
      });     

      // Add click event listener for circles in the 'circle-layer'
      map.on('click', 'circle-layer', (e) => {
        // Get the clicked feature (circle) properties
        const clickedFeature = e.features[0];
        const coordinates = clickedFeature.geometry.coordinates.slice();
        const name = clickedFeature.properties.name;

        // Display an alert or popup with feature information
        new map.Popup()
            .setLngLat(coordinates)
            .setHTML(`<h3>${name}</h3>`)
            .addTo(map);
      });

      // Change the cursor to a pointer when hovering over the circle layer
      map.on('mouseenter', 'circle-layer', () => {
          map.getCanvas().style.cursor = 'pointer';
      });

      // Reset the cursor when it leaves the circle layer
      map.on('mouseleave', 'circle-layer', () => {
          map.getCanvas().style.cursor = '';
      });

    });
  });

  onDestroy(() => {
    map.remove();
  });
</script>

<div class="map-wrap">
  <div class="map" bind:this="{mapContainer}" />
</div>

<style>
  .map {
    position: absolute;
    width: 100%;
    height: 100%;
  }
</style>
