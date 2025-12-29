import factoryIcon from "../assets/svg/factory.svg"
import solarIcon from "../assets/svg/solar.svg"
import buildingIcon from "../assets/svg/building.svg"
import batteryIcon from "../assets/svg/battery.svg"
import nuclearIcon from "../assets/svg/nuclear.svg"
import substationIcon from "../assets/svg/substation.svg"

export const ICON_MAP = {
  "factory.svg": factoryIcon,
  "solar.svg": solarIcon,
  "building.svg": buildingIcon,
  "battery.svg": batteryIcon,
  "nuclear.svg": nuclearIcon,
  "substation.svg": substationIcon,
}

export function resolveIcon(iconStr) {
  if (!iconStr) return null
  if (iconStr.startsWith("http://") || iconStr.startsWith("https://") || iconStr.startsWith("/"))
    return iconStr
  const m = iconStr.match(/([^/]+\.svg)$/)
  const name = m ? m[1] : iconStr
  if (ICON_MAP[name]) return ICON_MAP[name]
  return iconStr
}

export default {
  ICON_MAP,
  resolveIcon,
}
