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
                climate_temp: "",
                eta: "",
                is_moving: ""
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
                    away_standing: "",
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
        if (value.startsWith("http://") ||
            value.startsWith("https://") ||
            value.startsWith("/") ||
            value.startsWith("data:")) {
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
        const isMoving = this._bool(e.is_moving, false);
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
                : isMoving
                    ? this._imageOverride("away_driving", "away_driving_transparent.png")
                    : this._imageOverride("away_standing", "away_standing.png");
        const warningWindowImage = this._imageOverride("warning_window", "noun-car-window.svg");
        const warningDoorImage = this._imageOverride("warning_door", "noun-car.svg");
        const remPercent = Math.max(0, target - current);
        const cap = Number(o.battery_capacity_kwh || 77);
        const etaVisible = charging || o.show_eta_when_not_charging;
        let etaText = "ETA --";
        const etaMins = e.eta ? this._num(e.eta, -1) : -1;
        if (etaMins >= 0) {
            etaText = `ETA ${Math.floor(etaMins / 60)}h ${etaMins % 60}m`;
        }
        else if (remPercent <= 0) {
            etaText = "ETA 0h 0m";
        }
        else if (charging && power > 0) {
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
          background: var(--ha-card-background, var(--card-background-color));
        }

        .ev-visual {
          min-height: ${visualMinHeight};
          border-radius: 12px;
          padding: 8px;
          background:
          radial-gradient(circle at 55% 130%, rgba(var(--rgb-primary-color), 0.12) 0%, transparent 48%),
            linear-gradient(
              180deg,
              rgba(var(--rgb-primary-color), 0.06) 0%,
              rgba(var(--rgb-primary-text-color), 0.03) 100%
            ),
          var(--ha-card-background, var(--card-background-color));
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
          background: var(--card-background-color, #fff);
          border: 1px solid var(--divider-color, rgba(48,56,64,0.24));
          color: var(--primary-text-color);
          font-weight: 600;
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
          background: var(--card-background-color, #fff);
          border: 1px solid var(--divider-color, rgba(36,44,52,0.25));
          color: var(--primary-text-color);
          font-weight: 600;
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
          color: var(--primary-text-color);
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.55);
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
          color: var(--primary-text-color);
          font-weight: 700;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
        }

        .range {
          margin: 2px 0 0;
          font-size: 12px;
          color: var(--primary-text-color);
          font-weight: 500;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
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
              aria-label="${warningVisible
            ? [warningWindow ? "windows open" : "", warningDoor ? "doors open" : ""]
                .filter(Boolean)
                .join(", ")
            : "no warnings"}"
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
    }
    set hass(hass) {
        this._hass = hass;
        // Push updated hass to all ha-form instances
        this.querySelectorAll("ha-form").forEach((f) => {
            f.hass = hass;
        });
    }
    setConfig(config) {
        this._config = {
            ...EvCarTileCard.getStubConfig(),
            ...config,
            entities: {
                ...EvCarTileCard.getStubConfig().entities,
                ...(config.entities || {})
            },
            options: {
                ...EvCarTileCard.getStubConfig().options,
                ...(config.options || {}),
                images: {
                    ...EvCarTileCard.getStubConfig().options.images,
                    ...(config.options?.images || {})
                },
                layout: {
                    ...EvCarTileCard.getStubConfig().options.layout,
                    ...(config.options?.layout || {})
                }
            }
        };
        this._render();
    }
    _fire(config) {
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", {
            detail: { config },
            bubbles: true,
            composed: true,
        }));
    }
    _buildForm(schema, data, onChanged) {
        const form = document.createElement("ha-form");
        form.hass = this._hass;
        form.schema = schema;
        form.data = data;
        form.computeLabel = (s) => s.label ?? s.name;
        form.addEventListener("value-changed", (ev) => {
            ev.stopPropagation();
            const value = ev.detail?.value;
            if (!value)
                return;
            onChanged(value);
        });
        return form;
    }
    _section(title) {
        const el = document.createElement("div");
        el.className = "section-title";
        el.textContent = title;
        return el;
    }
    _render() {
        const c = this._config || EvCarTileCard.getStubConfig();
        const e = c.entities;
        const o = c.options;
        const imgs = o.images;
        const l = o.layout;
        this.innerHTML = `<style>
      :host { display: block; }
      ha-form { display: block; margin-bottom: 8px; }
      .section-title {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--secondary-text-color);
        padding: 16px 0 4px;
        border-bottom: 1px solid var(--divider-color, rgba(0,0,0,.12));
        margin-bottom: 8px;
      }
    </style>`;
        const app = (el) => this.appendChild(el);
        // ── Card ──────────────────────────────────────────────────────────────────
        app(this._section("Card"));
        app(this._buildForm([{ name: "name", label: "Card Name", selector: { text: {} } }], { name: c.name ?? "" }, (val) => this._fire({ ...c, ...val })));
        // ── Entities ──────────────────────────────────────────────────────────────
        app(this._section("Entities"));
        app(this._buildForm([
            { name: "power", label: "Power (kW sensor)", selector: { entity: {} } },
            { name: "charge", label: "Charge (%)", selector: { entity: {} } },
            { name: "target", label: "Target charge (%)", selector: { entity: {} } },
            { name: "range", label: "Range (km)", selector: { entity: {} } },
            { name: "charging", label: "Charging (binary_sensor)", selector: { entity: {} } },
            { name: "home", label: "Home / Zone", selector: { entity: {} } },
            { name: "windows_closed", label: "Windows open (binary_sensor)", selector: { entity: {} } },
            { name: "doors_closed", label: "Doors open (binary_sensor)", selector: { entity: {} } },
            { name: "climate_on", label: "Climate on (binary_sensor)", selector: { entity: {} } },
            { name: "climate_temp", label: "Climate temperature", selector: { entity: {} } },
            { name: "eta", label: "ETA (minutes sensor)", selector: { entity: {} } },
            { name: "is_moving", label: "Is Moving (binary_sensor)", selector: { entity: {} } },
        ], { ...e }, (val) => this._fire({ ...c, entities: { ...e, ...val } })));
        // ── Options ───────────────────────────────────────────────────────────────
        app(this._section("Options"));
        app(this._buildForm([
            { name: "battery_capacity_kwh", label: "Battery Capacity (kWh)", selector: { number: { min: 1, max: 300, step: 0.1, mode: "box" } } },
            { name: "asset_base_path", label: "Asset Base Path", selector: { text: {} } },
            { name: "show_eta_when_not_charging", label: "Show ETA When Not Charging", selector: { boolean: {} } },
        ], {
            battery_capacity_kwh: o.battery_capacity_kwh ?? 77,
            asset_base_path: o.asset_base_path ?? "",
            show_eta_when_not_charging: o.show_eta_when_not_charging ?? false,
        }, (val) => this._fire({ ...c, options: { ...o, ...val } })));
        // ── Image Overrides ───────────────────────────────────────────────────────
        app(this._section("Image Overrides"));
        app(this._buildForm([
            { name: "home_charging", label: "Home — Charging", selector: { text: {} } },
            { name: "home_not_charging", label: "Home — Not Charging", selector: { text: {} } },
            { name: "away_charging", label: "Away — Charging", selector: { text: {} } },
            { name: "away_driving", label: "Away — Driving", selector: { text: {} } },
            { name: "away_standing", label: "Away — Standing", selector: { text: {} } },
            { name: "warning_window", label: "Warning: Window Open Icon", selector: { text: {} } },
            { name: "warning_door", label: "Warning: Door Open Icon", selector: { text: {} } },
        ], { ...imgs }, (val) => this._fire({ ...c, options: { ...o, images: { ...imgs, ...val } } })));
        // ── Layout ────────────────────────────────────────────────────────────────
        app(this._section("Layout"));
        app(this._buildForm([
            { name: "visual_min_height", label: "Visual Min Height", selector: { text: {} } },
            { name: "zone_height", label: "Zone Height", selector: { text: {} } },
            { name: "car_image_left", label: "Car Image Left", selector: { text: {} } },
            { name: "car_image_top", label: "Car Image Top", selector: { text: {} } },
            { name: "car_image_width", label: "Car Image Width", selector: { text: {} } },
            { name: "car_image_height", label: "Car Image Height", selector: { text: {} } },
            { name: "car_image_object_position", label: "Car Image Object Position", selector: { text: {} } },
            { name: "car_image_scale", label: "Car Image Scale", selector: { number: { min: 0.1, max: 3, step: 0.01, mode: "box" } } },
            { name: "climate_badge_left", label: "Climate Badge Left", selector: { text: {} } },
            { name: "climate_badge_top", label: "Climate Badge Top", selector: { text: {} } },
            { name: "climate_badge_transform", label: "Climate Badge Transform", selector: { text: {} } },
            { name: "power_chip_left", label: "Power Chip Left", selector: { text: {} } },
            { name: "power_chip_bottom", label: "Power Chip Bottom", selector: { text: {} } },
            { name: "warning_right", label: "Warning Right", selector: { text: {} } },
            { name: "warning_top", label: "Warning Top", selector: { text: {} } },
            { name: "battery_left", label: "Battery Left", selector: { text: {} } },
            { name: "battery_bottom", label: "Battery Bottom", selector: { text: {} } },
            { name: "battery_width", label: "Battery Width", selector: { text: {} } },
            { name: "car_overlay_left", label: "Overlay Left", selector: { text: {} } },
            { name: "car_overlay_top", label: "Overlay Top", selector: { text: {} } },
        ], { ...l }, (val) => this._fire({ ...c, options: { ...o, layout: { ...l, ...val } } })));
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
