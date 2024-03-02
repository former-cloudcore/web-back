import { BaseController } from "./base_controller";
import { Response } from "express";
import { AuthRequest } from "../common/auth_middleware";
import User, { IUser } from "../models/user";

class UserController extends BaseController<IUser>{
    constructor() {
        super(User)
    }

    async get(req: AuthRequest, res: Response) {
        try {
            const users = await this.model.find();

            // Set default image for users with no image
            const usersWithDefaultImage = users.map(user => {
                if (!user.image || user.image === "" || user.image === "/path/to/image") {
                    user.image = process.env.DEFAULT_PICTURE_PATH
                }
                return user;
            });

            res.send(usersWithDefaultImage);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async getById(req: AuthRequest, res: Response) {
        req.params.id = req.user._id;
        super.getById(req, res);
    }

    async put(req: AuthRequest, res: Response) {
        req.body._id = req.user._id;
        super.put(req, res);
    }
}

export default new UserController();
