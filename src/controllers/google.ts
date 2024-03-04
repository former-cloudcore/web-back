import { Request, Response } from 'express';
import User from '../models/user';
import { OAuth2Client } from 'google-auth-library';
import authController from "./auth";

const client = new OAuth2Client();

export const googleSignIn = async (req: Request, res: Response) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: req.body.credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload?.email;
        if (email) {
            let user = await User.findOne({ 'email': email });
            if (!user) {
                // create user in db if it doesn't already exist
                user = await User.create(
                    {
                        'email': email,
                        'password': '',
                        'image': payload?.picture
                    });
            }
            const tokens = await authController.createTokens(user)
            res.status(200).send(
                {
                    email: user.email,
                    _id: user._id,
                    image: user.image,
                    ...tokens
                })
        } else {
            res.status(401).send("email or password incorrect");
        }
    } catch (err) {
        return res.status(400).send(err.message);
    }

}