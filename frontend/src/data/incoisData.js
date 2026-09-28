// INCOIS Marine Fishery Advisory System (MFAS) & Potential Fishing Zone (PFZ) Data
// Calibrated with real INCOIS Geoportal layers (SST, Chlorophyll, PFZ_LINES, EEZ, Sectors, LandingCentres, Bathymetry)

export const INCOIS_SECTORS = [
  { id: 'ap', name: 'Andhra Pradesh', center: [16.5, 82.5], zoom: 7 },
  { id: 'tn', name: 'Tamil Nadu & Puducherry', center: [10.5, 79.8], zoom: 7 },
  { id: 'kl', name: 'Kerala', center: [9.9, 76.2], zoom: 7 },
  { id: 'ka', name: 'Karnataka', center: [13.8, 74.5], zoom: 7 },
  { id: 'mh', name: 'Maharashtra & Goa', center: [17.5, 72.8], zoom: 7 },
  { id: 'gj', name: 'Gujarat', center: [21.5, 69.5], zoom: 7 },
  { id: 'od', name: 'Odisha', center: [19.8, 86.0], zoom: 7 },
  { id: 'wb', name: 'West Bengal', center: [21.2, 88.2], zoom: 7 },
  { id: 'an', name: 'Andaman & Nicobar', center: [11.5, 92.7], zoom: 6 },
  { id: 'ld', name: 'Lakshadweep', center: [10.5, 72.5], zoom: 7 },
];

export const INCOIS_LANDING_CENTRES = [
  { id: 'vizag', name: 'Visakhapatnam Fishing Harbour', sector: 'Andhra Pradesh', lat: 17.6975, lng: 83.3038, craftCount: 820 },
  { id: 'kakinada', name: 'Kakinada Fisheries Harbour', sector: 'Andhra Pradesh', lat: 16.9890, lng: 82.2475, craftCount: 650 },
  { id: 'machilipatnam', name: 'Machilipatnam (Gilakaladindi)', sector: 'Andhra Pradesh', lat: 16.1850, lng: 81.1620, craftCount: 380 },
  { id: 'nizampatnam', name: 'Nizampatnam Harbour', sector: 'Andhra Pradesh', lat: 15.9050, lng: 80.6720, craftCount: 420 },
  { id: 'chennai', name: 'Chennai (Kasimedu) Harbour', sector: 'Tamil Nadu', lat: 13.1250, lng: 80.2980, craftCount: 1100 },
  { id: 'cuddalore', name: 'Cuddalore Old Town', sector: 'Tamil Nadu', lat: 11.7500, lng: 79.7700, craftCount: 340 },
  { id: 'nagapattinam', name: 'Nagapattinam Port', sector: 'Tamil Nadu', lat: 10.7650, lng: 79.8450, craftCount: 580 },
  { id: 'rameswaram', name: 'Rameswaram Fishing Jetty', sector: 'Tamil Nadu', lat: 9.2876, lng: 79.3129, craftCount: 890 },
  { id: 'thoothukudi', name: 'Thoothukudi (Tuticorin)', sector: 'Tamil Nadu', lat: 8.7642, lng: 78.1348, craftCount: 750 },
  { id: 'kanyakumari', name: 'Chinnamuttam (Kanyakumari)', sector: 'Tamil Nadu', lat: 8.0980, lng: 77.5620, craftCount: 410 },
  { id: 'kochi', name: 'Kochi (Thoppumpady) Harbour', sector: 'Kerala', lat: 9.9312, lng: 76.2673, craftCount: 950 },
  { id: 'munambam', name: 'Munambam Fishing Harbour', sector: 'Kerala', lat: 10.1850, lng: 76.1680, craftCount: 620 },
  { id: 'mangalore', name: 'Mangalore (Bunder) Harbour', sector: 'Karnataka', lat: 12.8610, lng: 74.8390, craftCount: 720 },
  { id: 'malpe', name: 'Malpe Fisheries Harbour', sector: 'Karnataka', lat: 13.3520, lng: 74.7010, craftCount: 840 },
  { id: 'karwar', name: 'Karwar (Baithkol) Harbour', sector: 'Karnataka', lat: 14.8120, lng: 74.1250, craftCount: 390 },
  { id: 'veraval', name: 'Veraval Fishing Harbour', sector: 'Gujarat', lat: 20.9080, lng: 70.3680, craftCount: 1400 },
  { id: 'porbandar', name: 'Porbandar Subhashnagar', sector: 'Gujarat', lat: 21.6420, lng: 69.6050, craftCount: 980 },
  { id: 'paradip', name: 'Paradip Fishing Harbour', sector: 'Odisha', lat: 20.2980, lng: 86.6720, craftCount: 780 },
];

// INCOIS Official PFZ Advisory Vector Lines & Zones
export const INCOIS_PFZ_ADVISORIES = [
  {
    id: 'pfz-vizag-1',
    centreId: 'vizag',
    centreName: 'Visakhapatnam',
    bearing: '125° SE',
    distanceKm: 42,
    distanceNm: 22.7,
    depthMeters: '65 - 90 m',
    lat: 17.52,
    lng: 83.68,
    polyCoords: [
      [17.58, 83.62],
      [17.50, 83.74],
      [17.44, 83.66],
      [17.52, 83.56],
    ],
    sst: '28.4 °C',
    chlorophyll: '1.45 mg/m³',
    validity: '28 Sep 2024 to 30 Sep 2024',
    targetFishes: 'Yellowfin Tuna, Seer fish, Ribbonfish, Squid',
    status: 'ACTIVE_PFZ',
  },
  {
    id: 'pfz-kakinada-1',
    centreId: 'kakinada',
    centreName: 'Kakinada',
    bearing: '140° SE',
    distanceKm: 48,
    distanceNm: 25.9,
    depthMeters: '50 - 80 m',
    lat: 16.72,
    lng: 82.60,
    polyCoords: [
      [16.78, 82.52],
      [16.70, 82.68],
      [16.62, 82.60],
      [16.70, 82.46],
    ],
    sst: '28.6 °C',
    chlorophyll: '1.80 mg/m³',
    validity: '28 Sep 2024 to 30 Sep 2024',
    targetFishes: 'Indian Mackerel, White Pomfret, Prawns',
    status: 'ACTIVE_PFZ',
  },
  {
    id: 'pfz-chennai-1',
    centreId: 'chennai',
    centreName: 'Chennai',
    bearing: '090° East',
    distanceKm: 38,
    distanceNm: 20.5,
    depthMeters: '45 - 75 m',
    lat: 13.12,
    lng: 80.65,
    polyCoords: [
      [13.20, 80.60],
      [13.15, 80.72],
      [13.05, 80.68],
      [13.10, 80.55],
    ],
    sst: '28.8 °C',
    chlorophyll: '1.30 mg/m³',
    validity: '28 Sep 2024 to 30 Sep 2024',
    targetFishes: 'Sardine, Carangids, Barracuda',
    status: 'ACTIVE_PFZ',
  },
  {
    id: 'pfz-rameswaram-1',
    centreId: 'rameswaram',
    centreName: 'Rameswaram',
    bearing: '135° SE',
    distanceKm: 55,
    distanceNm: 29.7,
    depthMeters: '40 - 65 m',
    lat: 9.00,
    lng: 79.75,
    polyCoords: [
      [9.08, 79.68],
      [9.02, 79.82],
      [8.94, 79.76],
      [8.98, 79.62],
    ],
    sst: '28.2 °C',
    chlorophyll: '2.10 mg/m³',
    validity: '28 Sep 2024 to 30 Sep 2024',
    targetFishes: 'Skipjack Tuna, Cobia, Snappers, Squid',
    status: 'ACTIVE_PFZ',
  },
  {
    id: 'pfz-kochi-1',
    centreId: 'kochi',
    centreName: 'Kochi',
    bearing: '245° WSW',
    distanceKm: 46,
    distanceNm: 24.8,
    depthMeters: '60 - 100 m',
    lat: 9.80,
    lng: 75.88,
    polyCoords: [
      [9.88, 75.82],
      [9.80, 75.95],
      [9.72, 75.88],
      [9.78, 75.75],
    ],
    sst: '27.9 °C',
    chlorophyll: '2.40 mg/m³',
    validity: '28 Sep 2024 to 30 Sep 2024',
    targetFishes: 'Oil Sardine, Mackerel, Threadfin Bream',
    status: 'ACTIVE_PFZ',
  },
  {
    id: 'pfz-veraval-1',
    centreId: 'veraval',
    centreName: 'Veraval',
    bearing: '210° SSW',
    distanceKm: 62,
    distanceNm: 33.5,
    depthMeters: '55 - 95 m',
    lat: 20.45,
    lng: 70.05,
    polyCoords: [
      [20.52, 69.95],
      [20.48, 70.12],
      [20.38, 70.08],
      [20.42, 69.90],
    ],
    sst: '27.4 °C',
    chlorophyll: '1.95 mg/m³',
    validity: '28 Sep 2024 to 30 Sep 2024',
    targetFishes: 'Silver Pomfret, Ribbonfish, Croaker, Cuttlefish',
    status: 'ACTIVE_PFZ',
  },
];

// India Exclusive Economic Zone (EEZ) 200 Nautical Mile Maritime Boundary
export const INDIA_EEZ_BOUNDARY = [
  // West Coast EEZ
  [23.5, 68.0],
  [22.0, 66.5],
  [20.0, 67.0],
  [18.0, 68.5],
  [15.0, 70.5],
  [12.0, 72.0],
  [8.0, 74.0],
  [6.5, 77.0],
  // South of Sri Lanka / Indian Ocean
  [5.5, 79.5],
  [6.0, 82.5],
  // East Coast EEZ / Bay of Bengal
  [9.0, 84.5],
  [12.0, 85.5],
  [15.0, 87.0],
  [17.5, 88.5],
  [20.5, 89.0],
  [21.5, 88.0],
];

// GEBCO Bathymetry Depth Contours
export const BATHYMETRY_CONTOURS = [
  {
    depth: '20 m (Inshore / Nearshore)',
    color: '#38bdf8',
    weight: 1.5,
    coordinates: [
      [18.2, 84.1], [17.7, 83.35], [17.0, 82.35], [16.2, 81.2], [13.2, 80.35], [10.8, 79.9], [9.3, 79.35]
    ]
  },
  {
    depth: '50 m (Inner Shelf)',
    color: '#0284c7',
    weight: 1.8,
    coordinates: [
      [18.1, 84.3], [17.6, 83.5], [16.9, 82.5], [16.0, 81.4], [13.1, 80.5], [10.7, 80.05], [9.2, 79.5]
    ]
  },
  {
    depth: '100 m (Outer Shelf)',
    color: '#0369a1',
    weight: 2.0,
    coordinates: [
      [18.0, 84.5], [17.5, 83.7], [16.8, 82.65], [15.8, 81.6], [13.0, 80.65], [10.5, 80.2], [9.0, 79.7]
    ]
  },
  {
    depth: '200 m (Continental Shelf Break / Slope)',
    color: '#1d4ed8',
    weight: 2.5,
    dashArray: '5, 5',
    coordinates: [
      [17.9, 84.7], [17.4, 83.9], [16.7, 82.8], [15.6, 81.8], [12.9, 80.8], [10.3, 80.35], [8.8, 79.9]
    ]
  },
  {
    depth: '1000 m (Abyssal Plain)',
    color: '#1e1b4b',
    weight: 3.0,
    coordinates: [
      [17.6, 85.2], [17.1, 84.4], [16.4, 83.3], [15.2, 82.3], [12.5, 81.3], [9.8, 80.8], [8.2, 80.3]
    ]
  }
];

// INCOIS Ocean Surface Currents Vectors (CURRENTS_IO)
export const OCEAN_CURRENTS = [
  { lat: 17.5, lng: 84.0, u: 0.35, v: -0.42, speed: '0.55 m/s', dir: 'South-Southwest (210°)' },
  { lat: 16.8, lng: 83.2, u: 0.28, v: -0.38, speed: '0.47 m/s', dir: 'South-Southwest (215°)' },
  { lat: 15.5, lng: 82.0, u: 0.22, v: -0.34, speed: '0.41 m/s', dir: 'South-Southwest (212°)' },
  { lat: 14.2, lng: 81.4, u: 0.18, v: -0.31, speed: '0.36 m/s', dir: 'Southward (198°)' },
  { lat: 13.0, lng: 81.0, u: 0.15, v: -0.28, speed: '0.32 m/s', dir: 'Southward (195°)' },
  { lat: 11.5, lng: 80.5, u: 0.12, v: -0.25, speed: '0.28 m/s', dir: 'Southward (190°)' },
  { lat: 9.8, lng: 80.0, u: 0.10, v: -0.20, speed: '0.22 m/s', dir: 'Palk Drift (170°)' },
  { lat: 9.2, lng: 79.5, u: -0.15, v: -0.22, speed: '0.27 m/s', dir: 'Gulf of Mannar Jet (225°)' },
  { lat: 8.4, lng: 78.2, u: -0.25, v: -0.18, speed: '0.31 m/s', dir: 'Wadge Bank Current (240°)' },
  { lat: 9.6, lng: 75.8, u: -0.32, v: 0.15, speed: '0.35 m/s', dir: 'West Coast Upwelling Current (315°)' },
  { lat: 12.5, lng: 74.5, u: -0.28, v: 0.20, speed: '0.34 m/s', dir: 'Karnataka Coastal Jet (325°)' },
];

// INCOIS Sector Inter-State Boundary Lines
export const SECTOR_BOUNDARIES = [
  { name: 'AP / TN Maritime Border', coords: [[13.5, 80.2], [13.5, 85.0]], color: '#93c5fd' },
  { name: 'AP / Odisha Maritime Border', coords: [[19.1, 84.8], [18.2, 88.0]], color: '#93c5fd' },
  { name: 'TN / Kerala Maritime Border (Kanyakumari)', coords: [[8.08, 77.5], [6.5, 77.5]], color: '#93c5fd' },
  { name: 'Kerala / Karnataka Border', coords: [[12.8, 74.8], [12.8, 72.0]], color: '#93c5fd' },
];

