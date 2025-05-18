window.addEventListener("load", function () {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 20, lng: 0 },
    zoom: 2,
    gestureHandling: 'greedy',
  });

  const worldHistoryEvents = [
    {
      year: 1914,
      title: "サラエボ事件",
      description: "第一次世界大戦の引き金となった事件。オーストリア皇太子が暗殺された。",
      lat: 43.8563,
      lng: 18.4131,
      wiki: "https://ja.wikipedia.org/wiki/サラエボ事件"
    },
    {
      year: 1789,
      title: "フランス革命",
      description: "バスティーユ牢獄襲撃を皮切りに市民革命が勃発。",
      lat: 48.8566,
      lng: 2.3522,
      wiki: "https://ja.wikipedia.org/wiki/フランス革命"
    }
  ];

  let currentIndex = 0;
  let currentMarker = null;
  let currentInfoWindow = null;

  function showNextEvent() {
    const event = worldHistoryEvents[currentIndex];

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

    currentIndex = (currentIndex + 1) % worldHistoryEvents.length;
  }

  showNextEvent();
  setInterval(showNextEvent, 20000); // 20秒ごとに切り替え
});