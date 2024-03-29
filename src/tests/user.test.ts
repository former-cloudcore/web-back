import { Express } from "express";
import request from "supertest";
import defaults from 'superagent-defaults';
import initApp from "../app";
import mongoose from "mongoose";
import User, { IUser } from "../models/user";
import supertest from "supertest";

let app: Express;
let user: IUser = {
    name: "test",
    email: "user-test@student.post.test",
    password: "1234567890",
}

const user2: IUser = {
    name: "test2",
    email: "user-test2@email.com",
    password: "1111",
}

let authorizedRequest;

beforeAll(async () => {
    app = await initApp();
    await User.deleteMany({});
    const response = await request(app).post("/api/auth/register").send(user);
    user._id = response.body._id;
    delete (user as Partial<IUser>).password;
    authorizedRequest = defaults(supertest(app));
    authorizedRequest.set({ 'Authorization': `Bearer ${response.body.accessToken}` });
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("User get tests", () => {
    test("Test Get All Users - one user", async () => {
        const response = await request(app).get("/api/user");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
    });

    test("Test Get All Users- after adding another user", async () => {
        const user2_response = await request(app).post("/api/auth/register").send(user2);
        user2._id = user2_response.body._id;
        const response = await request(app).get("/api/user");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(2);

    });

    test("Test Get user by id- unauthorized", async () => {
        const response = await request(app).get("/api/user/profile");
        expect(response.statusCode).toBe(401);
    });

    test("Test Get user by id- my user", async () => {
        const response = await authorizedRequest.get("/api/user/profile");
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toEqual(user._id);
    });

    test("Test Get user - no password", async () => {
        const response = await authorizedRequest.get("/api/user/profile");
        expect(response.statusCode).toBe(200);
        expect(response.body.password).toBeUndefined();
    });

    test("Test Get user - no tokens", async () => {
        const response = await authorizedRequest.get("/api/user/profile");
        expect(response.statusCode).toBe(200);
        expect(response.body.refreshTokens).toBeUndefined();
    });
});

describe("User put tests", () => {
    test("Test modify our user- unauthorized", async () => {
        user.name = "modified_name"
        const response = await request(app).put("/api/user").send(user);
        expect(response.statusCode).toBe(401);
    });

    test("Test modify our user", async () => {
        user.name = "modified_name"
        const response = await authorizedRequest.put("/api/user").send(user);
        expect(response.statusCode).toBe(200);
        expect(response.body.name).toEqual(user.name);
    });

    test("Test Get updated user- my user", async () => {
        const response = await authorizedRequest.get("/api/user/profile");
        expect(response.statusCode).toBe(200);
        expect(response.body.name).toEqual(user.name);
    });

    test("Test Get updated user- all users", async () => {
        const response = await request(app).get("/api/user");
        expect(response.statusCode).toBe(200);
        expect(response.body[0].name).toEqual(user.name);
    });
    test("Test modify our user- unauthorized", async () => {
        user.name = "modified_name"
        const response = await request(app).put("/api/user").send(user);
        expect(response.statusCode).toBe(401);
    });

    test("Test modify password- password is saved to db differently", async () => {
        const password = "1234567890";
        const response = await authorizedRequest.put("/api/user").send({ ...user, password });
        expect(response.statusCode).toBe(200);
        const modifiedUser = await User.findById(user._id).select('+password');
        expect(modifiedUser?.password).not.toBe(password);
    });
});
