const request = require("supertest");
const app = require("../src/app");
const axios = require("axios");
const { goOffline, getDatabase } = require("../src/firebase");

const expiredJWTTokenBasicUser = {
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywibmFtZSI6IkJhc2ljIFRob21hcyIsInJvbGUiOiJiYXNpYyIsImlhdCI6MTYzMjkwNzEzNSwiZXhwIjoxNjMyOTA3MzE1LCJpc3MiOiJodHRwczovL3d3dy5uZXRndXJ1LmNvbS8iLCJzdWIiOiIxMjMifQ.6nAlf_JG0OECyTfP8ids7upHsc2TQFgDNqqfCZtqB3U",
};
const expiredJWTTokenPremiumUser = {
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQzNCwibmFtZSI6IlByZW1pdW0gSmltIiwicm9sZSI6InByZW1pdW0iLCJpYXQiOjE2MzI5NDUyNjcsImV4cCI6MTYzMjk0NTQ0NywiaXNzIjoiaHR0cHM6Ly93d3cubmV0Z3VydS5jb20vIiwic3ViIjoiNDM0In0.i-T3rDC-eEYGLkQXF1T9oDmvLJU_5w4MpX95inHe4Pg",
};
let freshJWTTokenBasicUser;
let freshJWTTokenPremiumUser;

const basicUser = {
  id: 123,
  role: "basic",
  name: "Basic Thomas",
  username: "basic-thomas",
  password: "sR-_pcoow-27-6PAwCD8",
};
const premiumUser = {
  id: 434,
  role: "premium",
  name: "Premium Jim",
  username: "premium-jim",
  password: "GBLtTyq3E_UNjFnpo9m6",
};

const getFreshJWTToken = async (userObj) => {
  const config = {
    method: "post",
    url: "http://authservice:3000/auth",
    // url: "http://127.0.0.1:3000/auth",
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify(userObj),
  };
  const { data } = await axios(config);
  return data;
};

beforeAll(async () => {
  [freshJWTTokenBasicUser, freshJWTTokenPremiumUser] = await Promise.all([
    getFreshJWTToken(basicUser),
    getFreshJWTToken(premiumUser),
  ]);
});
afterAll(() => goOffline(getDatabase()));

it("Testing to see if jest works", () => {
  expect(1).toBe(1);
});

describe("Not given a JWT token", () => {
  test("GET /movies should return status code 400", async () => {
    const response = await request(app).get("/movies").send();
    expect(response.statusCode).toBe(400);
  });

  test("POST /movies should return status code 400", async () => {
    const response = await request(app).post("/movies").send();
    expect(response.statusCode).toBe(400);
  });
});

describe("Given an expired JWT token", () => {
  describe("for a basic user", () => {
    test("GET /movies should return a status code 403", async () => {
      const response = await request(app)
        .get("/movies")
        .set("Authorization", "bearer " + expiredJWTTokenBasicUser.token)
        .send();
      expect(response.statusCode).toBe(403);
    });
    test("POST /movies should return a status code 403", async () => {
      const response = await request(app)
        .post("/movies")
        .set("Authorization", "bearer " + expiredJWTTokenBasicUser.token)
        .send();
      expect(response.statusCode).toBe(403);
    });
  });

  describe("for a premium user", () => {
    test("GET /movies should return a status code 403", async () => {
      const response = await request(app)
        .get("/movies")
        .set("Authorization", "bearer " + expiredJWTTokenPremiumUser.token)
        .send();
      expect(response.statusCode).toBe(403);
    });
    test("POST /movies should return a status code 403", async () => {
      const response = await request(app)
        .post("/movies")
        .set("Authorization", "bearer " + expiredJWTTokenPremiumUser.token)
        .send();
      expect(response.statusCode).toBe(403);
    });
  });
});

describe("Given a valid JWT token", () => {
  describe("for a basic user", () => {
    test("GET /movies should return json", async () => {
      const response = await request(app)
        .get("/movies")
        .set("Authorization", "bearer " + freshJWTTokenBasicUser.token)
        .send();
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
    });

    test("POST /movies with a query param should return a body with defined title", async () => {
      const response = await request(app)
        .post("/movies")
        .set("Authorization", "bearer " + freshJWTTokenBasicUser.token)
        .query({ t: "Harry" })
        .send();
      expect(response.body.title).toBeDefined();
    });
  });
  describe("for a premium user", () => {
    test("GET /movies should return json", async () => {
      const response = await request(app)
        .get("/movies")
        .set("Authorization", "bearer " + freshJWTTokenPremiumUser.token)
        .send();
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
    });

    test("POST /movies with a query param should return a body with defined title", async () => {
      const response = await request(app)
        .post("/movies")
        .set("Authorization", "bearer " + freshJWTTokenPremiumUser.token)
        .query({ t: "Harry" })
        .send();
      expect(response.body.title).toBeDefined();
    });
  });
});
