import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import { Express } from "express";
import User, { IUser } from "../models/user";

let app: Express;
const user: IUser = {
  name: "test_user",
  email: "auth-test@test.com",
  password: "1234567890",
}

const user2: IUser = {
  name: "auth_test_user2",
  email: "auth-test2@test.com",
  password: "1234567890",
}

beforeAll(async () => {
  app = await initApp();
  await User.deleteMany({ 'email': user.email });
});

afterAll(async () => {
  await User.deleteMany({ 'email': user.email });
  await mongoose.connection.close();
});

let accessToken: string;
let refreshToken: string;
let newRefreshToken: string

describe("Auth tests", () => {
  test("Test Register", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send(user);
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
    expect(response.statusCode).toBe(201);
  });



  test("Test Register existing email", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send(user);
    expect(response.statusCode).toBe(406);
  });

  test("Test Register missing password", async () => {
    const response = await request(app)
      .post("/auth/register").send({
        email: "test@test.com",
      });
    expect(response.statusCode).toBe(400);
  });

  test("Test Logout with valid token", async () => {
    const response = await request(app)
      .get("/auth/logout")
      .set("authorization", "JWT " + refreshToken);
    expect(response.statusCode).toBe(200);
  });

  test("Test Logout without token", async () => {
    const response = await request(app).get("/auth/logout");
    expect(response.statusCode).toBe(401);
  });

  test("Test Logout with invalid token", async () => {
    const response = await request(app)
      .get("/auth/logout")
      .set("authorization", "JWT 1" + refreshToken);
    expect(response.statusCode).toBe(401);
  });

  test("Test Logout with missing token", async () => {
    const response = await request(app)
      .get("/auth/logout")
      .set("authorization", "Bearer");
    expect(response.statusCode).toBe(401);
  });

  test("Test Login", async () => {
    const response = await request(app)
      .post("/auth/login").send(user);
    expect(response.statusCode).toBe(200);
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  test("Test forbidden access without token", async () => {
    const response = await request(app).get("/user/profile");
    expect(response.statusCode).toBe(401);
  });

  test("Test access with valid token", async () => {
    const response = await request(app)
      .get("/user/profile")
      .set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
  });

  test("Test access with invalid token", async () => {
    const response = await request(app)
      .get("/user/profile")
      .set("Authorization", "JWT 1" + accessToken);
    expect(response.statusCode).toBe(401);
  });

  // test("Test access after timeout of token", async () => {
  //   await new Promise(resolve => setTimeout(() => resolve("done"), 6000));
  //   const response = await request(app)
  //     .get("/user/profile")
  //     .set("Authorization", "JWT " + accessToken);
  //   expect(response.statusCode).not.toBe(200);
  // }, 7000);

  test("Test refresh token", async () => {
    const response = await request(app)
      .get("/auth/refresh")
      .set("Authorization", "JWT " + refreshToken);
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();

    const newAccessToken = response.body.accessToken;
    newRefreshToken = response.body.refreshToken;

    const response2 = await request(app)
      .get("/user/profile")
      .set("Authorization", "JWT " + newAccessToken);
    expect(response2.statusCode).toBe(200);
  });

  test("Test no refresh token", async () => {
    const response = await request(app)
      .get("/auth/refresh")
      .set("Authorization", "JWT ");
    console.log(response.body);
    expect(response.statusCode).toBe(401);
  });

  test("Test unauthorized refresh token", async () => {
    const response = await request(app)
      .get("/auth/refresh")
      .set("Authorization", "JWT unauthorized-refresh-token")
      .send();
    expect(response.statusCode).toBe(401);
  });

  test("Test Login with missing email", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        password: "1234567890",
      });
    expect(response.statusCode).toBe(400);
  });

  test("Test Login with missing password", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "auth-test@test.com",
      });
    expect(response.statusCode).toBe(400);
  });

  test("Test Login with incorrect email", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "incorrect@test.com",
        password: "1234567890",
      });
    expect(response.statusCode).toBe(401);
  });

  test("Test Login with incorrect password", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "auth-test@test.com",
        password: "incorrectpassword",
      });
    expect(response.statusCode).toBe(401);
  });

  test("Test Login with missing email and password", async () => {
    const response = await request(app).post("/auth/login").send({});
    expect(response.statusCode).toBe(400);
  });

  test("Test Login with invalid credentials", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "incorrect@test.com",
        password: "incorrectpassword",
      });
    expect(response.statusCode).toBe(401);
  });

  test("Test Logout- no refresh tokens for user", async () => {
    await User.findOneAndUpdate({ email: user.email }, { $set: { refreshTokens: [] } }, { new: true });
    const response = await request(app)
      .get("/auth/logout")
      .set("authorization", "Bearer " + refreshToken);
    expect(response.statusCode).toBe(401);
  });
});
