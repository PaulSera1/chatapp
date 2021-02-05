import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Context from '../database';

dotenv.config();
const router = express.Router();
const db_context = new Context('./db.sqlite3');
const key: any = process.env.ACCESS_TOKEN_SECRET;

router.get("/:channelId/messages/:messageId", (req: Request, res: Response) => {
    const { channelId, messageId } = req.params;
    const user: any = jwt.verify(req.cookies.jwt, key);

    db_context.Channel.getChannel(channelId, channel => {
        if(!channel) return res.status(404).render('404');
        db_context.Room.getChannelUsers(channel, users => {
            if(!(users.map(user => user.user_id).includes(user.id))) return res.status(401).send('resource not available');
            db_context.Channel.getAllMessages(channel.id, messages => {
                db_context.Message.getMessage(messageId, msg => {
                    return res.render('channel', {
                        user: user.id,
                        users: users,
                        channel: channel,
                        messages: messages,
                        toMessage: msg ?? null
                    });
                })
            });
        });
    });
});

router.delete("/:channelId/messages/:messageId", (req: Request, res: Response) => {
    const { channelId, messageId } = req.params;
    const user: any = jwt.verify(req.cookies.jwt, key);

    db_context.Message.delete(messageId, user.id, (error) => {
        if(error) return res.status(500).send({message: 'error'});
        return res.send({message: 'ok'});
    });
})

export default router;
