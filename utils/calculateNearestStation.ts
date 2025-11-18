import Station from "@/types/station";

/**
 * Coordinate interface representing latitude and longitude
 * @interface Coords
 * @property {number} x - Latitude coordinate
 * @property {number} y - Longitude coordinate
 */
interface Coords {
  x: number;
  y: number;
}

/**
 * Calculates simplified distance between two geographic points using approximation
 * This is faster than Haversine formula for small distances
 * @param {Coords} ponto1 - First coordinate point (user location)
 * @param {Station} ponto2 - Second coordinate point (station location)
 * @returns {number} Distance in meters
 */
function calcularDistanciaSimplificada(ponto1: Coords, ponto2: Station): number {
  const latDistPerDegree = 111320;
  const lonDistPerDegree = (40075000 * Math.cos((ponto1.x * Math.PI) / 180)) / 360;
  const deltaLat = (ponto2.latitude - ponto1.x) * latDistPerDegree;
  const deltaLon = (ponto2.longitude - ponto1.y) * lonDistPerDegree;

  return Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon);
}

/**
 * Finds the closest charging station to user's coordinates
 * @param {Station[]} coords - Array of available charging stations
 * @param {Coords} yourCoords - User's current coordinates
 * @returns {{station: Station | null, distance: string | null}} Nearest station and distance in km
 * @example
 * const result = findClosestStation(stations, { x: 40.7128, y: -74.0060 });
 * // Returns: { station: {...}, distance: "2.45" }
 */
export default function findClosestStation(
  coords: Station[],
  yourCoords: Coords
): { station: Station | null; distance: string | null } {
  if (yourCoords.x == 0 || yourCoords.y == 0) {
    return { station: null, distance: null };
  }

  let maisProxima = coords[0];
  let menorDistancia = calcularDistanciaSimplificada(yourCoords, maisProxima);

  coords.forEach(coordenada => {
    const distancia = calcularDistanciaSimplificada(yourCoords, coordenada);
    if (distancia < menorDistancia) {
      maisProxima = coordenada;
      menorDistancia = distancia;
    }
  });

  return { station: maisProxima, distance: (menorDistancia / 1000).toFixed(2) };
}
