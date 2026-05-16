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
        show_eta_when_not_charging: false
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
        show_eta_when_not_charging: false
      },
      actions: {},
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
    return new URL(`./assets/${name}`, import.meta.url).toString();
  }

  async _callConfiguredAction(key) {
    if (!this._hass) {
      return;
    }
    const action = this._config.actions?.[key];
    if (!action?.service) {
      return;
    }

    const service = String(action.service);
    if (!service.includes(".")) {
      return;
    }

    const [domain, svc] = service.split(".");
    const data = { ...(action.data || {}) };

    if (key === "set_climate") {
      const current = this._num(this._config.entities.climate_temp, 21);
      const prompted = window.prompt("Set climate temperature", String(current));
      if (prompted === null) {
        return;
      }
      const parsed = Number(prompted);
      if (!Number.isFinite(parsed)) {
        return;
      }
      data.temperature = parsed;
    }

    if (key === "set_target") {
      const current = this._num(this._config.entities.target, 80);
      const prompted = window.prompt("Set target charge (%)", String(current));
      if (prompted === null) {
        return;
      }
      const parsed = Number(prompted);
      if (!Number.isFinite(parsed)) {
        return;
      }
      const field = data.value_field || "value";
      delete data.value_field;
      data[field] = parsed;
    }

    await this._hass.callService(domain, svc, data);
  }

  _toggleChargingFallback() {
    const ent = this._config.entities.charging;
    if (ent && this._hass && typeof this._hass.callService === "function") {
      this._hass.callService("homeassistant", "toggle", { entity_id: ent });
    }
  }

  _bindActions(root) {
    root.querySelector("#setClimateBtn")?.addEventListener("click", () => {
      this._callConfiguredAction("set_climate");
    });

    root.querySelector("#setTargetBtn")?.addEventListener("click", () => {
      this._callConfiguredAction("set_target");
    });

    root.querySelector("#toggleChargingBtn")?.addEventListener("click", () => {
      const hasConfigured = Boolean(this._config.actions?.toggle_charging?.service);
      if (hasConfigured) {
        this._callConfiguredAction("toggle_charging");
      } else {
        this._toggleChargingFallback();
      }
    });
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

    const image = home
      ? charging
        ? this._asset("athome_charging_transparent.png")
        : this._asset("athome_notcharging_transparent.png")
      : charging
        ? this._asset("away_charging_transparent.png")
        : this._asset("away_driving_transparent.png");

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
          min-height: 220px;
          border-radius: 12px;
          padding: 8px;
          background: radial-gradient(circle at 55% 130%, #e4e8ec 0%, transparent 48%),
            linear-gradient(180deg, #f4f8fc 0%, #f6f3ee 100%);
        }
        .ev-car-zone { position: relative; width: 100%; height: 200px; }
        .car-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center bottom;
          transform: scale(1.15);
          transform-origin: center bottom;
          filter: drop-shadow(0 16px 12px rgba(40, 38, 31, 0.2));
        }
        .climate-badge {
          position: absolute;
          left: 50%;
          top: 2px;
          transform: translateX(-50%);
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
          left: 18%;
          bottom: 84px;
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
          right: 8px;
          top: 4px;
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
          left: 76%;
          bottom: 40px;
          width: 30px;
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
          left: 6px;
          top: 4px;
          z-index: 4;
        }
        .name { margin: 0; font-size: 15px; }
        .range { margin: 2px 0 0; font-size: 12px; color: #5e5a50; }
        .actions {
          margin-top: 8px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
        }
        button {
          border: 1px solid rgba(44,54,62,0.2);
          border-radius: 10px;
          padding: 7px;
          font-size: 11px;
          background: rgba(255,255,255,0.9);
          cursor: pointer;
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
            <span class="warning" aria-label="${warningVisible ? [warningWindow ? "windows open" : "", warningDoor ? "doors open" : ""].filter(Boolean).join(", ") : "no warnings"}">
              <img class="${warningWindow ? "" : "hidden"}" src="${this._asset("noun-car-window-507628.svg")}" alt="" />
              <img class="${warningDoor ? "" : "hidden"}" src="${this._asset("noun-car-6500993.svg")}" alt="" />
            </span>
            <img class="car-image" src="${image}" alt="${this._config.name || "EV"}" />
            <div class="car-overlay">
              <h3 class="name">${this._config.name || "EV"}</h3>
              <p class="range">${range} km range left</p>
            </div>
          </div>
        </div>
        <div class="actions">
          <button id="setClimateBtn">Set Climate</button>
          <button id="setTargetBtn">Set Target</button>
          <button id="toggleChargingBtn">${charging ? "Stop Charging" : "Start Charging"}</button>
        </div>
      </ha-card>
    `;

    this._bindActions(this.shadowRoot);
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
    const a = c.actions || {};

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

        <h4>Actions</h4>
        ${this._field("Set Climate Service", "actions.set_climate.service", a.set_climate?.service || "")}
        ${this._field("Set Target Service", "actions.set_target.service", a.set_target?.service || "")}
        ${this._field("Toggle Charging Service", "actions.toggle_charging.service", a.toggle_charging?.service || "")}
      </div>
    `;

    this.querySelectorAll("input").forEach((el) => {
      el.addEventListener("change", () => {
        const path = el.dataset.path;
        const raw = el.value;
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
