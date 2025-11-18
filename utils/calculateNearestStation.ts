import Station from "@/types/station";

interface Coords {
  x: number;
  y: number;
}

function calcularDistanciaSimplificada(ponto1: Coords, ponto2: Station) {
  const latDistPerDegree = 111320;
  const lonDistPerDegree = (40075000 * Math.cos((ponto1.x * Math.PI) / 180)) / 360;
  const deltaLat = (ponto2.latitude - ponto1.x) * latDistPerDegree;
  const deltaLon = (ponto2.longitude - ponto1.y) * lonDistPerDegree;

  return Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon);
}

export default function findClosestStation(coords: Station[], yourCoords: Coords) {
  console.log("received your coords as");
  console.log(yourCoords);

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
