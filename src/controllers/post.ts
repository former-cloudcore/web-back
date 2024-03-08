import {BaseController} from "./base_controller";
import {Response} from "express";
import {AuthRequest} from "../common/auth_middleware";
import Post, {IPost} from "../models/post";
import {generateImage} from "../services/image_generator";

class PostController extends BaseController<IPost>{
    constructor() {
        super(Post)
    }

    async post(req: AuthRequest, res: Response) {
        req.body.createdBy = req.user._id;

        if (req.body.image_prompt) {
            generateImage(req.body.image_prompt).then((image) => {
                req.body.image = image;
                super.post(req, res);
            }).catch((err) => {
                console.error(err);
                res.status(400).send("failed to generate image")
            });
        } else {
            super.post(req, res);
        }
    }

    async get(req: AuthRequest, res: Response) {
        const posts = await this.model.find().populate('createdBy', 'name image');
        const modifiedPosts = posts.map(post => {
            const postObj = post.toObject();
            const comments_amount = postObj.comments.length;
            delete postObj.comments;
            postObj.comments_amount = comments_amount;
            return postObj;
        });
        res.send(modifiedPosts);
    }

    async getById(req: AuthRequest, res: Response) {
        super.getByIdPopulated(req, res, 'createdBy comments.user', 'name image');
    }

    async getByUserId(req: AuthRequest, res: Response) {
        try {
            const posts = await this.model.find({ createdBy: req.params.user_id }).select("-comments").populate('createdBy', 'name image');
            res.send(posts);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }

    async put(req: AuthRequest, res: Response) {
        try {
            const post = await Post.findById(req.body._id).select('createdBy');
            if (post.createdBy.toString() === req.user._id) await super.put(req, res);
            else {
                res.status(401).send();
            }
        } catch (err) {
            res.status(400).send(err.message);
        }
    }

    async deleteById(req: AuthRequest, res: Response) {
        try {
            const post = await Post.findById(req.params.id)?.select('createdBy');
            if (post.createdBy.toString() === req.user._id) await super.deleteById(req, res);
            else {
                res.status(401).send();
            }
        } catch (err) {
            res.status(400).send(err.message);
        }
    }

    async like(req: AuthRequest, res: Response) {
        const postId = req.params.id;
        try {
            const requestedPost: IPost = await this.model.findById(postId).select('usersWhoLiked');
            if (requestedPost.usersWhoLiked.find(id => id.toString() === req.user._id)) {
                throw ("failed, can't like an already liked post");
            } else {
                const _id = req.user._id;
                requestedPost.usersWhoLiked.push(_id);
                const obj = await this.model.findByIdAndUpdate(postId, requestedPost, { new: true });
                res.status(200).send(obj);
            }
        }
        catch (err) {
            res.status(406).send(err.message)
        }
    }

    async unlike(req: AuthRequest, res: Response) {
        const postId = req.params.id;
        try {
            const requestedPost: IPost = await this.model.findById(postId);
            if (!requestedPost.usersWhoLiked.find(id => id.toString() === req.user._id)) {
                throw ("failed, can't unlike an already unliked post");
            } else {
                requestedPost.usersWhoLiked = requestedPost.usersWhoLiked.filter(id => id === req.user._id)
                const obj = await this.model.findByIdAndUpdate(postId, requestedPost, { new: true });
                res.status(200).send(obj);
            }
        }
        catch (err) {
            res.status(406).send(err.message)
        }
    }

    async comment(req: AuthRequest, res: Response) {
        const comment = { text: req.body.text, user: req.user._id };
        const postId = req.params.id;
        try {
            let requestedPost: IPost = await this.model.findById(postId);
            requestedPost.comments.push(comment);
            const obj = await this.model.findByIdAndUpdate(postId, requestedPost, { new: true });
            res.status(201).send(obj);
        }
        catch (err) {
            res.status(406).send(err.message)
        }
    }
}

export default new PostController();
