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

    const defaultConfig = EvCarTileCard.getStubConfig();

    this._config = {
      ...defaultConfig,
      ...config,
      entities: {
        ...defaultConfig.entities,
        ...(config.entities || {})
      },
      options: {
        ...defaultConfig.options,
        ...(config.options || {}),
        images: {
          ...defaultConfig.options.images,
          ...(config.options?.images || {})
        },
        layout: {
          ...defaultConfig.options.layout,
          ...(config.options?.layout || {})
        }
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

    return `/hacsfiles/hacs-ev-car-tile/assets/${name}`;
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

    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("/") ||
      value.startsWith("data:")
    ) {
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
    const windowsClosed = !this._bool(e.windows_closed, false);
    const doorsClosed = !this._bool(e.doors_closed, false);
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

    const warningWindowImage = this._imageOverride("warning_window", "noun-car-window.svg");
    const warningDoorImage = this._imageOverride("warning_door", "noun-car.svg");

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
        :host {
          display: block;
        }

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
          background:
            radial-gradient(circle at 55% 130%, #e4e8ec 0%, transparent 48%),
            linear-gradient(180deg, #f4f8fc 0%, #f6f3ee 100%);
        }

        .ev-car-zone {
          position: relative;
          width: 100%;
          height: ${zoneHeight};
        }

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

        .warning img.hidden {
          display: none;
        }

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

        .cap {
          width: 14px;
          height: 4px;
          border-radius: 2px 2px 0 0;
          background: rgba(36,44,52,0.82);
        }

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

        .name {
          margin: 0;
          font-size: 15px;
        }

        .range {
          margin: 2px 0 0;
          font-size: 12px;
          color: #5e5a50;
        }
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

            <span
              class="warning"
              aria-label="${
                warningVisible
                  ? [warningWindow ? "windows open" : "", warningDoor ? "doors open" : ""]
                      .filter(Boolean)
                      .join(", ")
                  : "no warnings"
              }"
            >
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
  constructor() {
    super();
    this._config = null;
    this._hass = null;
    this._bound = false;
  }

  set hass(hass) {
    this._hass = hass;
    this.querySelectorAll("ha-entity-picker, ha-selector").forEach((el) => {
      el.hass = hass;
    });
  }

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
    this._config = cfg;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: cfg } }));
  }

  _get(path) {
    const c = this._config || EvCarTileCard.getStubConfig();
    return path.split(".").reduce((o, k) => (o != null && o[k] !== undefined ? o[k] : ""), c);
  }

  _entityPickerRow(label, path) {
    const div = document.createElement("div");
    div.className = "row";
    const picker = document.createElement("ha-entity-picker");
    picker.setAttribute("label", label);
    picker.setAttribute("allow-custom-entity", "");
    picker.dataset.path = path;
    // hass must be set before value so the picker can resolve entity names
    if (this._hass) picker.hass = this._hass;
    // Defer value assignment until the element is upgraded
    customElements.whenDefined("ha-entity-picker").then(() => {
      picker.hass = this._hass;
      picker.value = this._get(path) || "";
    });
    picker.addEventListener("value-changed", (ev) => {
      ev.stopPropagation();
      this._onChanged(path, ev.detail.value);
    });
    div.appendChild(picker);
    return div;
  }

  _imageSelectorRow(label, path) {
    const div = document.createElement("div");
    div.className = "row";
    // ha-selector has no built-in label attribute; wrap it
    const lbl = document.createElement("label");
    lbl.className = "selector-label";
    lbl.textContent = label;
    const sel = document.createElement("ha-selector");
    sel.selector = { text: { type: "url" } };
    sel.dataset.path = path;
    customElements.whenDefined("ha-selector").then(() => {
      sel.hass = this._hass;
      sel.selector = { image: {} };
      sel.value = this._get(path) || "";
    });
    sel.addEventListener("value-changed", (ev) => {
      ev.stopPropagation();
      this._onChanged(path, ev.detail.value ?? "");
    });
    lbl.appendChild(sel);
    div.appendChild(lbl);
    return div;
  }

  _textRow(label, path, type = "text") {
    const div = document.createElement("div");
    div.className = "row";
    const tf = document.createElement("ha-textfield");
    tf.setAttribute("label", label);
    tf.setAttribute("type", type);
    tf.dataset.path = path;
    tf.value = String(this._get(path) ?? "");
    tf.addEventListener("change", () => {
      const raw = tf.value;
      if (type === "number") {
        const num = Number(raw);
        this._onChanged(path, Number.isFinite(num) ? num : raw);
      } else {
        this._onChanged(path, raw);
      }
    });
    div.appendChild(tf);
    return div;
  }

  _switchRow(label, path) {
    const div = document.createElement("div");
    div.className = "row";
    const ff = document.createElement("ha-formfield");
    ff.setAttribute("label", label);
    const sw = document.createElement("ha-switch");
    sw.checked = Boolean(this._get(path));
    sw.addEventListener("change", () => {
      this._onChanged(path, sw.checked);
    });
    ff.appendChild(sw);
    div.appendChild(ff);
    return div;
  }

  _sectionTitle(text) {
    const h = document.createElement("div");
    h.className = "section-title";
    h.textContent = text;
    return h;
  }

  _render() {
    const c = this._config || EvCarTileCard.getStubConfig();
    const o = c.options || {};
    const l = o.layout || {};

    this.innerHTML = `
      <style>
        :host { display: block; }
        .section-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--primary-text-color);
          margin: 20px 0 8px;
          padding-bottom: 4px;
          border-bottom: 1px solid var(--divider-color, #e0e0e0);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .row { margin-bottom: 8px; }
        .row ha-entity-picker,
        .row ha-textfield,
        .row ha-selector { display: block; width: 100%; }
        .selector-label { display: block; font-size: 12px; color: var(--secondary-text-color); margin-bottom: 2px; }
        .selector-label ha-selector { display: block; }
        ha-formfield { display: block; padding: 6px 0; }
      </style>
    `;

    const append = (el) => this.appendChild(el);

    // Card name
    append(this._sectionTitle("Card"));
    append(this._textRow("Card Name", "name"));

    // Entities
    append(this._sectionTitle("Entities"));
    append(this._entityPickerRow("Power (kW sensor)", "entities.power"));
    append(this._entityPickerRow("Charge (%)", "entities.charge"));
    append(this._entityPickerRow("Target (%)", "entities.target"));
    append(this._entityPickerRow("Range (km)", "entities.range"));
    append(this._entityPickerRow("Charging (binary sensor)", "entities.charging"));
    append(this._entityPickerRow("Home / Zone", "entities.home"));
    append(this._entityPickerRow("Windows Closed (binary sensor)", "entities.windows_closed"));
    append(this._entityPickerRow("Doors Closed (binary sensor)", "entities.doors_closed"));
    append(this._entityPickerRow("Climate On (binary sensor)", "entities.climate_on"));
    append(this._entityPickerRow("Climate Temperature", "entities.climate_temp"));

    // Options
    append(this._sectionTitle("Options"));
    append(this._textRow("Battery Capacity (kWh)", "options.battery_capacity_kwh", "number"));
    append(this._textRow("Asset Base Path", "options.asset_base_path"));
    append(this._switchRow("Show ETA When Not Charging", "options.show_eta_when_not_charging"));

    // Image overrides
    append(this._sectionTitle("Image Overrides"));
    append(this._imageSelectorRow("Home — Charging", "options.images.home_charging"));
    append(this._imageSelectorRow("Home — Not Charging", "options.images.home_not_charging"));
    append(this._imageSelectorRow("Away — Charging", "options.images.away_charging"));
    append(this._imageSelectorRow("Away — Driving", "options.images.away_driving"));
    append(this._imageSelectorRow("Warning: Window Open Icon", "options.images.warning_window"));
    append(this._imageSelectorRow("Warning: Door Open Icon", "options.images.warning_door"));

    // Layout
    append(this._sectionTitle("Layout"));
    append(this._textRow("Visual Min Height", "options.layout.visual_min_height"));
    append(this._textRow("Zone Height", "options.layout.zone_height"));
    append(this._textRow("Car Image Left", "options.layout.car_image_left"));
    append(this._textRow("Car Image Top", "options.layout.car_image_top"));
    append(this._textRow("Car Image Width", "options.layout.car_image_width"));
    append(this._textRow("Car Image Height", "options.layout.car_image_height"));
    append(this._textRow("Car Image Object Position", "options.layout.car_image_object_position"));
    append(this._textRow("Car Image Scale", "options.layout.car_image_scale", "number"));
    append(this._textRow("Climate Badge Left", "options.layout.climate_badge_left"));
    append(this._textRow("Climate Badge Top", "options.layout.climate_badge_top"));
    append(this._textRow("Climate Badge Transform", "options.layout.climate_badge_transform"));
    append(this._textRow("Power Chip Left", "options.layout.power_chip_left"));
    append(this._textRow("Power Chip Bottom", "options.layout.power_chip_bottom"));
    append(this._textRow("Warning Right", "options.layout.warning_right"));
    append(this._textRow("Warning Top", "options.layout.warning_top"));
    append(this._textRow("Battery Left", "options.layout.battery_left"));
    append(this._textRow("Battery Bottom", "options.layout.battery_bottom"));
    append(this._textRow("Battery Width", "options.layout.battery_width"));
    append(this._textRow("Overlay Left", "options.layout.car_overlay_left"));
    append(this._textRow("Overlay Top", "options.layout.car_overlay_top"));
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