window.addEventListener("load", function () {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 20, lng: 0 },
    zoom: 2,
    gestureHandling: 'greedy',
  });

  let enrichedEvents = [];
  let currentIndex = 0;
  let currentMarker = null;
  let currentInfoWindow = null;

  Promise.all([
    fetch("data/events.json").then(res => res.json()),
    fetch("data/locations.json").then(res => res.json())
  ]).then(([events, locations]) => {
    enrichedEvents = events.map(event => {
      const match = locations.find(loc => loc.name === event.location);
      return match ? { ...event, lat: match.lat, lng: match.lng } : null;
    }).filter(Boolean);

    if (enrichedEvents.length > 0) {
      showNextEvent();
      setInterval(showNextEvent, 20000);
    }
  });

  function showNextEvent() {
    const event = enrichedEvents[currentIndex];
    if (!event) return;

    if (currentMarker) currentMarker.setMap(null);
    if (currentInfoWindow) currentInfoWindow.close();

    currentMarker = new google.maps.Marker({
      position: { lat: event.lat, lng: event.lng },
      map: map,
      title: `${event.year}年 ${event.title}`
    });

    currentInfoWindow = new google.maps.InfoWindow({
      content: `
        <div style="max-width: 300px; padding: 8px 10px; font-size: 15px; line-height: 1.5;">
          <h3 style="font-size: 15px; margin: 0 0 6px 0;">${event.year}年 ${event.title}</h3>
          <p style="margin: 0 0 6px 0;">${event.description}</p>
          <p style="margin: 0;"><a href="${event.wiki}" target="_blank" style="color: #2196F3; text-decoration: underline;">Wikipediaへ</a></p>
        </div>
      `
    });

    currentInfoWindow.open(map, currentMarker);
    map.panTo({ lat: event.lat, lng: event.lng });

    currentIndex = (currentIndex + 1) % enrichedEvents.length;
  }
});