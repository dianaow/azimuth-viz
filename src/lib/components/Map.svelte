<script lang="ts">
  // @ts-nocheck
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { Map, Popup, MercatorCoordinate } from 'mapbox-gl';
  import 'mapbox-gl/dist/mapbox-gl.css';
  
  export let data;
  export let lng, lat, zoom;
  export let handleSelection: ((option: DMAData) => void) | null = null;

  let map;
  let mapContainer;
  let scenes = []
  const MAX_ZOOM = 15;
  const MIN_SCALE = 1;
  const DEBOUNCE_DELAY = 100; // ms
  //const accessToken = import.meta.env.PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Update the map center when lat/lng changes
  $: {
    if (map && lat !== undefined && lng !== undefined) {
      //map.setCenter([lng, lat]);
      map.flyTo({
        zoom,
        center: [lng, lat],
        duration: 2000,
        essential: true
      });
    }
  }

  $: modelLocation = {
    center: [lng, lat],
    zoom,
    pitch: 60,
    bearing: 10,
    scalingFactor: 500,
  };

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function initializeMap(mapContainer, modelLocation) {
    return new Map({
      container: mapContainer,
      accessToken: "",
      style: `mapbox://styles/mapbox/dark-v11`,
      center: modelLocation.center,
      zoom: modelLocation.zoom,
      pitch: modelLocation.pitch,
      bearing: modelLocation.bearing,
      antialias: true,
      maxZoom: 14,
      minZoom: 5
    });
  }

  function createCapsule(color, wireColor, radius, length, capSegments, radialSegments) {
    const geometry = new THREE.CapsuleGeometry(radius, length, capSegments, radialSegments);

    // Semi-transparent material for the capsule surface
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.5
    });

    const capsule = new THREE.Mesh(geometry, material);
    capsule.name = 'capsule';

    // Wireframe geometry to visualize vertices
    const wireframe = new THREE.WireframeGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: wireColor || 0x000000  // Default black wireframe if wireColor is not supplied
    });

    const wireframeMesh = new THREE.LineSegments(wireframe, lineMaterial);

    // Rotate the capsule to make it vertical (along the Y-axis)
    capsule.rotation.x = Math.PI / 2;
    wireframeMesh.rotation.x = Math.PI / 2;

    // Group to hold both the capsule and its wireframe
    const group = new THREE.Group();
    group.add(capsule);
    group.add(wireframeMesh);

    return group;
  }

  function initialize3DLayer(geoJSON, map, modelLocation, options = {}) {
    const { layerId, color, wireColor, radius = 1, length = 2, capSegments = 1, radialSegments = 5 } = options;

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const frustum = new THREE.Frustum();
    const projScreenMatrix = new THREE.Matrix4();

    // Create capsules for each geoJSON marker
    const capsules = geoJSON.features.map(marker => {
      const capsule = createCapsule(color, wireColor, radius, length, capSegments, radialSegments);
      scene.add(capsule);
      return { capsule, marker };
    });

    // Add ambient and directional lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);  // Increased intensity
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);  // Increased intensity
    directionalLight.position.set(0, -70, 100).normalize();
    scene.add(directionalLight);

    const renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: map.painter.context.gl,
      antialias: true
    });

    renderer.autoClear = false;

    const updateCapsulePositions = () => {
      const zoom = map.getZoom();
      capsules.forEach(({ capsule, marker }) => {
        const modelOrigin = [marker.geometry.coordinates[0], marker.geometry.coordinates[1]];
        const modelAsMercatorCoordinate = MercatorCoordinate.fromLngLat(modelOrigin, 2500 - Math.pow((zoom*3), 2));
        const modelTransform = {
          translateX: modelAsMercatorCoordinate.x,
          translateY: modelAsMercatorCoordinate.y,
          translateZ: modelAsMercatorCoordinate.z ,
          scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() * modelLocation.scalingFactor
        };

        const zoomScaleFactor = 1 - Math.pow(zoom/MAX_ZOOM, 2);
        console.log('zoom', zoom, Math.pow((zoom*3), 2), zoomScaleFactor)
        const scale = modelTransform.scale * zoomScaleFactor;
        capsule.position.set(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ);
        capsule.scale.set(scale, scale, scale);
        
        capsule.updateMatrixWorld();
      });
    };

    //const debouncedUpdate = debounce(updateCapsulePositions, DEBOUNCE_DELAY);
    const debouncedUpdate = updateCapsulePositions

    const customLayer = {
      id: layerId || '3d-model-layer', // Use layerId from options or fallback to default
      type: 'custom',
      renderingMode: '3d',
      onAdd: function () {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.map = map;

        updateCapsulePositions();
        this.map.on('zoom', debouncedUpdate);
        this.map.on('move', debouncedUpdate);
      },
      render: function (gl, matrix) {
        this.camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
        projScreenMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
        frustum.setFromProjectionMatrix(projScreenMatrix);

        this.scene.traverse((object) => {
          if (object.isMesh) object.frustumCulled = false;
        });
        
        this.renderer.state.reset();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.map.triggerRepaint());
      }
    };

    map.addLayer(customLayer);
    return scene
  }

  onMount(() => {
    let { dmas, dma, markets, venues, stations } = data

    map = initializeMap(mapContainer, modelLocation);

    map.on('load', () => {
      if(dmas || dma) {
        dmas = dma ? [dma] : dmas

        let featuresDMA = [];
        dmas.forEach(d => {
          const coordinates = JSON.parse(d.geometry);  // Assuming `d.geometry` is a valid JSON string
          featuresDMA.push({
            'type': 'Feature',
            'geometry': {
              ...coordinates
            },
            'properties': {
              ...d
            }
          });
        });

        const geojsonDMAData = {
          'type': 'FeatureCollection',
          'features': featuresDMA
        };

        // Add a GeoJSON data source
        map.addSource('dmas', {
          'type': 'geojson',
          'data': geojsonDMAData  // Proper GeoJSON structure
        });

        if(dma) {
          map.addLayer({
            'id': 'dma-extrusion',
            'type': 'fill-extrusion',
            'source': 'dmas',
            'paint': {
                // Get the `fill-extrusion-color` from the source `color` property.
                'fill-extrusion-color': '#1e3a8a',

                // Get `fill-extrusion-height` from the source `height` property.
                'fill-extrusion-height': 500,

                // Get `fill-extrusion-base` from the source `base_height` property.
                'fill-extrusion-base': 0,

                // Make extrusions slightly opaque to see through indoor walls.
                'fill-extrusion-opacity': 0.5
            }
          }); 
        } else {
          // Add a new layer to visualize the polygon.
          map.addLayer({
            'id': 'dmas-polygon',
            'type': 'fill',
            'source': 'dmas', // Reference the data source
            'layout': {},
            'paint': {
              "stroke-color": 'black',
              "stroke-opacity": 1,
              'fill-color': '#1e3a8a',  // Blue color fill
              'fill-opacity': 0.5
            }
          });

          // Add the line layer (the stroke around the polygon)
          map.addLayer({
            'id': 'dma-polygon-outline',
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

          map.on('click', 'dmas-polygon', (e) => {
            if(dma) return
            // Get the clicked feature properties
            const clickedFeature = e.features[0];
            //const coordinates = clickedFeature.geometry.coordinates.slice();
            if(handleSelection) handleSelection(clickedFeature.properties);
          });
        }
      }

      if(markets) {
        let features = [];
        markets.forEach(d => {
          if(d.coordinates === "['na', 'na']") {
            features.push({
              'type': 'Feature',
              "geometry": {
                "type": "Point",
                "coordinates": []
              },
              "properties": {
                ...d
              }
            })
          } else {
            const coordinates = JSON.parse(d.coordinates);
            features.push({
              'type': 'Feature',
              "geometry": {
                "type": "Point",
                "coordinates": [coordinates[1], coordinates[0]]
              },
              "properties": {
                ...d
              }
            });
          }
        });

        const geojsonMarketData = {
          'type': 'FeatureCollection',
          'features': features
        }

        // map.addSource('markets', {
        //   'type': 'geojson',
        //   'data': geojsonMarketData
        // });

        // map.addLayer({
        //   'id': 'markets',
        //   'type': 'circle',
        //   'source': 'markets',
        //   'layout': {},
        //   'paint': {
        //     'circle-color': '#3b82f6', // Circle color
        //     'circle-radius': [
        //         'interpolate', // Use 'interpolate' to define zoom-dependent values
        //         ['linear'],    // Linear interpolation
        //         ['zoom'],      // Based on the zoom level
        //         5, 5,          // At zoom level 5, line-width is 1px
        //         10, 15,         // At zoom level 10, line-width is 2px
        //         15, 30,         // At zoom level 15, line-width is 4px
        //         20, 30          // At zoom level 20, line-width is 8px
        //     ],
        //     'circle-opacity': 0.8 // Circle opacity
        //   }
        // });

        initialize3DLayer(geojsonMarketData, map, modelLocation, {
          layerId: '3d-model-markets',
          color: '#60a5fa',        
          wireColor: '#3b82f6',     // Wireframe color
          radius: 3,               // Capsule radius
          length: 8,               // Capsule length
          capSegments: 1,          // Number of segments in the caps
          radialSegments: 5        // Number of radial segments
        });
      }

      if(venues) {
        let featuresVenues = [];
        if(venues) {
          venues.forEach(d => {
            featuresVenues.push({
              'type': 'Feature',
              "geometry": {
                "type": "Point",
                "coordinates": [+d.longitude, +d.latitude]
              },
              "properties": {
                ...d
              }
            });
          });
        }

        const geojsonVenueData = {
          'type': 'FeatureCollection',
          'features': featuresVenues
        };

        // map.addSource('venues', {
        //   'type': 'geojson',
        //   'data': geojsonVenueData
        // });

        // map.addLayer({
        //   'id': 'venues',
        //   'type': 'circle',
        //   'source': 'venues',
        //   'layout': {},
        //   'paint': {
        //     'circle-color': '#fff',
        //     'circle-radius': [
        //         'interpolate', // Use 'interpolate' to define zoom-dependent values
        //         ['linear'],    // Linear interpolation
        //         ['zoom'],      // Based on the zoom level
        //         5, 2,          
        //         10, 10,
        //         15, 15,
        //         20, 20
        //     ],
        //     'circle-opacity': 0.8 
        //   }
        // }); 

        const scene_venues = initialize3DLayer(geojsonVenueData, map, modelLocation, {
          layerId: '3d-model-venues',
          color: '#FAFAFA',        // Fuchsia capsule
          wireColor: '#FFFFFF',     // Black wireframe
          radius: 1,               // Capsule radius
          length: 3,               // Capsule length
          capSegments: 2,          // Number of segments in the caps
          radialSegments: 6        // Number of radial segments
        });

        scenes.push(scene_venues)
      }
   
      if(stations) {
        const features = stations.map(d => JSON.parse(d.coverage)).reduce((acc, fc) => acc.concat(fc.features), [])
        const pointFeatures = features.filter(feature => feature.geometry.type === 'Point');
        const polygonFeatures = features.filter(feature => feature.geometry.type === 'Polygon');

        pointFeatures.forEach((feature,i) => {
          feature["properties"] = {...stations[i]}
        })

        const pointGeoJSON = {
          "type": "FeatureCollection",
          "features": pointFeatures
        };

        const polygonGeoJSON = {
          "type": "FeatureCollection",
          "features": polygonFeatures
        };

        map.addSource('stations-polygon', {
          'type': 'geojson',
          'data': polygonGeoJSON
        });

        map.addLayer({
          'id': 'stations-polygon-outline',
          'type': 'line',
          'source': 'stations-polygon',
          'paint': {
              'line-color': 'fuchsia', // Stroke color
              'line-width': [
                  'interpolate', // Use 'interpolate' to define zoom-dependent values
                  ['linear'],    // Linear interpolation
                  ['zoom'],      // Based on the zoom level
                  5, 0.5,          // At zoom level 5, line-width is 1px
                  10, 1,         // At zoom level 10, line-width is 2px
                  15, 2,         // At zoom level 15, line-width is 4px
                  20, 5          // At zoom level 20, line-width is 8px
              ]
          }
        });

        const scene_stations = initialize3DLayer(pointGeoJSON, map, modelLocation, {
          layerId: '3d-model-station',
          color: '#FD3F92',        // Fuchsia capsule
          wireColor: '#B53389',     // Black wireframe
          radius: 1,               // Capsule radius
          length: 5,               // Capsule length
          capSegments: 2,          // Number of segments in the caps
          radialSegments: 6        // Number of radial segments
        });

        scenes.push(scene_stations)

        // Animate the boundary pulse
        let pulse = 0;

        function animatePulse(timestamp) {
          // Oscillate between 0.5 and 1.5 to simulate expansion and contraction
          pulse = Math.sin(timestamp / 500) * 0.1 + 1;

          // Apply a clamped opacity that oscillates between 0.4 and 1
          const opacity = Math.min(1, Math.max(0.4, Math.abs(Math.sin(timestamp / 1000))));

          // Update the line width and opacity to create a pulse effect
          map.setPaintProperty('stations-polygon-outline', 'line-width', pulse); // Line width pulsates
          map.setPaintProperty('stations-polygon-outline', 'line-opacity', opacity); // Line opacity pulsates

          // Repeat the animation
          requestAnimationFrame(animatePulse);
        }

        // Start the pulse animation
        requestAnimationFrame(animatePulse);
      }

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      map.getCanvas().addEventListener('click', (event) => {
        // Normalize mouse coordinates for raycastingx
        const rect = map.getCanvas().getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Set up raycaster
        raycaster.setFromCamera(mouse, camera);

        const capsules = scenes.flatMap(scene => scene.children)
          .flatMap(child => child.children)
          .filter(object => object.isMesh); // Only include mesh objects
        
        // Find intersections with 3D objects (your capsules or markers)
        const intersects = raycaster.intersectObjects(capsules, true);
        console.log(capsules, intersects)
        if (intersects.length > 0) {
          const intersectedObject = intersects[0].object;

          // Extract 3D position of the intersected object (x, y, z)
          const objectPosition = intersectedObject.position;

          // Convert from world coordinates back to Mercator coordinates
          const mercatorCoordinate = MercatorCoordinate(objectPosition.x, objectPosition.y, objectPosition.z);

          // Convert Mercator coordinates to geographic coordinates (lng/lat)
          const geographicPosition = mercatorCoordinate.toLngLat();
          const markerLng = geographicPosition.lng;
          const markerLat = geographicPosition.lat;

          // Find the matching feature in pointGeoJSON based on coordinates
          const matchingFeature = pointGeoJSON.features.find(feature => {
            const [featureLng, featureLat] = feature.geometry.coordinates;
            return Math.abs(featureLng - markerLng) < 0.0001 && Math.abs(featureLat - markerLat) < 0.0001;
          });
          console.log('matchingFeature', matchingFeature)

          // If a matching feature is found, extract its properties
          if (matchingFeature) {
            const properties = matchingFeature.properties;

            // Show popup with feature properties
            const popup = new Popup()
              .setLngLat([markerLng, markerLat])
              .setHTML(`
                  <div class="p-4 bg-white rounded-lg shadow-lg w-64">
                    <img src=${properties.image_url_small} alt="Venue Image" class="w-full h-32 object-cover rounded-md mb-2">
                    <h3 class="text-white text-lg font-semibold">${properties.name}</h3>
                    <p class="text-gray-200 text-sm mt-3 mb-1">${properties.address}</p>
                    <span class="px-3 py-1 rounded-custom text-white text-center text-xs ${properties.color}">
                      ${properties.category}
                    </span>
                  </div>
              `)
              .addTo(map);
          }
        }
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