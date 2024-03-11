import express from "express";
const router = express.Router();
import postRouter from "./post";
import userRouter from "./user";
import chatRouter from "./chat";
import authRouter from "./auth";
import fileRouter from "./file";

router.use("/post", postRouter);
router.use("/chat", chatRouter);
router.use("/user", userRouter);
router.use("/auth", authRouter);
router.use("/file", fileRouter);
router.use("/public", express.static("public"));

export default router;