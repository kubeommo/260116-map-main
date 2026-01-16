console.log('💡 streetlightLayer.js (DB)');

const streetSource = new ol.source.Vector();

const streetLayer = new ol.layer.Vector({
    source: streetSource,
    visible: false,
    zIndex: 50,
    style: new ol.style.Style({
        image: new ol.style.Circle({
            radius: 4,
            fill: new ol.style.Fill({ color: '#00ff6a' }),
            stroke: new ol.style.Stroke({
                color: '#ffffff',
                width: 1
            })
        })
    })
});

map.addLayer(streetLayer);

/* 🔥 DB에서 가로등 데이터 로드 */
fetch('/api/streetlight')
    .then(res => res.json())
    .then(list => {
        list.forEach(d => {
            streetSource.addFeature(new ol.Feature({
                geometry: new ol.geom.Point(
                    ol.proj.fromLonLat([d.lon, d.lat])
                ),
                weight: d.weight
            }));
        });
        console.log('💡 streetlight count:', list.length);
    });

document.getElementById('streetlight-layer')
    .addEventListener('change', e => {
        streetLayer.setVisible(e.target.checked);
    });
