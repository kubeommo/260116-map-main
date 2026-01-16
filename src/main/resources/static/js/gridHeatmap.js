console.log('🟦 gridHeatmap.js (성남시 데이터 기준 격자 히트맵)');

/* =========================
   정책 가중치
========================= */
const WEIGHT = {
    cctv: 0.7,
    police: 0.9,
    street: 0.4,
    population: 1.0
};

/* =========================
   히트맵 소스 / 레이어
========================= */
const gridHeatSource = new ol.source.Vector();

const gridHeatLayer = new ol.layer.Heatmap({
    source: gridHeatSource,
    opacity: 0.65,
    zIndex: 40,
    visible: false, // 👈 초기에는 숨김
    weight: feature => {
        const risk = feature.get('risk') || 0;
        const zoom = map.getView().getZoom();

        // 줌아웃 → 위험 강조 / 줌인 → 완화
        const scale =
            zoom <= 12 ? 1.3 :
                zoom <= 14 ? 1.9 :
                    2.6;

        return Math.max(0.05, Math.min(risk / scale, 1));
    },
    gradient: [
        '#0000ff',
        '#00ffff',
        '#00ff00',
        '#ffff00',
        '#ff0000'
    ]
});

// ⚠ 초기에는 지도에 추가하지 않음
// map.addLayer(gridHeatLayer);

/* =========================
   zoom → 격자 크기
========================= */
function gridSizeByZoom(z) {
    if (z <= 12) return 800;
    if (z <= 13) return 500;
    if (z <= 14) return 300;
    return 200;
}

/* =========================
   성남시 필터 (공통 BBOX 사용)
========================= */
function isInSeongnam3857(coord) {
    const [lon, lat] = ol.proj.toLonLat(coord);
    return (
        lon >= SEONGNAM_BBOX.minLon &&
        lon <= SEONGNAM_BBOX.maxLon &&
        lat >= SEONGNAM_BBOX.minLat &&
        lat <= SEONGNAM_BBOX.maxLat
    );
}

/* =========================
   격자 키
========================= */
function gridKey(coord, size) {
    return (
        Math.floor(coord[0] / size) + '_' +
        Math.floor(coord[1] / size)
    );
}

/* =========================
   격자 히트맵 생성 (성남시만)
========================= */
function buildGridHeatmap() {
    gridHeatSource.clear();

    const zoom = Math.round(map.getView().getZoom());
    const size = gridSizeByZoom(zoom);
    const gridMap = new Map();

    /* -------------------------
       1️⃣ CCTV / 경찰 / 가로등
    ------------------------- */
    function addFacility(source, type) {
        source.getFeatures().forEach(f => {
            const coord = f.getGeometry().getCoordinates();

            if (!isInSeongnam3857(coord)) return;

            const key = gridKey(coord, size);

            if (!gridMap.has(key)) {
                gridMap.set(key, {
                    coord,
                    cctv: 0,
                    police: 0,
                    street: 0,
                    population: 0
                });
            }

            gridMap.get(key)[type]++;
        });
    }

    addFacility(cctvSource, 'cctv');
    addFacility(policeSource, 'police');
    addFacility(streetSource, 'street');

    /* -------------------------
       2️⃣ 인구 (성남시만)
    ------------------------- */
    populationSource.getFeatures().forEach(f => {
        const coord = f.getGeometry().getCoordinates();

        if (!isInSeongnam3857(coord)) return;

        const key = gridKey(coord, size);
        const pop = f.get('population') || 0;

        if (!gridMap.has(key)) {
            gridMap.set(key, {
                coord,
                cctv: 0,
                police: 0,
                street: 0,
                population: 0
            });
        }

        gridMap.get(key).population += pop;
    });

    if (gridMap.size === 0) {
        console.warn('⚠ 성남시 데이터 없음');
        return;
    }

    const MAX_POP = Math.max(
        ...Array.from(gridMap.values()).map(g => g.population)
    );

    /* -------------------------
       3️⃣ 위험도 계산 → 히트맵
    ------------------------- */
    gridMap.forEach(g => {
        let risk = 2;

        if (MAX_POP > 0) {
            risk += (g.population / MAX_POP) * WEIGHT.population;
        }

        risk -= g.cctv   * WEIGHT.cctv;
        risk -= g.police * WEIGHT.police;
        risk -= g.street * WEIGHT.street;

        risk = Math.max(0.2, risk);

        gridHeatSource.addFeature(
            new ol.Feature({
                geometry: new ol.geom.Point(g.coord),
                risk
            })
        );
    });

    console.log(
        '🔥 성남시 격자 히트맵 생성:',
        gridHeatSource.getFeatures().length
    );
}

/* =========================
   반경 / 블러 업데이트
========================= */
function updateHeatmapVisual() {
    const zoom = map.getView().getZoom();

    const radius = Math.max(40, (zoom - 9) * 9);
    const blur   = radius * 1.6;

    gridHeatLayer.setRadius(radius);
    gridHeatLayer.setBlur(blur);

    buildGridHeatmap();
}

/* =========================
   이벤트 (렉 방지)
========================= */
map.on('moveend', () => {
    if (gridHeatLayer.getVisible()) updateHeatmapVisual();
});

/* =========================
   UI 토글
========================= */
const gridLayerCheckbox = document.getElementById('grid-heatmap-layer');

gridLayerCheckbox.addEventListener('change', e => {
    if (e.target.checked) {
        // 지도에 레이어가 없으면 추가
        if (!map.getLayers().getArray().includes(gridHeatLayer)) {
            map.addLayer(gridHeatLayer);
        }
        gridHeatLayer.setVisible(true);
        updateHeatmapVisual();
    } else {
        gridHeatLayer.setVisible(false);
        // map.removeLayer(gridHeatLayer); // 완전히 제거하고 싶으면 사용
    }
});
