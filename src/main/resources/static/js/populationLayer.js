/*************************************************
 * populationLayer.js
 * 성남시 동 기준 인구 분포 (41개 동 고정)
 *************************************************/

console.log('👥 populationLayer.js 로딩');

/* =========================
   1. 고정 정보 패널
========================= */
let infoPanel = document.getElementById('population-info');

if (!infoPanel) {
    infoPanel = document.createElement('div');
    infoPanel.id = 'population-info';
    infoPanel.style.cssText = `
        position: absolute;
        left: 10px;
        bottom: 10px;
        width: 260px;
        background: rgba(255,255,255,0.95);
        padding: 10px;
        border-radius: 8px;
        border: 1px solid #333;
        font-size: 13px;
        z-index: 999;
    `;
    infoPanel.innerHTML = `<strong>인구 정보</strong><br/>지도를 클릭하세요`;
    document.body.appendChild(infoPanel);
}

/* =========================
   2. 성남시 41개 동 중심 좌표 (전체)
========================= */
const dongCenterCoords = {
    // 수정구
    '신흥1동': [127.1487, 37.4404],
    '신흥2동': [127.1519, 37.4436],
    '신흥3동': [127.1552, 37.4387],
    '태평1동': [127.1356, 37.4397],
    '태평2동': [127.1379, 37.4418],
    '태평3동': [127.1398, 37.4433],
    '태평4동': [127.1417, 37.4452],
    '수진1동': [127.1298, 37.4378],
    '수진2동': [127.1326, 37.4359],
    '단대동': [127.1582, 37.4541],
    '산성동': [127.1522, 37.4577],
    '양지동': [127.1614, 37.4391],
    '복정동': [127.1263, 37.4595],
    '위례동': [127.1457, 37.4779],
    '신촌동': [127.1182, 37.4583],
    '고등동': [127.1036, 37.4306],
    '시흥동': [127.1031, 37.4189],

    // 중원구
    '성남동': [127.1443, 37.4336],
    '중앙동': [127.1417, 37.4357],
    '금광1동': [127.1682, 37.4447],
    '금광2동': [127.1661, 37.4476],
    '은행1동': [127.1588, 37.4498],
    '은행2동': [127.1609, 37.4521],
    '상대원1동': [127.1702, 37.4371],
    '상대원2동': [127.1728, 37.4338],
    '상대원3동': [127.1751, 37.4302],
    '하대원동': [127.1644, 37.4299],
    '도촌동': [127.1572, 37.4146],

    // 분당구
    '분당동': [127.1216, 37.3682],
    '수내1동': [127.1211, 37.3784],
    '수내2동': [127.1254, 37.3811],
    '수내3동': [127.1282, 37.3835],
    '정자동': [127.1089, 37.3665],
    '서현1동': [127.1326, 37.3849],
    '서현2동': [127.1362, 37.3871],
    '이매1동': [127.1291, 37.3962],
    '이매2동': [127.1324, 37.3991],
    '야탑1동': [127.1296, 37.4112],
    '야탑2동': [127.1328, 37.4145],
    '야탑3동': [127.1362, 37.4171],
    '판교동': [127.0936, 37.3892],
    '삼평동': [127.1039, 37.4021],
    '백현동': [127.1107, 37.3946],
    '운중동': [127.0824, 37.3913]
};

/* =========================
   3. Source & Heatmap
========================= */
const populationSource = new ol.source.Vector();

const populationHeatLayer = new ol.layer.Heatmap({
    source: populationSource,
    radius: 35,
    blur: 25,
    weight: f => f.get('weight'),
    visible: false
});

map.addLayer(populationHeatLayer);

/* =========================
   4. CSV 로드 + 41개 검증
========================= */
async function buildPopulationHeatmap() {
    populationSource.clear();

    const res = await fetch('/data/population.csv');
    const text = await res.text();
    const rows = text.split('\n').slice(1);

    const usedDongs = [];
    const pops = [];

    rows.forEach(row => {
        if (!row.trim()) return;

        const cols = row.split(',');
        const dong = cols[1]?.trim();
        const population = Number(cols[2]);

        const coord = dongCenterCoords[dong];
        if (!coord || !population) return;

        usedDongs.push(dong);
        pops.push(population);

        populationSource.addFeature(new ol.Feature({
            geometry: new ol.geom.Point(
                ol.proj.fromLonLat(coord)
            ),
            dong,
            population
        }));
    });

    console.log('👥 반영된 동 개수:', usedDongs.length);
    console.log('👥 반영된 동 목록:', usedDongs);

    const maxPop = Math.max(...pops);

    populationSource.getFeatures().forEach(f => {
        const weight = Math.sqrt(f.get('population') / maxPop);
        f.set('weight', weight);
    });

    console.log('👥 인구 히트맵 생성 완료');
}

/* =========================
   5. 클릭 → 가장 가까운 동 표시
========================= */
map.on('singleclick', evt => {
    let closest = null;
    let minDist = Infinity;

    populationSource.getFeatures().forEach(f => {
        const dist = ol.sphere.getDistance(
            ol.proj.toLonLat(evt.coordinate),
            ol.proj.toLonLat(f.getGeometry().getCoordinates())
        );
        if (dist < minDist) {
            minDist = dist;
            closest = f;
        }
    });

    if (closest && minDist < 800) {
        infoPanel.innerHTML = `
            <strong>${closest.get('dong')}</strong><br/>
            👥 인구수: ${closest.get('population').toLocaleString()}명
        `;
    }
});

/* =========================
   6. UI 토글
========================= */
const popToggle = document.getElementById('population-layer');
if (popToggle) {
    popToggle.addEventListener('change', e => {
        const on = e.target.checked;
        populationHeatLayer.setVisible(on);
        if (on) buildPopulationHeatmap();
        else infoPanel.innerHTML = '<strong>인구 정보</strong>';
    });
}
