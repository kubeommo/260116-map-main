/*************************************************
 * heatmap.js (성남시 안전도 히트맵)
 *************************************************/

console.log('🔥 성남시 안전도 히트맵 로딩');

const heatSource = new ol.source.Vector();

const heatLayer = new ol.layer.Heatmap({
    source: heatSource,
    radius: 32,
    blur: 45,
    visible: false,
    weight: f => f.get('weight'),
    gradient: [
        'rgba(255, 0, 0, 1.0)',   // 위험
        'rgba(255, 255, 0, 0.9)',
        'rgba(0, 255, 0, 0.85)',
        'rgba(0, 0, 255, 0.9)'   // 안전
    ]
});

map.addLayer(heatLayer);

/* =========================
   성남시 BBOX (위경도)
========================= */
const SEONGNAM_BBOX = {
    minLon: 127.05,
    maxLon: 127.20,
    minLat: 37.35,
    maxLat: 37.46
};

function isInSeongnam(lon, lat) {
    return (
        lon >= SEONGNAM_BBOX.minLon &&
        lon <= SEONGNAM_BBOX.maxLon &&
        lat >= SEONGNAM_BBOX.minLat &&
        lat <= SEONGNAM_BBOX.maxLat
    );
}

/* =========================
   GRID 기반 안전도 계산
========================= */
function buildSafetyHeatmap() {
    heatSource.clear();

    const GRID_SIZE = 0.0015; // 약 150m
    const gridMap = new Map();

    function addToGrid(source, type) {
        if (!source) return;

        source.getFeatures().forEach(f => {
            const [lon, lat] = ol.proj.toLonLat(
                f.getGeometry().getCoordinates()
            );

            // 🔥 성남시 아닌 데이터 제거
            if (!isInSeongnam(lon, lat)) return;

            const gx = Math.floor(lon / GRID_SIZE);
            const gy = Math.floor(lat / GRID_SIZE);
            const key = `${gx}_${gy}`;

            if (!gridMap.has(key)) {
                gridMap.set(key, {
                    lon,
                    lat,
                    cctv: 0,
                    police: 0,
                    street: 0
                });
            }

            gridMap.get(key)[type]++;
        });
    }

    // ▶ 성남시 데이터만 누적
    addToGrid(cctvSource, 'cctv');
    addToGrid(policeSource, 'police');
    addToGrid(streetSource, 'street');

    // ▶ 히트맵 포인트 생성
    gridMap.forEach(g => {
        const score =
            g.cctv * 0.6 +
            g.police * 0.9 +
            g.street * 0.4;

        if (score <= 0) return;

        // 🔵 안전도 → weight
        const weight = Math.min(score / 3.0, 1.0);

        heatSource.addFeature(
            new ol.Feature({
                geometry: new ol.geom.Point(
                    ol.proj.fromLonLat([g.lon, g.lat])
                ),
                weight
            })
        );
    });

    console.log('🔥 성남시 히트맵 포인트 수:', heatSource.getFeatures().length);
}

/* =========================
   UI 토글
========================= */
document
    .getElementById('heatmap-layer')
    .addEventListener('change', e => {
        heatLayer.setVisible(e.target.checked);
        if (e.target.checked) buildSafetyHeatmap();
    });
