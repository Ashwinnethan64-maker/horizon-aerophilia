// Geographic constants and GeoJSON layers for Mangaluru - Gurupura - Polali Corridor

export interface GeoAnchor {
  name: string;
  kannadaName: string;
  lat: number;
  lng: number;
  description: string;
}

export const GEOGRAPHIC_ANCHORS: GeoAnchor[] = [
  {
    name: 'Mangaluru City Anchor',
    kannadaName: 'ಮಂಗಳೂರು ನಗರ',
    lat: 12.87170,
    lng: 74.84250,
    description: 'City core reference point (OSM Mangaluru)'
  },
  {
    name: 'Gurupura Locality Anchor',
    kannadaName: 'ಗುರುಪುರ',
    lat: 12.93828,
    lng: 74.92799,
    description: 'Gurupura river crossing & junction'
  },
  {
    name: 'Polali Rajarajeshwari Temple Anchor',
    kannadaName: 'ಪೊಳಲಿ ರಾಜರಾಜೇಶ್ವರಿ ಕ್ಷೇತ್ರ',
    lat: 12.933954,
    lng: 74.955291,
    description: 'Polali destination terminal & educational catchment'
  }
];

export const MAP_CENTER: [number, number] = [12.9050, 74.8989];
export const INITIAL_BOUNDS: [[number, number], [number, number]] = [
  [12.8268, 74.7964],
  [12.9832, 75.0014]
];

// Road-following high-resolution polylines (NH 169 & Polali Corridor)
export const ROUTE_GEOMETRY: Record<string, [number, number][]> = {
  // R1: Mangaluru State Bank -> Kadri/Kulshekar -> Gurupura -> Polali
  R1: [
    [12.8632, 74.8378], // S1: State Bank
    [12.8685, 74.8421], // Jyothi Circle
    [12.8732, 74.8490], // Bunts Hostel
    [12.8780, 74.8580], // Mallikatte / Kadri
    [12.8805, 74.8682], // S2: Kulshekar
    [12.8940, 74.8810], // Kudupu
    [12.9152, 74.8980], // Vamanjoor
    [12.9310, 74.9180], // Gurupura River approach
    [12.9383, 74.9280], // S3: Gurupura Junction
    [12.9410, 74.9350], // Kaikamba turnoff
    [12.9360, 74.9430], // Addoor approach
    [12.9340, 74.9553]  // S6: Polali High School
  ],
  // R2: Bondantila Village -> Addoor Bridge -> Gurupura -> Polali
  R2: [
    [12.9195, 74.9220], // S4: Bondantila
    [12.9270, 74.9340], // Rural feeder road
    [12.9360, 74.9430], // S5: Addoor Bridge Crossing
    [12.9383, 74.9280], // S3: Gurupura Junction
    [12.9360, 74.9430], // Addoor
    [12.9340, 74.9553]  // S6: Polali High School
  ]
};

// Core operating area polygon following candidate road corridor
export const CORE_OPERATING_AREA_GEOJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Core Student Transit Operating Area',
        kannadaName: 'ಮುಖ್ಯ ವಿದ್ಯಾರ್ಥಿ ಸಾರಿಗೆ ಕಾರ್ಯಾಚರಣೆ ಪ್ರದೇಶ',
        type: 'core_catchment'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [74.8320, 12.8580],
            [74.8480, 12.8680],
            [74.8750, 12.8760],
            [74.9050, 12.9080],
            [74.9240, 12.9150],
            [74.9500, 12.9250],
            [74.9620, 12.9350],
            [74.9580, 12.9450],
            [74.9320, 12.9480],
            [74.9180, 12.9420],
            [74.8920, 12.9250],
            [74.8650, 12.8900],
            [74.8400, 12.8720],
            [74.8320, 12.8580]
          ]
        ]
      }
    }
  ]
};

// Proposed 5 km study buffer outward from the core operating polygon
export const STUDY_BUFFER_5KM_GEOJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Proposed 5 km Study Buffer',
        kannadaName: 'ಪ್ರಸ್ತಾಪಿತ 5 ಕಿ.ಮೀ ಅಧ್ಯಯನ ವಲಯ',
        status: 'provisional_study_envelope'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [74.7964, 12.8268],
            [74.8450, 12.8180],
            [74.8950, 12.8350],
            [74.9450, 12.8620],
            [74.9850, 12.8900],
            [75.0014, 12.9350],
            [74.9920, 12.9680],
            [74.9620, 12.9832],
            [74.9150, 12.9820],
            [74.8620, 12.9650],
            [74.8250, 12.9300],
            [74.7980, 12.8800],
            [74.7964, 12.8268]
          ]
        ]
      }
    }
  ]
};

