console.log('🚓 policeLayer.js (DB)');

const policeSource = new ol.source.Vector();

const policeLayer = new ol.layer.Vector({
    source: policeSource,
    visible: false,
    zIndex: 60,
    style: new ol.style.Style({
        image: new ol.style.Circle({
            radius: 4,
            fill: new ol.style.Fill({ color: 'blue' })
        })
    })
});

map.addLayer(policeLayer);

/* 🔥 DB에서 경찰 데이터 로드 */
fetch('/api/police')
    .then(res => res.json())
    .then(list => {
        list.forEach(d => {
            policeSource.addFeature(new ol.Feature({
                geometry: new ol.geom.Point(
                    ol.proj.fromLonLat([d.lon, d.lat])
                ),
                weight: d.weight
            }));
        });
        console.log('🚓 police count:', list.length);
    });

document.getElementById('police-layer')
    .addEventListener('change', e => {
        policeLayer.setVisible(e.target.checked);
    });
