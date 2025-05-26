const originalSpotData = [
  {
    title: 'Spausdintuvas – VILNIUS TECH',
    category: 'printers',
    description: 'Vilniaus Gedimino technikos universiteto spausdintuvas',
    address: 'Saulėtekio al. 11, Vilnius',
    price: 'Mokamas (apie 0.05 €/lapas)',
    hours: 'Darbo dienomis 7:00–22:00',
    coords: { latitude: 54.722805, longitude: 25.338285 },
  },
  {
    title: 'Tylos / Poilsio zona – VU biblioteka',
    category: 'quiet',
    description: 'Erdvė poilsiui ir darbui tyloje VU bibliotekoje',
    address: 'Saulėtekio al. 9, Vilnius',
    price: 'Nemokama',
    hours: 'Darbo dienomis 8:00–20:00',
    coords: { latitude: 54.723, longitude: 25.335 },
  },
  {
    title: 'VU valgykla',
    category: 'food',
    description: 'Galima naudotis mikrobangėmis arba pigiai pavalgyti',
    address: 'Saulėtekio al. 10, Vilnius',
    price: 'Pietūs nuo 2.50€',
    hours: 'Darbo dienomis 11:00–15:00',
    coords: { latitude: 54.727521, longitude: 25.331539 },
  },
  {
    title: 'Spausdintuvas – VILNIUS TECH biblioteka',
    category: 'printers',
    description: 'Spausdinimo, kopijavimo ir skenavimo paslaugos VILNIUS TECH bibliotekoje',
    address: 'Saulėtekio al. 14, Vilnius',
    price: 'Mokamas (apie 0.05 €/lapas)',
    hours: 'Darbo dienomis 8:00–20:00',
    coords: { latitude: 54.726346, longitude: 25.330227 },
  },
  {
    title: 'Tylos zona – MKIC',
    category: 'quiet',
    description: 'Mokslinės komunikacijos ir informacijos centro skaitykla',
    address: 'Saulėtekio al. 5, Vilnius',
    price: 'Nemokama',
    hours: 'Visą parą',
    coords: { latitude: 54.722, longitude: 25.334 },
  },
  {
    title: 'Kavinė – MKIC',
    category: 'food',
    description: 'Kavinė su mikrobangų krosnele VU MKIC pastate',
    address: 'Saulėtekio al. 5, Vilnius',
    price: 'Pietūs nuo 3.90€',
    hours: 'I–VII 9:00–21:00',
    coords: { latitude: 54.7223, longitude: 25.3335 },
  },
  {
    title: 'VU Gyvybės mokslų centro valgykla',
    category: 'food',
    description: 'Valgykla su dienos pietų pasiūlymais',
    address: 'Saulėtekio al. 7, Vilnius',
    price: 'Kompleksas 3.90€',
    hours: 'Darbo dienomis 11:00–15:00',
    coords: { latitude: 54.7225, longitude: 25.336 },
  },
  {
    title: 'Poilsio zona lauke',
    category: 'quiet',
    description: 'Suoliukai ir žalia zona prie VU centrinių rūmų',
    address: 'Saulėtekio al. 11, Vilnius',
    price: 'Nemokama',
    hours: 'Visą parą',
    coords: { latitude: 54.722805, longitude: 25.338285 },
  },
  {
    title: 'Dviračių stovėjimo aikštelė',
    category: 'transport',
    description: 'Dviračių stovai šalia MKIC',
    address: 'Saulėtekio al. 5, Vilnius',
    price: 'Nemokama',
    hours: 'Visą parą',
    coords: { latitude: 54.722, longitude: 25.334 },
  },

  // Naujos vietos:

  {
    title: 'Spausdintuvas – VU MKIC',
    category: 'printers',
    description: 'Spausdintuvas prie MKIC pastato pirmame aukšte',
    address: 'Saulėtekio al. 5, Vilnius',
    price: 'Mokamas (apie 0.05 €/lapas)',
    hours: 'Darbo dienomis 9:00–18:00',
    coords: { latitude: 54.7221, longitude: 25.3355 },
  },
  {
    title: 'Tylos zona – VGTU centriniuose rūmuose',
    category: 'quiet',
    description: 'Tyli erdvė antrame aukšte su individualiomis vietomis',
    address: 'Saulėtekio al. 11, Vilnius',
    price: 'Nemokama',
    hours: 'Darbo dienomis 8:00–22:00',
    coords: { latitude: 54.7232, longitude: 25.3381 },
  },
  {
    title: 'Kavinė – VGTU centriniuose rūmuose',
    category: 'food',
    description: 'Greito maisto savitarnos zona',
    address: 'Saulėtekio al. 11, Vilnius',
    price: 'Pietūs nuo 4.20€',
    hours: 'Darbo dienomis 10:00–16:00',
    coords: { latitude: 54.7229, longitude: 25.3378 },
  },
  {
    title: 'Dviračių stovai – VU GMC',
    category: 'transport',
    description: 'Stovai su stogeliu prie įėjimo',
    address: 'Saulėtekio al. 7, Vilnius',
    price: 'Nemokama',
    hours: 'Visą parą',
    coords: { latitude: 54.7227, longitude: 25.3364 },
  },
  {
    title: 'Spausdintuvas – VU Ekonomikos fakultetas',
    category: 'printers',
    description: 'Spausdinimo paslaugos studentams trečiame aukšte',
    address: 'Saulėtekio al. 9, Vilnius',
    price: 'Mokamas (apie 0.04 €/lapas)',
    hours: 'Darbo dienomis 9:00–17:00',
    coords: { latitude: 54.7233, longitude: 25.3342 },
  },
];


const adjustOverlappingCoords = (spots) => {
  const seen = new Map();

  return spots.map((spot) => {
    const key = `${spot.coords.latitude},${spot.coords.longitude}`;
    if (seen.has(key)) {
      const count = seen.get(key) + 1;
      seen.set(key, count);

      const offset = 0.00005 * count;
      return {
        ...spot,
        coords: {
          latitude: spot.coords.latitude + offset,
          longitude: spot.coords.longitude + offset,
        },
      };
    } else {
      seen.set(key, 0);
      return spot;
    }
  });
};

export const spotData = adjustOverlappingCoords(originalSpotData);
