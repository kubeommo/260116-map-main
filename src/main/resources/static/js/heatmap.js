/*************************************************
 * heatmap.js
 * 성남시 격자 기반 위험도 히트맵 (weight 0~1 기준)
 * - 시설 있는 격자 안전 (파랑~초록~노랑)
 * - 시설 없는 격자 최대 위험 (빨강)
 * - 데이터 외곽 기준으로 바깥쪽 격자 제거
 * - 성남시 외곽 제외
 * - 자연스럽게 연결
 * - 줌/이동/데이터 로딩 완전 연동
 *************************************************/

console.log('🔴 heatmap.js 로딩');

// =========================
// 설정
// =========================
const MIN_RENDER_WEIGHT = 0.05;

const FACILITY_WEIGHT = {
    cctv: 0.18,
    police: 0.30,
    street: 0.12
};

// =========================
// 히트맵 레이어
// =========================
const heatSource = new ol.source.Vector();

const heatLayer = new ol.layer.Heatmap({
    source: heatSource,
    radius: 40,
    blur: 50,
    weight: f => f.get('weight'),
    gradient: ['#0000ff','#00ff00','#ffff00','#ff0000'], // 파랑→초록→노랑→빨강
    visible: false,
    opacity: 0.6,
    zIndex: 5
});

map.addLayer(heatLayer);

// =========================
// 성남시 BBOX
// =========================
const SEONGNAM_BBOX = {
    minLon: 127.05,
    maxLon: 127.20,
    minLat: 37.35,
    maxLat: 37.46
};

function isInSeongnam3857(coord) {
    const [lon, lat] = ol.proj.toLonLat(coord);
    return (
        lon >= SEONGNAM_BBOX.minLon &&
        lon <= SEONGNAM_BBOX.maxLon &&
        lat >= SEONGNAM_BBOX.minLat &&
        lat <= SEONGNAM_BBOX.maxLat
    );
}

// =========================
// 줌 → 격자 크기
// =========================
function getGridSizeByZoom(zoom) {
    if (zoom >= 16) return 150;
    if (zoom >= 15) return 220;
    if (zoom >= 14) return 300;
    if (zoom >= 13) return 400;
    return 600;
}

// =========================
// 히트맵 재생성
// =========================
function rebuildHeatmapByView() {
    if (!heatLayer.getVisible()) return;

    heatSource.clear();

    const zoom = map.getView().getZoom();
    const GRID_SIZE = getGridSizeByZoom(zoom);

    const gridScore = new Map();

    function accumulate(source, weight) {
        if (!source) return;
        source.getFeatures().forEach(f => {
            const coord = f.getGeometry().getCoordinates();
            if (!isInSeongnam3857(coord)) return;

            const gx = Math.floor(coord[0] / GRID_SIZE) * GRID_SIZE;
            const gy = Math.floor(coord[1] / GRID_SIZE) * GRID_SIZE;
            const key = `${gx},${gy}`;

            gridScore.set(key, (gridScore.get(key) || 0) + weight);
        });
    }

    accumulate(cctvSource, FACILITY_WEIGHT.cctv);
    accumulate(policeSource, FACILITY_WEIGHT.police);
    accumulate(streetSource, FACILITY_WEIGHT.street);

    if (gridScore.size === 0) return;

    const cells = [...gridScore.keys()].map(k => k.split(',').map(Number));
    let minX = Math.min(...cells.map(c => c[0]));
    let maxX = Math.max(...cells.map(c => c[0]));
    let minY = Math.min(...cells.map(c => c[1]));
    let maxY = Math.max(...cells.map(c => c[1]));

    // =========================
    // 격자 생성: 데이터 바깥쪽 격자 제거
    // =========================
    for (let x = minX; x <= maxX; x += GRID_SIZE) {
        for (let y = minY; y <= maxY; y += GRID_SIZE) {
            const center = [x + GRID_SIZE / 2, y + GRID_SIZE / 2];
            if (!isInSeongnam3857(center)) continue;

            const key = `${x},${y}`;
            const rawWeight = gridScore.get(key) || 0;

            // 🔹 weight 0~1 기준
            // 시설 있는 격자: 0.05~0.7
            // 시설 없는 격자: 1 → 최대 위험 빨강
            const weight = rawWeight > 0
                ? Math.max(MIN_RENDER_WEIGHT, Math.min(0.7, 0.7 - rawWeight))
                : 1;

            heatSource.addFeature(new ol.Feature({
                geometry: new ol.geom.Point(center),
                weight
            }));
        }
    }

    // 🔹 자연스럽게 연결
    heatLayer.setRadius(GRID_SIZE / 9);
    heatLayer.setBlur(GRID_SIZE / 6);
    heatLayer.changed();

    console.log('🔥 성남시 격자 히트맵 재생성 완료');
}

// =========================
// 데이터 로딩 연동
// =========================
[cctvSource, policeSource, streetSource].forEach(src => {
    if (!src) return;
    src.on('addfeature', () => {
        if (heatLayer.getVisible()) rebuildHeatmapByView();
    });
});

// =========================
// 이동 / 줌
// =========================
map.on('moveend', rebuildHeatmapByView);

// =========================
// UI
// =========================
document.getElementById('heatmap-layer')
    ?.addEventListener('change', e => {
        heatLayer.setVisible(e.target.checked);
        if (e.target.checked) rebuildHeatmapByView();
    });

// =========================
// 버튼 클릭 시 성남시 히트맵 바로 생성
// =========================
document.getElementById('show-heatmap-btn')
    ?.addEventListener('click', () => {
        heatLayer.setVisible(true);
        rebuildHeatmapByView();
    });
