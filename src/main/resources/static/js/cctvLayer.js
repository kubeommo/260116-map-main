console.log('📷 CCTV 레이어 로딩');

const cctvSource = new ol.source.Vector();

const cctvLayer = new ol.layer.Vector({
    source: cctvSource,
    visible: false,
    style: new ol.style.Style({
        image: new ol.style.Circle({
            radius: 4,
            fill: new ol.style.Fill({ color: 'red' }),
            stroke: new ol.style.Stroke({ color: '#fff', width: 1 })
        })
    })
});

map.addLayer(cctvLayer);

fetch('/api/cctv')
    .then(res => res.json())
    .then(data => {
        data.forEach(d => {
            if (!d.lat || !d.lon) return;

            cctvSource.addFeature(
                new ol.Feature({
                    geometry: new ol.geom.Point(
                        ol.proj.fromLonLat([d.lon, d.lat])
                    ),
                    weight: d.weight ?? 0.7
                })
            );
        });
        console.log('📷 CCTV:', cctvSource.getFeatures().length);
    });

document.getElementById('cctv-layer')
    .addEventListener('change', e => {
        cctvLayer.setVisible(e.target.checked);
    });
