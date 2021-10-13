export const mapbox = (locations) => {
  mapboxgl.accessToken = "pk.eyJ1IjoibG9ybWlkYSIsImEiOiJja3RuOWJrbGMwMG84MnJsNDdobzAwdjV3In0.VfELVZB3ATNWtTtBO4_04w";
  const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/lormida/cktnasnjl044l17n16iieuaq2", // style URL
    center: [-74.5, 40], // starting position [lng, lat]
    zoom: 6 // starting zoom
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create marker
    const el = document.createElement("div");
    el.className = "marker";

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: "bottom"
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 50
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p style="color:black; font-size:0.7rem; padding:2px">Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 300,
      bottom: 150,
      left: 150,
      right: 150
    }
  });
};

