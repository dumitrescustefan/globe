/**
 * Minimal GeoJSON loading + geometry helpers for the globe. We only need a
 * handful of fields, so the typings here are deliberately narrow.
 */

export interface CountryFeatureProperties {
  ADMIN: string
  ADM0_A3: string
  ISO_A2: string
  [key: string]: unknown
}

type Position = [number, number]

interface PolygonGeometry {
  type: 'Polygon'
  coordinates: Position[][]
}

interface MultiPolygonGeometry {
  type: 'MultiPolygon'
  coordinates: Position[][][]
}

export interface CountryFeature {
  type: 'Feature'
  properties: CountryFeatureProperties
  geometry: PolygonGeometry | MultiPolygonGeometry
}

interface FeatureCollection {
  type: 'FeatureCollection'
  features: CountryFeature[]
}

const GEOJSON_URL = '/countries.geojson'

export async function loadCountryFeatures(): Promise<CountryFeature[]> {
  const response = await fetch(GEOJSON_URL)
  if (!response.ok) {
    throw new Error(`Failed to load ${GEOJSON_URL}: ${response.status}`)
  }
  const collection = (await response.json()) as FeatureCollection
  return collection.features
}

export function featureIso3(feature: CountryFeature): string {
  return feature.properties.ADM0_A3
}

/**
 * Approximate centroid (lat/lng) of a country feature, used to point the camera
 * at a selected country. Uses the average of the largest ring's vertices, which
 * is accurate enough for camera framing.
 */
export function featureCentroid(feature: CountryFeature): { lat: number; lng: number } {
  const rings: Position[][] =
    feature.geometry.type === 'Polygon'
      ? feature.geometry.coordinates
      : feature.geometry.coordinates.flat()

  let largest: Position[] = []
  for (const ring of rings) {
    if (ring.length > largest.length) {
      largest = ring
    }
  }

  if (largest.length === 0) {
    return { lat: 0, lng: 0 }
  }

  let sumLng = 0
  let sumLat = 0
  for (const [lng, lat] of largest) {
    sumLng += lng
    sumLat += lat
  }
  return { lat: sumLat / largest.length, lng: sumLng / largest.length }
}
