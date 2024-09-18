import { useEffect, useRef, useState } from "react";

const MapComponent = () => {
  const mapRef = useRef(null); // Reference to the map DOM element
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  const locations = [
    { lat: 55.6761, lng: 12.5683 }, // Copenhagen
    { lat: 55.7037, lng: 12.4854 }, // Lyngby
    { lat: 55.6425, lng: 12.4852 }, // Hvidovre
  ];

  useEffect(() => {
    // Initialize the map when the component mounts
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: 55.6761, lng: 12.5683 }, // Default to Copenhagen
      zoom: 12,
    });
    setMap(mapInstance);

    // Add markers to the map
    const markerInstances = locations.map((location, index) => {
      return new window.google.maps.Marker({
        position: location,
        map: mapInstance,
        title: `Location ${index + 1}`,
      });
    });
    setMarkers(markerInstances);
  }, []);

  // Function to highlight a marker when a radio button is clicked
  const highlightMarker = (index) => {
    markers.forEach((marker) => {
      marker.setIcon(null); // Reset all icons
    });
    markers[index].setIcon("http://maps.google.com/mapfiles/ms/icons/green-dot.png");
    map.setCenter(markers[index].getPosition()); // Center the map on the selected marker
  };

  return (
    <div>
      <h3>Select a Location:</h3>
      <div>
        <label>
          <input type="radio" name="location" value="location1" onClick={() => highlightMarker(0)} /> Location 1
        </label>
        <br />
        <label>
          <input type="radio" name="location" value="location2" onClick={() => highlightMarker(1)} /> Location 2
        </label>
        <br />
        <label>
          <input type="radio" name="location" value="location3" onClick={() => highlightMarker(2)} /> Location 3
        </label>
        <br />
      </div>

      {/* The map container */}
      <div
        id="map"
        ref={mapRef}
        style={{
          height: "400px",
          width: "100%",
        }}
      ></div>
    </div>
  );
};

export default MapComponent;