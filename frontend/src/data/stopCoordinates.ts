import type { Network, Stop } from '../../../contracts/types.js';

export interface StopGeoEntry {
  lat: number;
  lng: number;
  kannadaName: string;
}

/** Real WGS84 coordinates for Mangaluru–Gurupura–Polali bus corridor stops. */
export const STOP_COORDINATES_BY_NAME: Record<string, StopGeoEntry> = {
  'state bank': { lat: 12.8666, lng: 74.8424, kannadaName: 'ಮಂಗಳೂರು ಸ್ಟೇಟ್ ಬ್ಯಾಂಕ್' },
  'mangaluru state bank': { lat: 12.8666, lng: 74.8424, kannadaName: 'ಮಂಗಳೂರು ಸ್ಟೇಟ್ ಬ್ಯಾಂಕ್' },
  'kulshekar': { lat: 12.8850, lng: 74.8720, kannadaName: 'ಕುಲಶೇಖರ' },
  'kadri / kulshekar junction': { lat: 12.8837, lng: 74.8712, kannadaName: 'ಕದ್ರಿ / ಕುಲಶೇಖರ ಜಂಕ್ಷನ್' },
  'kudupu': { lat: 12.8982, lng: 74.8895, kannadaName: 'ಕುಡುಪು' },
  'vamanjoor': { lat: 12.9082, lng: 74.8988, kannadaName: 'ವಾಮಂಜೂರು' },
  'kettikal': { lat: 12.9125, lng: 74.9145, kannadaName: 'ಕೆತ್ತಿಕಲ್' },
  'ulaibettu': { lat: 12.9210, lng: 74.9220, kannadaName: 'ಉಳಾಯಿಬೆಟ್ಟು' },
  'gurupura': { lat: 12.9325, lng: 74.9215, kannadaName: 'ಗುರುಪುರ' },
  'gurupura junction': { lat: 12.9318, lng: 74.9182, kannadaName: 'ಗುರುಪುರ ಜಂಕ್ಷನ್' },
  'bondanthila': { lat: 12.8985, lng: 74.9335, kannadaName: 'ಬೊಂಡಂತಿಲ' },
  'bondantila village': { lat: 12.8998, lng: 74.9334, kannadaName: 'ಬೊಂಡಂತಿಲ ಗ್ರಾಮ' },
  'addoor river bridge': { lat: 12.9285, lng: 74.9415, kannadaName: 'ಅಡ್ಡೂರು ಸೇತುವೆ' },
  'mallur': { lat: 12.9150, lng: 74.9390, kannadaName: 'ಮಲ್ಲೂರು' },
  'kaikamba': { lat: 12.9425, lng: 74.9410, kannadaName: 'ಕೈಕಂಬ' },
  'tharigudde': { lat: 12.9130, lng: 74.9465, kannadaName: 'ತಾರಿಗುಡ್ಡೆ' },
  'malali': { lat: 12.9435, lng: 74.9600, kannadaName: 'ಮಳಲಿ' },
  'polali': { lat: 12.9268, lng: 74.9595, kannadaName: 'ಪೊಳಲಿ' },
  'polali govt inter college & high school': { lat: 12.9275, lng: 74.9598, kannadaName: 'ಪೊಳಲಿ ಪ್ರೌಢಶಾಲೆ' }
};

function enrichStop(stop: Stop): Stop {
  if (stop.lat !== undefined && stop.lng !== undefined) {
    return stop;
  }
  const normalized = stop.name.trim().toLowerCase();
  const match = STOP_COORDINATES_BY_NAME[normalized];
  if (match) {
    return {
      ...stop,
      lat: match.lat,
      lng: match.lng,
      kannadaName: stop.kannadaName ?? match.kannadaName
    };
  }
  return stop;
}

export function enrichNetworkCoordinates(network: Network): Network {
  return {
    ...network,
    stops: network.stops.map(enrichStop)
  };
}
