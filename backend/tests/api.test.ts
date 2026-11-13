import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Server } from "node:http";
import app from "../src/api/server.js";
import type {
  Network,
  Student,
  Scenario,
  SimResult,
  OptimizationResult,
} from "../../contracts/types.js";

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === "object") {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

describe("Backend API Integration Tests", () => {
  describe("GET /api/health", () => {
    it("returns status ok with timestamp and version", async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.status).toBe("ok");
      expect(data.version).toBe("1.0.0");
      expect(typeof data.timestamp).toBe("string");
    });

    it("handles CORS options preflight correctly", async () => {
      const res = await fetch(`${baseUrl}/api/health`, {
        method: "OPTIONS",
        headers: {
          Origin: "http://localhost:5173",
          "Access-Control-Request-Method": "GET",
        },
      });
      expect([200, 204]).toContain(res.status);
      expect(res.headers.get("access-control-allow-origin")).toBe(
        "http://localhost:5173",
      );
    });
  });

  describe("GET /api/network", () => {
    it("returns the full network structure matching contract", async () => {
      const res = await fetch(`${baseUrl}/api/network`);
      expect(res.status).toBe(200);

      const network: Network = await res.json();
      expect(Array.isArray(network.stops)).toBe(true);
      expect(Array.isArray(network.routes)).toBe(true);
      expect(Array.isArray(network.buses)).toBe(true);
      expect(network.stops.length).toBeGreaterThanOrEqual(6);
      expect(network.buses.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("GET & POST /api/students", () => {
    it("GET /api/students returns student list", async () => {
      const res = await fetch(`${baseUrl}/api/students`);
      expect(res.status).toBe(200);

      const students: Student[] = await res.json();
      expect(Array.isArray(students)).toBe(true);
      expect(students.length).toBeGreaterThanOrEqual(90);
    });

    it("POST /api/students creates a student with valid body", async () => {
      const newStudentPayload = {
        name: "Integration Test Student",
        homeStopId: "S1",
        destinationId: "S6",
        arriveBy: "08:15",
        days: [1, 2, 3, 4, 5],
      };

      const res = await fetch(`${baseUrl}/api/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudentPayload),
      });

      expect(res.status).toBe(201);
      const created: Student = await res.json();
      expect(created.id).toMatch(/^ST-\d+/);
      expect(created.name).toBe(newStudentPayload.name);
      expect(created.homeStopId).toBe(newStudentPayload.homeStopId);
    });

    it("POST /api/students returns 400 for invalid body schema", async () => {
      const invalidPayload = {
        name: "Invalid Student",
        // missing homeStopId, destinationId, arriveBy, days
      };

      const res = await fetch(`${baseUrl}/api/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidPayload),
      });

      expect(res.status).toBe(400);
      const errorData = await res.json();
      expect(errorData).toHaveProperty("error");
      expect(errorData).toHaveProperty("details");
      expect(Array.isArray(errorData.details)).toBe(true);
    });
  });

  describe("GET /api/scenarios", () => {
    it("returns preset scenarios with labels and patches", async () => {
      const res = await fetch(`${baseUrl}/api/scenarios`);
      expect(res.status).toBe(200);

      const scenarios: Scenario[] = await res.json();
      expect(Array.isArray(scenarios)).toBe(true);
      expect(scenarios.length).toBeGreaterThanOrEqual(4);
      expect(scenarios.some((s) => s.id === "exam_surge")).toBe(true);
      expect(scenarios.some((s) => s.id === "breakdown_b1")).toBe(true);
    });
  });

  describe("POST /api/simulate", () => {
    it("runs simulation with default seed and returns valid SimResult", async () => {
      const res = await fetch(`${baseUrl}/api/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed: 42 }),
      });

      expect(res.status).toBe(200);
      const result: SimResult = await res.json();
      expect(result).toHaveProperty("events");
      expect(result).toHaveProperty("metrics");
      expect(result.metrics.servedOnTime).toBeGreaterThan(0);
      expect(result.metrics.stranded).toBeGreaterThanOrEqual(0);
      expect(result.metrics.viabilityGap).toBeGreaterThanOrEqual(0);
    });

    it("runs simulation applying a preset scenario", async () => {
      const res = await fetch(`${baseUrl}/api/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: "breakdown_b1", seed: 42 }),
      });

      expect(res.status).toBe(200);
      const result: SimResult = await res.json();
      expect(result.metrics.stranded).toBeGreaterThan(0);
    });

    it("returns 400 for invalid simulation payload", async () => {
      const res = await fetch(`${baseUrl}/api/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed: "not-a-number" }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/optimize", () => {
    it("runs optimizer and returns before/after comparisons and schedule diffs", async () => {
      const res = await fetch(`${baseUrl}/api/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed: 42 }),
      });

      expect(res.status).toBe(200);
      const opt: OptimizationResult = await res.json();
      expect(opt).toHaveProperty("before");
      expect(opt).toHaveProperty("after");
      expect(opt).toHaveProperty("diff");
      expect(opt).toHaveProperty("scoreDelta");
      expect(Array.isArray(opt.diff)).toBe(true);
      expect(opt.after.metrics.servedOnTime).toBeGreaterThanOrEqual(
        opt.before.metrics.servedOnTime,
      );
    });

    it("returns 400 for invalid weights format in optimize request", async () => {
      const res = await fetch(`${baseUrl}/api/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weights: { served: "high" } }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/whatif", () => {
    it("returns 400 when what-if prompt is missing", async () => {
      const res = await fetch(`${baseUrl}/api/whatif`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
    });

    it("processes what-if with rule-based fallback when LLM API key is not configured", async () => {
      const res = await fetch(`${baseUrl}/api/whatif`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "What if bus B1 breaks down?" }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty("explanation");
      expect(data).toHaveProperty("result");
      expect(data).toHaveProperty("parsedAction");
    });
  });
});
