console.clear();
console.log("🗺️ map.js 로딩");

const VWORLD_KEY = 'CF0C7D65-44C0-31CD-A6FF-80C2E693894A';
const KAKAO_REST_KEY = '0049d54daf0cc279c1c4b7088b8d6d36';

/* =======================
   지도
======================= */
const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}/Base/{z}/{y}/{x}.png`
            })
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([127.1380, 37.4396]),
        zoom: 14
    })
});

/* =======================
   마커 레이어
======================= */
const markerSource = new ol.source.Vector();

const markerLayer = new ol.layer.Vector({
    source: markerSource,
    zIndex: 100,
    style: new ol.style.Style({
        image: new ol.style.Icon({
            src: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png',
            anchor: [0.5, 1],
            scale: 1
        })
    })
});

map.addLayer(markerLayer);

/* =======================
   주소 오버레이
======================= */
const overlayEl = document.createElement('div');
overlayEl.className = 'address-overlay';
overlayEl.style.display = 'none';

const overlay = new ol.Overlay({
    element: overlayEl,
    offset: [0, -30],
    positioning: 'bottom-center'
});
map.addOverlay(overlay);

/* =======================
   좌표 → 주소
======================= */
async function coordToAddress(lon, lat) {
    const r = await fetch(
        `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lon}&y=${lat}`,
        { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } }
    );
    const j = await r.json();
    const d = j.documents?.[0];
    return d?.road_address?.address_name ||
        d?.address?.address_name ||
        '주소 없음';
}

/* =======================
   마커 중복 체크
======================= */
function getMarkerAtPixel(pixel) {
    let hit = null;
    map.forEachFeatureAtPixel(pixel, f => hit = f);
    return hit;
}

/* =======================
   좌클릭
======================= */
map.on('singleclick', async e => {
    const hit = getMarkerAtPixel(e.pixel);

    if (hit) {
        overlayEl.innerText = hit.get('address');
        overlayEl.style.display = 'block';
        overlay.setPosition(hit.getGeometry().getCoordinates());
        return;
    }

    const [lon, lat] = ol.proj.toLonLat(e.coordinate);
    const address = await coordToAddress(lon, lat);

    const f = new ol.Feature({
        geometry: new ol.geom.Point(e.coordinate),
        address
    });

    markerSource.addFeature(f);
    overlayEl.innerText = address;
    overlayEl.style.display = 'block';
    overlay.setPosition(e.coordinate);
});

/* =======================
   우클릭 → 마커 삭제
======================= */
map.getViewport().addEventListener('contextmenu', e => {
    e.preventDefault();
    map.forEachFeatureAtPixel(map.getEventPixel(e), f => {
        markerSource.removeFeature(f);
        overlayEl.style.display = 'none';
    });
});

/* =======================
   검색 (주소 우선 → 키워드)
======================= */
document.getElementById('search-btn').addEventListener('click', async () => {
    const q = document.getElementById('address-input').value.trim();
    if (!q) return;

    /* 1️⃣ 주소 검색 (도로명 / 지번) */
    const aRes = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(q)}`,
        { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } }
    );
    const aJson = await aRes.json();

    if (aJson.documents?.length) {
        const d = aJson.documents[0];
        moveAndMark(+d.x, +d.y,
            d.road_address?.address_name || d.address.address_name
        );
        return;
    }

    /* 2️⃣ 키워드 검색 (아파트명 등) */
    const kRes = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}`,
        { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } }
    );
    const kJson = await kRes.json();

    if (kJson.documents?.length) {
        const d = kJson.documents[0];
        moveAndMark(+d.x, +d.y, d.place_name);
        return;
    }

    alert('검색 결과 없음');
});

/* =======================
   이동 + 마커 생성
======================= */
async function moveAndMark(lon, lat, label) {
    const coord = ol.proj.fromLonLat([lon, lat]);

    map.getView().animate({
        center: coord,
        zoom: 16,
        duration: 600
    });

    const address = label || await coordToAddress(lon, lat);

    const f = new ol.Feature({
        geometry: new ol.geom.Point(coord),
        address
    });

    markerSource.addFeature(f);
    overlayEl.innerText = address;
    overlayEl.style.display = 'block';
    overlay.setPosition(coord);
}
