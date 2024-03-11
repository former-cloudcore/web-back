import { Express } from "express";
import supertest from "supertest";
import defaults from 'superagent-defaults'; import initApp from "../app";
import mongoose from "mongoose";
import User, { IUser } from "../models/user";
import Chat from "../models/chat";

let app: Express;
const user: IUser = {
    name: "chat-test-user1",
    email: "chat-test@chat.test",
    password: "123567890",
}

const user2: IUser = {
    name: "chat-test-user2",
    email: "chat-test2@chat.test",
    password: "dfsgs",
}
let chatId;
let accessToken = "";
let request;

beforeAll(async () => {
    app = await initApp();
    request = defaults(supertest(app));
    await User.deleteMany({ 'email': user.email });
    await User.deleteMany({ 'email': user2.email });
    const response = await request.post("/api/auth/register").send(user);
    user._id = response.body._id;
    accessToken = response.body.accessToken;
    request.set({ 'Authorization': `Bearer ${accessToken}` });
    await Chat.deleteMany();
});

afterAll(async () => {
    await User.deleteMany({ 'email': user.email });
    await User.deleteMany({ 'email': user2.email });
    // await Chat.deleteMany();
    await mongoose.connection.close();
});

describe("Chat tests", () => {
    test("Test Get All Chats for user- none", async () => {
        const response = await request.get("/api/chat");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
    });

    test("Test Create Chat", async () => {
        const response2 = await request.post("/api/auth/register").send(user2);
        user2._id = response2.body._id;
        const users = [user._id, user2._id]; // Replace with the actual users array
        const response = await request
            .post("/api/chat")
            .send({ users });
        expect(response.statusCode).toBe(200);
        expect(response.body.users).toEqual(users);
        chatId = response.body._id;
    });

    test("Test Get Chat by owner", async () => {
        const response = await request
            .get("/api/chat")
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
    });

    test("Test Post Message", async () => {
        const text = "Hello, world!";
        const response = await request
            .post(`/api/chat/messages`)
            .send({ chatId, text });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1); // Assuming the chat has one message after posting
        expect(response.body[0].text).toBe(text);
        expect(response.body[0].user).toBe(user._id);
    });

    test("Test Post a Message to an non-existent chat", async () => {
        const text = "Hello, world!";
        const response = await request
            .post(`/api/chat/messages`)
            .send({ chatId: "32193032", text });
        expect(response.statusCode).toBe(500);
    });

    test("Test Get Messages", async () => {
        const response = await request
            .get(`/api/chat/${chatId}/messages`)

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
    });

    test("Test Get Messages - Chat not found", async () => {
        const invalidChatId = "invalidChatId";
        const response = await request
            .get(`/api/chat/${invalidChatId}/messages`)

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ error: 'Internal server error' });
    });

    test("Test Get Chat by ID", async () => {
        const response = await request
            .get(`/api/chat/${chatId}`)
        expect(response.statusCode).toBe(200);
    });

    test("Test Get All Chats For User", async () => {
        const response = await request
            .get(`/api/chat/${user._id}/userChats`)
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
    });
});
