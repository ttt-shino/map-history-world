window.addEventListener("load", function () {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 20, lng: 0 },
    zoom: 5,
    gestureHandling: 'greedy',
  });

  let enrichedEvents = [];
  let enrichedEventsFiltered = [];
  let currentIndex = 0;
  let currentMarker = null;
  let currentInfoWindow = null;

  const urlParams = new URLSearchParams(window.location.search);
  const yearFilter = urlParams.get('year') || 'all';
  const continentFilter = urlParams.get('continent') || 'all';
  const regionFilter = urlParams.get('region') || 'all';
  const categoryFilter = urlParams.get('category') || 'all';
  const shuffleParam = urlParams.get('shuffle') === 'true';

  fetch("history.json")
    .then(res => res.json())
    .then(data => {
      enrichedEvents = data;
      if (shuffleParam) {
        enrichedEvents = enrichedEvents.sort(() => Math.random() - 0.5);
      }
      applyFilters();

      if (enrichedEventsFiltered.length > 0) {
        displayEventAtCurrentIndex();
        setInterval(() => {
          currentIndex = (currentIndex + 1) % enrichedEventsFiltered.length;
          displayEventAtCurrentIndex();
        }, 20000);
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

        const backLink = document.createElement("a");
        backLink.textContent = "トップページに戻る";
        backLink.href = "index.html";
        backLink.style.display = "block";
        backLink.style.textAlign = "center";
        backLink.style.marginTop = "16px";
        backLink.style.fontSize = "14px";
        backLink.style.color = "#555";
        backLink.style.textDecoration = "underline";
        message.appendChild(backLink);

        document.body.appendChild(message);
      }
    });

  // フィルターを適用する関数
  function applyFilters() {
    enrichedEventsFiltered = enrichedEvents.filter(event => {
      const yearMatch =
        yearFilter === "all" ||
        (yearFilter === "prehistoric" && event.year <= -3000) ||
        (yearFilter === "ancient" && event.year > -3000 && event.year <= 500) ||
        (yearFilter === "medieval" && event.year > 500 && event.year <= 1500) ||
        (yearFilter === "early-modern" && event.year > 1500 && event.year <= 1800) ||
        (yearFilter === "modern" && event.year > 1800 && event.year < 1914) ||
        (yearFilter === "contemporary" && event.year >= 1914);

      const continentMatch = continentFilter === "all" || event.continent === continentFilter;
      const regionMatch = regionFilter === "all" || event.region === regionFilter;
      const categoryMatch = categoryFilter === "all" || event.category === categoryFilter;

      return yearMatch && continentMatch && regionMatch && categoryMatch;
    });

    console.log("📦 Filtered events:", enrichedEventsFiltered);
    currentIndex = 0;
  }

  function displayEventAtCurrentIndex() {
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
    <p style="margin: 10px 0 6px 0;">
      <a href="${event.wiki}" target="_blank" style="color: #2196F3; text-decoration: underline;">Wikipediaへ</a>
    </p>
    <p style="margin: 16px 0 0; text-align: center;">
      <a href="#" onclick="window.showPrevEvent()" style="margin: 0 8px; color: #2196F3; text-decoration: underline;">＜戻る</a>
      <a href="index.html" style="margin: 0 8px; color: #2196F3; text-decoration: underline;">トップページ</a>
      <a href="#" onclick="window.showNextEvent()" style="margin: 0 8px; color: #2196F3; text-decoration: underline;">進む＞</a>
    </p>
  </div>
`
    });

    currentInfoWindow.open(map, currentMarker);
    map.panTo({ lat: event.lat, lng: event.lng });
  }

  window.showPrevEvent = function () {
    currentIndex = (currentIndex - 1 + enrichedEventsFiltered.length) % enrichedEventsFiltered.length;
    displayEventAtCurrentIndex();
  };

  window.showNextEvent = function () {
    currentIndex = (currentIndex + 1) % enrichedEventsFiltered.length;
    displayEventAtCurrentIndex();
  };
});