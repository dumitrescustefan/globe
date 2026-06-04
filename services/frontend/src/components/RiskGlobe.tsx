import { useCallback, useEffect, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import {
  featureCentroid,
  featureIso3,
  loadCountryFeatures,
  type CountryFeature,
} from '../lib/geo'
import { getCountryByIso3 } from '../data/sovereignData'
import { colorForMetric, METRICS, type MetricKey } from '../lib/metrics'
import type { Theme } from '../hooks/useTheme'

interface RiskGlobeProps {
  selectedIso3: string | null
  onSelect: (iso3: string | null) => void
  metric: MetricKey
  theme: Theme
}

const NEUTRAL_COLOR = '#475569'

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
/** Finer than default (5°) for smoother caps; 1–2° can stall or fail on first load. */
const POLYGON_CAP_CURVATURE_RESOLUTION = 3
const AUTO_ROTATE_SPEED = 0.45
const FOCUS_TRANSITION_MS = 900

function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function RiskGlobe({ selectedIso3, onSelect, metric, theme }: RiskGlobeProps) {
  const metricDef = METRICS[metric]
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
      const base = country ? colorForMetric(metricDef, country) : NEUTRAL_COLOR
      if (iso3 === selectedIso3) {
        return hexToRgba(base, 1)
      }
      if (iso3 === hoveredIso3) {
        return hexToRgba(base, 0.95)
      }
      return hexToRgba(base, 0.78)
    },
    [selectedIso3, hoveredIso3, metricDef],
  )

  // Darker extruded rim separates neighbors without 1px stroke lines (option A).
  const sideColor = useCallback(
    (feat: object) => {
      const iso3 = featureIso3(feat as CountryFeature)
      const country = getCountryByIso3(iso3)
      const base = country ? colorForMetric(metricDef, country) : NEUTRAL_COLOR
      const rimAlpha = theme === 'dark' ? 0.55 : 0.65
      return hexToRgba(base, rimAlpha)
    },
    [theme, metricDef],
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

  const polygonLabel = useCallback(
    (feat: object) => {
      const feature = feat as CountryFeature
      const country = getCountryByIso3(featureIso3(feature))
      const name = country?.name ?? feature.properties.ADMIN
      const value = country ? metricDef.display(country) : 'NR'
      const code = country?.iso_a2?.trim().toLowerCase()
      const flag = code
        ? `<span class="fi fi-${code}" style="display:inline-block;width:18px;height:13px;border-radius:2px;margin-right:6px;vertical-align:-2px;"></span>`
        : ''
      return `<div style="
        font-family: Inter, sans-serif;
        background: rgba(10,14,22,0.92);
        color: #f8fafc;
        padding: 6px 10px;
        border-radius: 8px;
        border: 1px solid rgba(148,163,184,0.25);
        font-size: 12px;">
        <strong>${flag}${name}</strong><br/>
        ${metricDef.label}: <strong>${value}</strong>
      </div>`
    },
    [metricDef],
  )

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
      {size.width > 0 && size.height > 0 && features.length > 0 && (
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
          polygonCapCurvatureResolution={POLYGON_CAP_CURVATURE_RESOLUTION}
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
