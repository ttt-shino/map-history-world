window.addEventListener("load", function () {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 20, lng: 0 },
    zoom: 2,
    gestureHandling: 'greedy',
  });

  let enrichedEvents = [];
  let enrichedEventsFiltered = [];
  let currentIndex = 0;
  let currentMarker = null;
  let currentInfoWindow = null;

  const urlParams = new URLSearchParams(window.location.search);
  const yearFilter = urlParams.get('year') || 'all';
  const countryFilter = urlParams.get('country') || 'all';
  const categoryFilter = urlParams.get('category') || 'all';

  Promise.all([
    fetch("data/events.json").then(res => res.json()),
    fetch("data/locations.json").then(res => res.json())
  ]).then(([events, locations]) => {
    enrichedEvents = events.map(event => {
      const match = locations.find(loc => loc.name === event.location);
      return match ? { ...event, lat: match.lat, lng: match.lng } : null;
    }).filter(Boolean);

    applyFilters();

    if (enrichedEventsFiltered.length > 0) {
      showNextEvent();
      setInterval(showNextEvent, 20000);
    } else {
      console.warn("⚠️ フィルター条件に一致するイベントがありませんでした。");
      const message = document.createElement("div");
      message.textContent = "表示できる出来事がありません。";
      message.style.position = "absolute";
      message.style.top = "50%";
      message.style.left = "50%";
      message.style.transform = "translate(-50%, -50%)";
      message.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
      message.style.padding = "20px";
      message.style.borderRadius = "8px";
      message.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
      message.style.fontSize = "18px";
      message.style.zIndex = "2";
      document.body.appendChild(message);
    }
  });

  // フィルターを適用する関数
  function applyFilters() {
    enrichedEventsFiltered = enrichedEvents.filter(event => {
      const yearMatch =
        yearFilter === "all" ||
        (yearFilter === "〜1500" && event.year <= 1500) ||
        (yearFilter === "1500〜1800" && event.year > 1500 && event.year <= 1800) ||
        (yearFilter === "1800〜1900" && event.year > 1800 && event.year <= 1900) ||
        (yearFilter === "1900〜" && event.year >= 1900);

      const countryMatch = countryFilter === "all" || event.country === countryFilter;
      const categoryMatch = categoryFilter === "all" || event.category === categoryFilter;

      return yearMatch && countryMatch && categoryMatch;
    });

    console.log("📦 Filtered events:", enrichedEventsFiltered);
    currentIndex = 0;
  }

  function showNextEvent() {
    if (!enrichedEventsFiltered.length) return;
    const event = enrichedEventsFiltered[currentIndex];
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

    currentIndex = (currentIndex + 1) % enrichedEventsFiltered.length;
  }
});