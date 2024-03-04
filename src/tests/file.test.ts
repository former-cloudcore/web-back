import initApp from "../app";
import request from "supertest";
import mongoose from "mongoose";
import { Express } from "express";
import multer from "multer";

let app: Express;

beforeAll(async () => {
    app = await initApp();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("File Tests", () => {
    test("upload file", async () => {
        const filePath = "C:\Users\ofird\Pictures\Screenshots\Screenshot 2024-01-20 121523.png";

        const response = await request(app)
            .post("/file?file=123.png").attach('file', filePath);
        expect(response.statusCode).toEqual(200);
        let url = response.body.url;
        console.log(url);
        url = url.replace(/^.*\/\/[^/]+/, '')
        const res = await request(app).get(url)
        expect(res.statusCode).toEqual(200);
    });
});

describe("File Route Tests", () => {
    test("file route should use multer disk storage", () => {
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, 'public/');
            },
            filename: function (req, file, cb) {
                const ext = file.originalname.split('.')
                    .filter(Boolean) // removes empty extensions (e.g. `filename...txt`)
                    .slice(1)
                    .join('.');
                cb(null, Date.now() + "." + ext);
            }
        });

        // BEGIN: Test multer disk storage
        expect(storage.destination).toBeDefined();
        expect(storage.filename).toBeDefined();
        // END: Test multer disk storage
    });

    test("file route should use multer disk storage", () => {
        const filePath = "C:\Users\ofird\Pictures\Screenshots\Screenshot 2024-01-20 121523.png";

        const diskStorageSpy = jest.spyOn(multer, 'diskStorage');
        const upload=multer({ dest: 'public/'});
        upload.single(filePath);
        // Your code that calls multer.diskStorage...
    
        expect(diskStorageSpy).toHaveBeenCalledWith(expect.objectContaining({
            destination: expect.any(Function),
            filename: expect.any(Function)
        }));
    });
});