import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

test("health endpoint returns success envelope", async () => {
  const response = await request(app).get("/api/health");
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.equal(typeof response.headers["x-request-id"], "string");
});

test("auth signup validates required fields", async () => {
  const response = await request(app).post("/api/auth/signup").send({
    email: "invalid-email",
    password: "123",
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
  assert.equal(Array.isArray(response.body.errors), true);
});

test("auth login smoke check returns 400 for malformed payload", async () => {
  const response = await request(app).post("/api/auth/login").send({});
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
});

test("checkout smoke check rejects empty order items", async () => {
  const response = await request(app).post("/api/orders").send({
    orderItems: [],
    shippingAddress: { fullName: "", address: "", city: "" },
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
});

test("product endpoint validates invalid product id", async () => {
  const response = await request(app).get("/api/products/not-an-id");
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.success, false);
});

test("AI generation endpoint rejects unauthenticated requests", async () => {
  const response = await request(app).post("/api/ai/generate").send({
    type: "description",
    inputs: { name: "Classic Tee" }
  });
  assert.equal(response.statusCode, 401);
  assert.equal(response.body.success, false);
});

test("AI generation controller fallback generator returns correct content types", async () => {
  const { generateAIContent } = await import("../controllers/ai.controller.js");
  
  let resultJson = null;
  const mockReq = {
    body: {
      type: "description",
      inputs: { name: "Test Hoodie", features: "Soft Cotton", language: "en" }
    },
    headers: {},
    user: { _id: "123456789012345678901234", name: "CTO Admin" }
  };

  const mockRes = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      resultJson = data;
      return this;
    }
  };

  await generateAIContent(mockReq, mockRes);
  assert.equal(mockRes.statusCode, 200);
  assert.equal(resultJson.success, true);
  assert.equal(resultJson.isMock, true);
  assert.match(resultJson.data, /Test Hoodie/);
});

