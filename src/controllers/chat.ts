import {BaseController} from "./base_controller";
import {Response} from "express";
import {AuthRequest} from "../common/auth_middleware";
import Chat, {IChat} from "../models/chat";
import Message from "../models/message";

class ChatController extends BaseController<IChat> {
    constructor() {
        super(Chat);
    }

    async get(req: AuthRequest, res: Response) {
        req.body.owner = req.user._id;
        await super.get(req, res);
    }

    async getById(req: AuthRequest, res: Response) {
        req.body.owner = req.user._id;
        await super.getById(req, res);
    }

    async postMessage(req: AuthRequest, res: Response) {
        try {
            const {text, chatId} = req.body;
            const decodedText: string = decodeURIComponent(text);
            const requestedChat: IChat = await this.model.findById(chatId).select('messages');
            if (!requestedChat) {
                throw 'Chat not found';
            }

            const message = new Message({text: decodedText, user: req.user._id});
            requestedChat.messages.push(message);
            const updatedChat = await this.model.findByIdAndUpdate(chatId, requestedChat, {new: true});
            res.status(200).json(updatedChat.messages);
        } catch (err) {
            res.status(500).json({error: err.message});
        }
    }

    async getUserChats(req: AuthRequest, res: Response) {
        try {
            const userId = req.user._id;
            const chats = await this.model.find({users: userId});
            res.json(chats);
        } catch (error) {
            res.status(500).json({error: 'Internal server error'});
        }
    }

    async getMessages(req: AuthRequest, res: Response) {
        try {
            const {id} = req.params;
            const chat = await Chat.findById(id).populate('messages');
            if (!chat) {
                return res.status(404).json({error: 'Chat not found'});
            }

            res.json(chat.messages);
        } catch (error) {
            res.status(500).json({error: 'Internal server error'});
        }
    }

    async createChat(req: AuthRequest, res: Response) {
        try {
            const {users} = req.body;
            const chat = new Chat({users});
            await chat.save();
            res.json(chat);
        } catch (error) {
            res.status(500).json({error: 'Internal server error'});
        }
    }
}

export default new ChatController();
