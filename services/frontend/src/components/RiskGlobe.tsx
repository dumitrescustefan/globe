import { useCallback, useEffect, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import {
  featureCentroid,
  featureIso3,
  loadCountryFeatures,
  type CountryFeature,
} from '../lib/geo'
import { getCountryByIso3 } from '../data/sovereignData'
import { colorForRating } from '../lib/rating'
import type { Theme } from '../hooks/useTheme'

interface RiskGlobeProps {
  selectedIso3: string | null
  onSelect: (iso3: string | null) => void
  theme: Theme
}

const GLOBE_IMAGE: Record<Theme, string> = {
  dark: 'https://unpkg.com/three-globe/example/img/earth-night.jpg',
  light: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
}
const ATMOSPHERE_COLOR: Record<Theme, string> = {
  dark: '#3a6fb0',
  light: '#9ec5ff',
}

const DEFAULT_ALTITUDE = 2.4
const FOCUS_ALTITUDE = 1.5
const SELECTED_POLYGON_ALTITUDE = 0.18
const HOVER_POLYGON_ALTITUDE = 0.08
const BASE_POLYGON_ALTITUDE = 0.012
const AUTO_ROTATE_SPEED = 0.45
const FOCUS_TRANSITION_MS = 900

function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function RiskGlobe({ selectedIso3, onSelect, theme }: RiskGlobeProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const [features, setFeatures] = useState<CountryFeature[]>([])
  const [hoveredIso3, setHoveredIso3] = useState<string | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    let cancelled = false
    loadCountryFeatures()
      .then((loaded) => {
        if (!cancelled) {
          setFeatures(loaded)
        }
      })
      .catch((error: unknown) => {
        console.error('[RiskGlobe] failed to load country geometry', error)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Track container size so the canvas fills the hero area responsively.
  useEffect(() => {
    const node = containerRef.current
    if (!node) {
      return
    }
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (rect) {
        setSize({ width: rect.width, height: rect.height })
      }
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const setAutoRotate = useCallback((enabled: boolean) => {
    const controls = globeRef.current?.controls()
    if (controls) {
      controls.autoRotate = enabled
      controls.autoRotateSpeed = AUTO_ROTATE_SPEED
    }
  }, [])

  // Initial camera framing + rotation once the globe is interactive.
  useEffect(() => {
    if (features.length === 0) {
      return
    }
    const globe = globeRef.current
    if (!globe) {
      return
    }
    globe.pointOfView({ lat: 20, lng: 0, altitude: DEFAULT_ALTITUDE }, 0)
    setAutoRotate(true)
  }, [features, setAutoRotate])

  // React to selection: focus + freeze on a country, or release and resume spin.
  useEffect(() => {
    const globe = globeRef.current
    if (!globe || features.length === 0) {
      return
    }
    if (selectedIso3) {
      const feature = features.find((f) => featureIso3(f) === selectedIso3)
      if (feature) {
        const { lat, lng } = featureCentroid(feature)
        setAutoRotate(false)
        globe.pointOfView({ lat, lng, altitude: FOCUS_ALTITUDE }, FOCUS_TRANSITION_MS)
      }
    } else {
      setAutoRotate(true)
      globe.pointOfView({ altitude: DEFAULT_ALTITUDE }, FOCUS_TRANSITION_MS)
    }
  }, [selectedIso3, features, setAutoRotate])

  const capColor = useCallback(
    (feat: object) => {
      const feature = feat as CountryFeature
      const iso3 = featureIso3(feature)
      const country = getCountryByIso3(iso3)
      const base = country ? colorForRating(country.rating) : '#475569'
      if (iso3 === selectedIso3) {
        return hexToRgba(base, 1)
      }
      if (iso3 === hoveredIso3) {
        return hexToRgba(base, 0.95)
      }
      return hexToRgba(base, 0.78)
    },
    [selectedIso3, hoveredIso3],
  )

  // Darker extruded rim separates neighbors without 1px stroke lines (option A).
  const sideColor = useCallback(
    (feat: object) => {
      const iso3 = featureIso3(feat as CountryFeature)
      const country = getCountryByIso3(iso3)
      const base = country ? colorForRating(country.rating) : '#475569'
      const rimAlpha = theme === 'dark' ? 0.55 : 0.65
      return hexToRgba(base, rimAlpha)
    },
    [theme],
  )

  const polygonAltitude = useCallback(
    (feat: object) => {
      const iso3 = featureIso3(feat as CountryFeature)
      if (iso3 === selectedIso3) {
        return SELECTED_POLYGON_ALTITUDE
      }
      if (iso3 === hoveredIso3) {
        return HOVER_POLYGON_ALTITUDE
      }
      return BASE_POLYGON_ALTITUDE
    },
    [selectedIso3, hoveredIso3],
  )

  const polygonLabel = useCallback((feat: object) => {
    const feature = feat as CountryFeature
    const country = getCountryByIso3(featureIso3(feature))
    const name = country?.name ?? feature.properties.ADMIN
    const rating = country ? country.rating : 'NR'
    return `<div style="
        font-family: Inter, sans-serif;
        background: rgba(10,14,22,0.92);
        color: #f8fafc;
        padding: 6px 10px;
        border-radius: 8px;
        border: 1px solid rgba(148,163,184,0.25);
        font-size: 12px;">
        <strong>${country?.flag ?? ''} ${name}</strong><br/>
        Rating: <strong>${rating}</strong>
      </div>`
  }, [])

  const handleClick = useCallback(
    (feat: object) => {
      const iso3 = featureIso3(feat as CountryFeature)
      onSelect(iso3 === selectedIso3 ? null : iso3)
    },
    [onSelect, selectedIso3],
  )

  const handleHover = useCallback(
    (feat: object | null) => {
      setHoveredIso3(feat ? featureIso3(feat as CountryFeature) : null)
      // Pause spin while hovering a country so it stays clickable; resume when
      // the cursor leaves, unless a country is already selected (frozen).
      if (!selectedIso3) {
        setAutoRotate(!feat)
      }
    },
    [selectedIso3, setAutoRotate],
  )

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {size.width > 0 && size.height > 0 && (
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl={GLOBE_IMAGE[theme]}
          showAtmosphere
          atmosphereColor={ATMOSPHERE_COLOR[theme]}
          atmosphereAltitude={0.18}
          polygonsData={features}
          polygonCapColor={capColor}
          polygonSideColor={sideColor}
          polygonAltitude={polygonAltitude}
          polygonLabel={polygonLabel}
          polygonsTransitionDuration={300}
          onPolygonClick={handleClick}
          onPolygonHover={handleHover}
        />
      )}
    </div>
  )
}
