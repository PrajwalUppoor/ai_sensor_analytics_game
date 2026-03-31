/**
 * PI LAB CORE ENGINE
 * Physics-based nodal simulation for the Raspberry Pi 5 Digital Twin.
 */

export class CircuitNode {
  constructor(id, type = "INTERMEDIATE") {
    this.id = id;
    this.type = type; // SOURCE_3V3, SOURCE_5V, GND, GPIO, INTERMEDIATE
    this.potential = 0; // Voltage in Volts
    this.state = "OK"; // OK, BLOWN, SHORT_CIRCUIT
    this.connections = new Set();
  }
}

export class PiLabEngine {
  constructor() {
    this.nodes = new Map();
    this.peripherals = new Map();
    this.isTripped = false;
    this.initializeDTS();
  }

  // Clear current circuit structure but preserve GPIO config
  clearGraph() {
    this.nodes.forEach(node => {
      node.connections = [];
      if (node.type === "INTERMEDIATE") {
        this.nodes.delete(node.id);
      }
    });
    this.isTripped = false;
  }

  initializeDTS() {
    // BANK 0 - USER GPIO (from minimal-cm-dt-blob.dts)
    for (let i = 1; i <= 40; i++) {
      let pull = (i <= 8 || (i >= 34 && i <= 36)) ? "pull_up" : "pull_down";
      this.addNode(`pin-${i}`, "GPIO", pull);
    }
    // BANK 2 - SD/STATUS
    this.addNode(`pin-status`, "LED_STATUS", "active_low");
    
    // Virtual PCF8523 RTC at 0x68 (from example1-overlay.dts)
    this.peripherals.set(0x68, {
      name: "PCF8523 RTC",
      read: () => ({ time: new Date().toISOString() })
    });
  }

  setPinMode(pin, mode) {
    const node = this.nodes.get(`pin-${pin}`);
    if (node) node.mode = mode;
  }

  setPinState(pin, val) {
    const node = this.nodes.get(`pin-${pin}`);
    if (node) node.logicState = val;
  }

  getPinState(pin) {
    const node = this.nodes.get(`pin-${pin}`);
    return node ? (node.potential > 1.8 ? 1 : 0) : 0;
  }

  addNode(id, type = "INTERMEDIATE", pull = "no_pulling") {
    if (this.nodes.has(id)) {
      const existing = this.nodes.get(id);
      existing.type = type;
      existing.pull = pull;
      return existing;
    }
    const node = { id, type, potential: 0, connections: [], pull, state: "OK", mode: "INPUT", logicState: 0 };
    this.nodes.set(id, node);
    return node;
  }

  addWire(from, to) {
    if (!this.nodes.has(from)) this.addNode(from);
    if (!this.nodes.has(to)) this.addNode(to);
    this.nodes.get(from).connections.push(to);
    this.nodes.get(to).connections.push(from);
  }

  // Resolve the circuit potential using BFS propagation
  resolve() {
    // Reset potentials but apply internal pulls
    this.nodes.forEach(node => {
      if (node.type === "SOURCE_5V" || node.type === "SOURCE_5V") node.potential = 5.0; // Support multiple IDs
      else if (node.type === "SOURCE_3V3" || node.type === "SOURCE_3V") node.potential = 3.3;
      else if (node.type === "GND") node.potential = 0;
      else if (node.mode === "OUTPUT" && node.logicState === 1) node.potential = 3.3; // Act like a source
      else {
        // Internal Pull Logic
        if (node.pull === "pull_up") node.potential = 3.3; 
        else node.potential = 0;
      }
    });

    const queue = [];
    this.nodes.forEach(node => {
      // Primary voltage sources
      if (node.type.startsWith("SOURCE") || (node.mode === "OUTPUT" && node.logicState === 1)) {
        queue.push(node);
      }
    });

    const visited = new Set();
    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current.id)) continue;
      visited.add(current.id);

      current.connections.forEach(neighborId => {
        const neighbor = this.nodes.get(neighborId);
        if (!neighbor || neighbor.type === "GND") return;

        // V-drop Logic (Simple propagation for UI)
        neighbor.potential = current.potential;
        queue.push(neighbor);
      });
    }

    this.checkFailures();
  }

  checkFailures() {
    this.nodes.forEach(node => {
      // GPIO Blown if > 3.6V
      if (node.type === "GPIO" && node.potential > 3.6) {
        node.state = "BLOWN";
        console.warn(`[TWIN-CRITICAL] Pin ${node.id} blown by overvoltage: ${node.potential}V`);
      }
      
      // Short Circuit: Source connected directly to GND
      if (node.type === "GND" && node.potential > 0.5) {
        this.isTripped = true;
        console.error("[TWIN-REBOOT] System Thermal Trip! Short detected on GND rail.");
      }
    });
  }
}
