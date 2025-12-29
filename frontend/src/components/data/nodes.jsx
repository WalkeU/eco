import factoryIcon from "../../assets/svg/factory.svg"
import solarIcon from "../../assets/svg/solar.svg"
import buildingIcon from "../../assets/svg/building.svg"
import batteryIcon from "../../assets/svg/battery.svg"
import nuclearIcon from "../../assets/svg/nuclear.svg"

export const nodes = [
  {
    id: 1,
    x: 200,
    y: 200,
    label: "Factory",
    icon: factoryIcon,
    data: {
      type: "factory",
      capacity: 1000,
      workers: 50,
      status: "active",
    },
  },
  {
    id: 2,
    x: 500,
    y: 200,
    label: "Solar Panel",
    icon: solarIcon,
    data: {
      type: "solar",
      capacity: 300,
      efficiency: 0.85,
      status: "online",
    },
  },
  {
    id: 3,
    x: 350,
    y: 400,
    label: "Warehouse",
    icon: buildingIcon,
    data: {
      type: "warehouse",
      storage: 5000,
      temperature: "controlled",
      status: "operational",
    },
  },
  {
    id: 4,
    x: 600,
    y: 400,
    label: "Battery",
    icon: batteryIcon,
    data: {
      type: "battery",
      capacity: 2000,
      chargeLevel: 0.6,
      status: "charging",
    },
  },
  {
    id: 6,
    x: 1000,
    y: 200,
    label: "Nuclear",
    icon: nuclearIcon,
    data: {
      type: "nuclear",
      output: 5000,
      safetyLevel: "high",
      status: "active",
    },
  },
]
