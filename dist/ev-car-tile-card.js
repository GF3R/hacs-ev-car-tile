class EvCarTileCard extends HTMLElement {
  static getStubConfig() {
    return {
      type: "custom:ev-car-tile-card",
      name: "EV",
      entities: {
        power: "",
        charge: "",
        target: "",
        range: "",
        charging: "",
        home: "",
        windows_closed: "",
        doors_closed: "",
        climate_on: "",
        climate_temp: ""
      },
      options: {
        battery_capacity_kwh: 77,
        show_eta_when_not_charging: false,
        asset_base_path: "/hacsfiles/hacs-ev-car-tile/assets",
        images: {
          home_charging: "",
          home_not_charging: "",
          away_charging: "",
          away_driving: "",
          warning_window: "",
          warning_door: ""
        },
        layout: {
          visual_min_height: "220px",
          zone_height: "200px",
          car_image_left: "0",
          car_image_top: "0",
          car_image_width: "100%",
          car_image_height: "100%",
          car_image_object_position: "44% bottom",
          car_image_scale: 1.08,
          climate_badge_left: "50%",
          climate_badge_top: "2px",
          climate_badge_transform: "translateX(-50%)",
          power_chip_left: "10%",
          power_chip_bottom: "84px",
          warning_right: "2px",
          warning_top: "2px",
          battery_left: "82%",
          battery_bottom: "40px",
          battery_width: "30px",
          car_overlay_left: "6px",
          car_overlay_top: "4px"
        }
      }
    };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
  }

  setConfig(config) {
    if (!config || config.type !== "custom:ev-car-tile-card") {
      throw new Error("Invalid config for ev-car-tile-card");
    }
    this._config = {
      name: "EV",
      entities: {},
      options: {
        battery_capacity_kwh: 77,
        show_eta_when_not_charging: false,
        asset_base_path: "/hacsfiles/hacs-ev-car-tile/assets",
        images: {
          home_charging: "",
          home_not_charging: "",
          away_charging: "",
          away_driving: "",
          warning_window: "",
          warning_door: ""
        },
        layout: {
          visual_min_height: "220px",
          zone_height: "200px",
          car_image_left: "0",
          car_image_top: "0",
          car_image_width: "100%",
          car_image_height: "100%",
          car_image_object_position: "44% bottom",
          car_image_scale: 1.08,
          climate_badge_left: "50%",
          climate_badge_top: "2px",
          climate_badge_transform: "translateX(-50%)",
          power_chip_left: "10%",
          power_chip_bottom: "84px",
          warning_right: "2px",
          warning_top: "2px",
          battery_left: "82%",
          battery_bottom: "40px",
          battery_width: "30px",
          car_overlay_left: "6px",
          car_overlay_top: "4px"
        }
      },
      ...config,
      entities: {
        power: "",
        charge: "",
        target: "",
        range: "",
        charging: "",
        home: "",
        windows_closed: "",
        doors_closed: "",
        climate_on: "",
        climate_temp: "",
        ...(config.entities || {})
      },
      options: {
        battery_capacity_kwh: 77,
        show_eta_when_not_charging: false,
        asset_base_path: "/hacsfiles/hacs-ev-car-tile/assets",
        images: {
          home_charging: "",
          home_not_charging: "",
          away_charging: "",
          away_driving: "",
          warning_window: "",
          warning_door: ""
        },
        layout: {
          visual_min_height: "220px",
          zone_height: "200px",
          car_image_left: "0",
          car_image_top: "0",
          car_image_width: "100%",
          car_image_height: "100%",
          car_image_object_position: "44% bottom",
          car_image_scale: 1.08,
          climate_badge_left: "50%",
          climate_badge_top: "2px",
          climate_badge_transform: "translateX(-50%)",
          power_chip_left: "10%",
          power_chip_bottom: "84px",
          warning_right: "2px",
          warning_top: "2px",
          battery_left: "82%",
          battery_bottom: "40px",
          battery_width: "30px",
          car_overlay_left: "6px",
          car_overlay_top: "4px"
        },
        ...(config.options || {})
      }
    };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 5;
  }

  static async getConfigElement() {
    await customElements.whenDefined("ev-car-tile-card-editor");
    return document.createElement("ev-car-tile-card-editor");
  }

  _entityState(entityId) {
    if (!entityId || !this._hass) {
      return null;
    }
    return this._hass.states[entityId] || null;
  }

  _num(entityId, fallback = 0) {
    const st = this._entityState(entityId);
    if (!st) {
      return fallback;
    }
    const n = Number(st.state);
    return Number.isFinite(n) ? n : fallback;
  }

  _bool(entityId, fallback = false) {
    const st = this._entityState(entityId);
    if (!st) {
      return fallback;
    }
    const v = String(st.state).toLowerCase();
    return ["on", "home", "true", "open", "charging"].includes(v);
  }

  _asset(name) {
    const configuredBase = this._config?.options?.asset_base_path;
    if (configuredBase) {
      return `${String(configuredBase).replace(/\/$/, "")}/${name}`;
    }
    if (this._hass && typeof this._hass.hassUrl === "function") {
      return this._hass.hassUrl(`/hacsfiles/hacs-ev-car-tile/assets/${name}`);
    }
    return new URL(`./assets/${name}`, import.meta.url).toString();
  }

  _layoutValue(key, fallback) {
    const value = this._config?.options?.layout?.[key];
    if (value === null || value === undefined || value === "") {
      return fallback;
    }
    return String(value);
  }

  _layoutNumberValue(key, fallback) {
    const value = Number(this._config?.options?.layout?.[key]);
    return Number.isFinite(value) ? value : fallback;
  }

  _imageOverride(key, fallbackName) {
    const value = String(this._config?.options?.images?.[key] || "").trim();
    if (!value) {
      return this._asset(fallbackName);
    }
    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/") || value.startsWith("data:")) {
      return value;
    }
    return this._asset(value);
  }

  _render() {
    if (!this._config || !this._hass || !this.shadowRoot) {
      return;
    }

    const e = this._config.entities;
    const o = this._config.options;

    const current = Math.max(0, Math.min(100, this._num(e.charge, 0)));
    const target = Math.max(0, Math.min(100, this._num(e.target, 0)));
    const power = Math.max(0, this._num(e.power, 0));
    const range = Math.max(0, this._num(e.range, 0));

    const charging = this._bool(e.charging, false);
    const home = this._bool(e.home, false);
    const windowsClosed = this._bool(e.windows_closed, true);
    const doorsClosed = this._bool(e.doors_closed, true);
    const climateOn = this._bool(e.climate_on, false);
    const climateTemp = this._num(e.climate_temp, 21);

    const carImageScale = this._layoutNumberValue("car_image_scale", 1.08);
    const visualMinHeight = this._layoutValue("visual_min_height", "220px");
    const zoneHeight = this._layoutValue("zone_height", "200px");
    const carImageLeft = this._layoutValue("car_image_left", "0");
    const carImageTop = this._layoutValue("car_image_top", "0");
    const carImageWidth = this._layoutValue("car_image_width", "100%");
    const carImageHeight = this._layoutValue("car_image_height", "100%");
    const carImageObjectPosition = this._layoutValue("car_image_object_position", "44% bottom");
    const climateBadgeLeft = this._layoutValue("climate_badge_left", "50%");
    const climateBadgeTop = this._layoutValue("climate_badge_top", "2px");
    const climateBadgeTransform = this._layoutValue("climate_badge_transform", "translateX(-50%)");
    const powerChipLeft = this._layoutValue("power_chip_left", "10%");
    const powerChipBottom = this._layoutValue("power_chip_bottom", "84px");
    const warningRight = this._layoutValue("warning_right", "2px");
    const warningTop = this._layoutValue("warning_top", "2px");
    const batteryLeft = this._layoutValue("battery_left", "82%");
    const batteryBottom = this._layoutValue("battery_bottom", "40px");
    const batteryWidth = this._layoutValue("battery_width", "30px");
    const carOverlayLeft = this._layoutValue("car_overlay_left", "6px");
    const carOverlayTop = this._layoutValue("car_overlay_top", "4px");

    const image = home
      ? charging
        ? this._imageOverride("home_charging", "athome_charging_transparent.png")
        : this._imageOverride("home_not_charging", "athome_notcharging_transparent.png")
      : charging
        ? this._imageOverride("away_charging", "away_charging_transparent.png")
        : this._imageOverride("away_driving", "away_driving_transparent.png");

    const warningWindowImage = this._imageOverride("warning_window", "noun-car-window-507628.svg");
    const warningDoorImage = this._imageOverride("warning_door", "noun-car-6500993.svg");

    const remPercent = Math.max(0, target - current);
    const cap = Number(o.battery_capacity_kwh || 77);
    const etaVisible = charging || o.show_eta_when_not_charging;
    let etaText = "ETA --";
    if (remPercent <= 0) {
      etaText = "ETA 0h 0m";
    } else if (charging && power > 0) {
      const energyNeeded = (remPercent / 100) * cap;
      const mins = Math.max(0, Math.round((energyNeeded / power) * 60));
      etaText = `ETA ${Math.floor(mins / 60)}h ${mins % 60}m`;
    }

    const warningWindow = !windowsClosed;
    const warningDoor = !doorsClosed;
    const warningVisible = warningWindow || warningDoor;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-card {
          border-radius: 16px;
          overflow: hidden;
          padding: 12px;
          background: linear-gradient(160deg, #ffffff 0%, #f8f6f1 100%);
        }
        .ev-visual {
          min-height: ${visualMinHeight};
          border-radius: 12px;
          padding: 8px;
          background: radial-gradient(circle at 55% 130%, #e4e8ec 0%, transparent 48%),
            linear-gradient(180deg, #f4f8fc 0%, #f6f3ee 100%);
        }
        .ev-car-zone { position: relative; width: 100%; height: ${zoneHeight}; }
        .car-image {
          position: absolute;
          left: ${carImageLeft};
          top: ${carImageTop};
          width: ${carImageWidth};
          height: ${carImageHeight};
          object-fit: contain;
          object-position: ${carImageObjectPosition};
          transform: scale(${carImageScale});
          transform-origin: center bottom;
          filter: drop-shadow(0 16px 12px rgba(40, 38, 31, 0.2));
        }
        .climate-badge {
          position: absolute;
          left: ${climateBadgeLeft};
          top: ${climateBadgeTop};
          transform: ${climateBadgeTransform};
          display: ${climateOn ? "inline-flex" : "none"};
          z-index: 5;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 12px;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(48,56,64,0.24);
        }
        .power-chip {
          position: absolute;
          left: ${powerChipLeft};
          bottom: ${powerChipBottom};
          z-index: 5;
          padding: 3px 8px;
          border-radius: 999px;
          font-size: 12px;
          background: rgba(236,249,240,0.92);
          border: 1px solid rgba(70,126,84,0.55);
          color: #25573a;
        }
        .warning {
          position: absolute;
          right: ${warningRight};
          top: ${warningTop};
          display: ${warningVisible ? "inline-flex" : "none"};
          gap: 4px;
          z-index: 5;
        }
        .warning img {
          width: 26px;
          height: 26px;
          object-fit: contain;
          filter: invert(58%) sepia(78%) saturate(1426%) hue-rotate(358deg) brightness(98%) contrast(95%);
        }
        .warning img.hidden { display: none; }
        .battery {
          position: absolute;
          left: ${batteryLeft};
          bottom: ${batteryBottom};
          width: ${batteryWidth};
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }
        .eta {
          display: ${etaVisible ? "inline-block" : "none"};
          font-size: 9px;
          padding: 1px 5px;
          border-radius: 999px;
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(36,44,52,0.25);
          white-space: nowrap;
        }
        .cap { width: 14px; height: 4px; border-radius: 2px 2px 0 0; background: rgba(36,44,52,0.82); }
        .shell {
          position: relative;
          width: 30px;
          height: 72px;
          border-radius: 7px;
          border: 2px solid rgba(36,44,52,0.7);
          background: rgba(212,219,226,0.72);
          overflow: hidden;
        }
        .fill {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: ${current}%;
          background: linear-gradient(180deg, #7ccc95 0%, #3f845d 100%);
        }
        .marker {
          position: absolute;
          left: 0;
          right: 0;
          bottom: calc(${target}% - 1px);
          height: 2px;
          background: #2f3338;
        }
        .battery-labels {
          font-size: 10px;
          white-space: nowrap;
          color: #223036;
        }
        .car-overlay {
          position: absolute;
          left: ${carOverlayLeft};
          top: ${carOverlayTop};
          z-index: 4;
        }
        .name { margin: 0; font-size: 15px; }
        .range { margin: 2px 0 0; font-size: 12px; color: #5e5a50; }
      </style>
      <ha-card>
        <div class="ev-visual">
          <div class="ev-car-zone">
            <span class="climate-badge">🌡️ ${climateTemp}C</span>
            <div class="battery">
              <span class="eta">${etaText}</span>
              <div class="cap"></div>
              <div class="shell">
                <div class="fill"></div>
                <div class="marker"></div>
              </div>
              <div class="battery-labels">${current}% / ${target}%</div>
            </div>
            <span class="power-chip">${charging ? `${power.toFixed(1)} kW` : "0.0 kW"}</span>
            <span class="warning" aria-label="${warningVisible ? [warningWindow ? "windows open" : "", warningDoor ? "doors open" : ""].filter(Boolean).join(", ") : "no warnings"}">
              <img class="${warningWindow ? "" : "hidden"}" src="${warningWindowImage}" alt="" />
              <img class="${warningDoor ? "" : "hidden"}" src="${warningDoorImage}" alt="" />
            </span>
            <img class="car-image" src="${image}" alt="${this._config.name || "EV"}" />
            <div class="car-overlay">
              <h3 class="name">${this._config.name || "EV"}</h3>
              <p class="range">${range} km range left</p>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }
}

class EvCarTileCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  _onChanged(path, value) {
    const cfg = structuredClone(this._config || EvCarTileCard.getStubConfig());
    const keys = path.split(".");
    let ptr = cfg;
    while (keys.length > 1) {
      const k = keys.shift();
      ptr[k] = ptr[k] || {};
      ptr = ptr[k];
    }
    ptr[keys[0]] = value;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: cfg } }));
  }

  _field(label, path, value = "") {
    return `
      <label>
        <span>${label}</span>
        <input data-path="${path}" value="${String(value ?? "")}" />
      </label>
    `;
  }

  _render() {
    const c = this._config || EvCarTileCard.getStubConfig();
    const e = c.entities || {};
    this.innerHTML = `
      <style>
        .grid { display: grid; gap: 8px; }
        label { display: grid; gap: 4px; font-size: 12px; }
        input { padding: 8px; }
        h4 { margin: 8px 0 0; }
      </style>
      <div class="grid">
        ${this._field("Card Name", "name", c.name || "")}
        <h4>Entities</h4>
        ${this._field("Power", "entities.power", e.power)}
        ${this._field("Charge", "entities.charge", e.charge)}
        ${this._field("Target", "entities.target", e.target)}
        ${this._field("Range", "entities.range", e.range)}
        ${this._field("Charging", "entities.charging", e.charging)}
        ${this._field("Home", "entities.home", e.home)}
        ${this._field("Windows Closed", "entities.windows_closed", e.windows_closed)}
        ${this._field("Doors Closed", "entities.doors_closed", e.doors_closed)}
        ${this._field("Climate On", "entities.climate_on", e.climate_on)}
        ${this._field("Climate Temp", "entities.climate_temp", e.climate_temp)}

        <h4>Options</h4>
        ${this._field("Battery Capacity (kWh)", "options.battery_capacity_kwh", c.options?.battery_capacity_kwh ?? 77)}
        ${this._field("Asset Base Path", "options.asset_base_path", c.options?.asset_base_path ?? "")}
        ${this._field("Show ETA When Not Charging (true/false)", "options.show_eta_when_not_charging", c.options?.show_eta_when_not_charging ?? false)}

        <h4>Image Overrides</h4>
        ${this._field("Home Charging Image", "options.images.home_charging", c.options?.images?.home_charging)}
        ${this._field("Home Not Charging Image", "options.images.home_not_charging", c.options?.images?.home_not_charging)}
        ${this._field("Away Charging Image", "options.images.away_charging", c.options?.images?.away_charging)}
        ${this._field("Away Driving Image", "options.images.away_driving", c.options?.images?.away_driving)}
        ${this._field("Warning Window Icon", "options.images.warning_window", c.options?.images?.warning_window)}
        ${this._field("Warning Door Icon", "options.images.warning_door", c.options?.images?.warning_door)}

        <h4>Layout</h4>
        ${this._field("Visual Min Height", "options.layout.visual_min_height", c.options?.layout?.visual_min_height ?? "220px")}
        ${this._field("Zone Height", "options.layout.zone_height", c.options?.layout?.zone_height ?? "200px")}
        ${this._field("Car Image Left", "options.layout.car_image_left", c.options?.layout?.car_image_left ?? "0")}
        ${this._field("Car Image Top", "options.layout.car_image_top", c.options?.layout?.car_image_top ?? "0")}
        ${this._field("Car Image Width", "options.layout.car_image_width", c.options?.layout?.car_image_width ?? "100%")}
        ${this._field("Car Image Height", "options.layout.car_image_height", c.options?.layout?.car_image_height ?? "100%")}
        ${this._field("Car Image Object Position", "options.layout.car_image_object_position", c.options?.layout?.car_image_object_position ?? "44% bottom")}
        ${this._field("Car Image Scale", "options.layout.car_image_scale", c.options?.layout?.car_image_scale ?? 1.08)}
        ${this._field("Climate Badge Left", "options.layout.climate_badge_left", c.options?.layout?.climate_badge_left ?? "50%")}
        ${this._field("Climate Badge Top", "options.layout.climate_badge_top", c.options?.layout?.climate_badge_top ?? "2px")}
        ${this._field("Climate Badge Transform", "options.layout.climate_badge_transform", c.options?.layout?.climate_badge_transform ?? "translateX(-50%)")}
        ${this._field("Power Chip Left", "options.layout.power_chip_left", c.options?.layout?.power_chip_left ?? "10%")}
        ${this._field("Power Chip Bottom", "options.layout.power_chip_bottom", c.options?.layout?.power_chip_bottom ?? "84px")}
        ${this._field("Warning Right", "options.layout.warning_right", c.options?.layout?.warning_right ?? "2px")}
        ${this._field("Warning Top", "options.layout.warning_top", c.options?.layout?.warning_top ?? "2px")}
        ${this._field("Battery Left", "options.layout.battery_left", c.options?.layout?.battery_left ?? "82%")}
        ${this._field("Battery Bottom", "options.layout.battery_bottom", c.options?.layout?.battery_bottom ?? "40px")}
        ${this._field("Battery Width", "options.layout.battery_width", c.options?.layout?.battery_width ?? "30px")}
        ${this._field("Overlay Left", "options.layout.car_overlay_left", c.options?.layout?.car_overlay_left ?? "6px")}
        ${this._field("Overlay Top", "options.layout.car_overlay_top", c.options?.layout?.car_overlay_top ?? "4px")}
      </div>
    `;

    this.querySelectorAll("input").forEach((el) => {
      el.addEventListener("change", () => {
        const path = el.dataset.path;
        const raw = el.value;
        const lower = raw.trim().toLowerCase();
        if (lower === "true" || lower === "false") {
          this._onChanged(path, lower === "true");
          return;
        }
        const num = Number(raw);
        const value = Number.isFinite(num) && raw.trim() !== "" ? num : raw;
        this._onChanged(path, value);
      });
    });
  }
}

customElements.define("ev-car-tile-card", EvCarTileCard);
customElements.define("ev-car-tile-card-editor", EvCarTileCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "ev-car-tile-card",
  name: "EV Car Tile Card",
  description: "EV tile card with configurable sensor entities and actions",
  preview: true
});
