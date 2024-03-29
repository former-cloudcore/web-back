import express from "express";
const router = express.Router();
import userController from "../controllers/user";
import authMiddleware from "../common/auth_middleware";
/**
* @swagger
* tags:
*   name: User
*   description: The User API
*/

/**
* @swagger
* components:
*   securitySchemes:
*     bearerAuth:
*       type: http
*       scheme: bearer
*       bearerFormat: JWT
*/

/**
* @swagger
* components:
*   schemas:
*     User:
*       type: object
*       required:
*         - email
*         - name
*       properties:
*         id:
*           type: string
*           description: The user's id
*         email:
*           type: string
*           description: The user's email
*         name:
*           type: string
*           description: The user's name
*         image:
*           type: string
*           description: path to the user's profile image
*       example:
*         email: 'bob@gmail.com'
*         name: 'bobo'
*         image: '/path/to/image'
*/

/**
* @swagger
* components:
*   schemas:
*     BasicUser:
*       type: object
*       required:
*         - email
*         - name
*       properties:
*         id:
*           type: string
*           description: The user's id
*         name:
*           type: string
*           description: The user's name
*         image:
*           type: string
*           description: path to the user's profile image
*       example:
*         id: '1233'
*         name: 'bobo'
*         image: '/path/to/image'
*/

/**
* @swagger
* /user/profile:
*   get:
*     summary: Get user's data
*     tags: [User]
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: The user's data
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/User'
*       404:
*         description: Not Found
*       500:
*         description: Internal server error
*/
router.get("/profile", authMiddleware, userController.getById.bind(userController));

/**
* @swagger
* /user:
*   get:
*     summary: get all users
*     tags: [User]
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: all users
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                   $ref: '#/components/schemas/BasicUser'
*       500:
*         description: Internal server error
*/
router.get("/", userController.get.bind(userController));

/**
* @swagger
* /user:
*   put:
*     summary: modify a user
*     tags: [User]
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               email:
*                 type: string
*                 description: The user's email
*               name:
*                 type: string
*                 description: The user's name
*               password:
*                 type: string
*                 description: The user's password
*     responses:
*       200:
*         description: the modified user
*         content:
*           application/json:
*             schema:
*               items:
*                   $ref: '#/components/schemas/User'
*       406:
*         description: Not Acceptable
*/
router.put("/", authMiddleware, userController.put.bind(userController));

export default router;