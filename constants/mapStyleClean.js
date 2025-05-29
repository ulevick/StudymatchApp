export default [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.school',      stylers: [{ visibility: 'on' }] },
  { featureType: 'poi.government',  stylers: [{ visibility: 'on' }] },
  { featureType: 'poi.school',     elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.government', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.text', stylers: [{ visibility: 'on' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
];
