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
        asset_base_path: "/hacsfiles/hacs-ev-car-tile/assets"
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
        asset_base_path: "/hacsfiles/hacs-ev-car-tile/assets"
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
        ...(config.options || {})
      }
    };
    this._render();
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

}