const originalSpotData = [
  //Tylos mokymosi zonos
  {
    title: 'Tylos/mokymosi zona – MKIC',
    category: 'quiet',
    description: 'Mokslinės komunikacijos ir informacijos centro skaitykla (MKIC)',
    address: 'Saulėtekio al. 5, Vilnius',
    price: 'Nemokama',
    hours: 'Visą parą',
    coords: { latitude: 54.7230913, longitude: 25.3284390 },
  },
  {
    title: 'Tylos/mokymosi zona – VILNIUS TECH S5 korpusas',
    category: 'quiet',
    description: 'Tylos/mokymosi zonos visuose aukštuose (I–V) S5 korpuse. Patogios vietos individualiam darbui ir mokymuisi.',
    address: 'Saulėtekio al. 11, S5 korpusas, Vilnius',
    price: 'Nemokama',
    hours: 'Darbo dienomis 8:00–22:00',
    coords: { latitude: 54.72157400917356, longitude: 25.337474396074246 },
  },
  // Mikrobanges
  {
    title: 'Mikrobangė – VILNIUS TECH kavinė "Hey Hungry" (S2 - I aukštis)',
    category: 'food',
    description: 'Kavinėje "Hey Hungry", esančioje VILNIUS TECH S2 korpuso pirmame aukšte, yra galimybė naudotis mikrobangų krosnele',
    address: 'Saulėtekio al. 11, Vilnius',
    price: 'Nemokama',
    hours: 'Darbo dienomis 8:00–17:00',
    coords: { latitude: 54.722021, longitude: 25.336907 },
  },
  {
    title: 'Mikrobangė – VU MKIC kavinė',
    category: 'food',
    description: 'Galima naudotis mikrobangų krosnele VU MKIC kavinėje',
    address: 'Saulėtekio al. 5, Vilnius',
    price: 'Nemokama',
    hours: 'I–VII 9:00–21:00',
    coords: { latitude: 54.7223, longitude: 25.3335 },
  },
    //Dviraciu stovai
  {
    title: 'Dviračių stovai – VU Taikomųjų mokslų institutas',
    category: 'transport',
    description: 'Dviračių stovai prie VU Taikomųjų mokslų instituto',
    address: 'Universiteto g. 3, Vilnius',
    price: 'Nemokama',
    hours: 'Visą parą',
    coords: { latitude: 54.722636, longitude: 25.330437},
  },
  {
    title: 'Dviračių stovai – VILNIUS TECH ',
    category: 'transport',
    description: 'Dviračių stovai prie S3 įėjimo',
    address: 'Saulėtekio al. 11, Vilnius',
    price: 'Nemokama',
    hours: 'Visą parą',
    coords: { latitude: 54.7226748, longitude: 25.3357366 },
  },
  {
    title: 'Dviračių stovai – VILNIUS TECH ',
    category: 'transport',
    description: 'Dviračių stovai prie S2 įėjimo',
    address: 'Saulėtekio al. 11, Vilnius',
    price: 'Nemokama',
    hours: 'Visą parą',
    coords: { latitude: 54.722191, longitude: 25.336991 },
  },
    //Spausdintuvai
  {
    title: 'Spausdintuvas – Aplinkos inžinerijos fakultetas, S5 (III ir V a.)',
    category: 'printers',
    description: 'Spausdintuvai III ir V aukšto fojė, S5 korpuse',
    address: 'Saulėtekio al. 11, S5 korpusas, Vilnius',
    price: 'Mokamas (apie 0.05 €/lapas)',
    hours: 'Darbo dienomis 8:00–18:00',
    coords: { latitude: 54.721573932801164, longitude: 25.337456435294282 },
  },
  {
    title: 'Spausdintuvas – Biblioteka, abonementas (SRC)',
    category: 'printers',
    description: 'Spausdintuvas bibliotekoje, Saulėtekio al. 14, I aukštas',
    address: 'Saulėtekio al. 14, Vilnius',
    price: 'Mokamas (apie 0.05 €/lapas)',
    hours: 'Darbo dienomis 8:00–18:00',
    coords: { latitude: 54.726267248383536, longitude: 25.330090159234253 },
  },
  {
    title: 'Spausdintuvas – Elektronikos fakultetas (P2, II a.)',
    category: 'printers',
    description: 'Spausdintuvas Elektronikos fakulteto P2 korpuso antrame aukšte',
    address: 'Saulėtekio al. 11, P2 korpusas, Vilnius',
    price: 'Mokamas (apie 0.05 €/lapas)',
    hours: 'Darbo dienomis 8:00–18:00',
    coords: { latitude: 54.727740014913245, longitude: 25.350102619523486 },
  },
  {
    title: 'Spausdintuvas – Fundamentinių mokslų fakultetas (S6, III a.)',
    category: 'printers',
    description: 'Spausdintuvas Fundamentinių mokslų fakultete, S6 korpuso trečiame aukšte',
    address: 'Saulėtekio al. 11, S6 korpusas, Vilnius',
    price: 'Mokamas (apie 0.05 €/lapas)',
    hours: 'Darbo dienomis 8:00–18:00',
    coords: { latitude: 54.721618582618625, longitude: 25.336290021040952 },
  },
  {
    title: 'Spausdintuvas – Centrinių rūmų foje (S1, II a.)',
    category: 'printers',
    description: 'Spausdintuvas S1 korpuso 2 aukšto fojė (prie 209 aud.)',
    address: 'Saulėtekio al. 11, S1 korpusas, Vilnius',
    price: 'Mokamas (apie 0.05 €/lapas)',
    hours: 'Darbo dienomis 8:00–18:00',
    coords: { latitude: 54.7225, longitude: 25.3379 },
  },
  {
    title: 'Spausdintuvas – Verslo vadybos fakultetas (S3, VI a.)',
    category: 'printers',
    description: 'Spausdintuvas S3 korpuso šeštame aukšte',
    address: 'Saulėtekio al. 11, S3 korpusas, Vilnius',
    price: 'Mokamas (apie 0.05 €/lapas)',
    hours: 'Darbo dienomis 8:00–18:00',
    coords: { latitude: 54.72236322139323, longitude: 25.33581518206778 },
  },
];

export function adjustOverlappingCoords(spots) {
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
}

// Galutinis spotData – jau su adjustOverlappingCoords pritaikymu
export const spotData = adjustOverlappingCoords(originalSpotData);
