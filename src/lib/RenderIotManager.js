/**
 * RenderIotManager.js
 * Lightweight client for the Render IoT Gateway API.
 */

const BASE_URL = "https://iot-gateway-api-service.onrender.com/api";

export class RenderIotManager {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.channelId = "5cf957df-1fec-46b3-be11-b1b39bf1fc40"; // Default Lab Channel
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  /**
   * Request a new API Key for the current channel.
   */
  async generateKey() {
    try {
      const response = await fetch(`${BASE_URL}/channels/${this.channelId}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "readwrite" })
      });
      const data = await response.json();
      if (data.key) {
        this.apiKey = data.key;
        return data.key;
      }
      throw new Error("Failed to generate key");
    } catch (err) {
      console.error("IoT Key Gen Error:", err);
      return null;
    }
  }

  /**
   * Push telemetry readings to the cloud.
   */
  async publish(fields) {
    if (!this.apiKey) return { ok: false, error: "No API Key" };
    try {
      const response = await fetch(`${BASE_URL}/readings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey
        },
        body: JSON.stringify(fields)
      });
      return await response.json();
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  /**
   * Fetch historical series for charting.
   */
  async getHistory(field = "temperature", limit = 20) {
    if (!this.apiKey) return [];
    try {
      const response = await fetch(`${BASE_URL}/charts/series?field=${field}&limit=${limit}`, {
        headers: { "x-api-key": this.apiKey }
      });
      return await response.json();
    } catch (err) {
      return [];
    }
  }
}

export const iotManager = new RenderIotManager();
