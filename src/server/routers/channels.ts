import express, { Router, Request, Response } from 'express';
import Context from '../database';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import sharp from 'sharp';
import fs from 'fs';
import MessageRouter from './message';

dotenv.config();

const router: Router = express.Router();
const db_context = new Context('./db.sqlite3');
const key: any = process.env.ACCESS_TOKEN_SECRET;

router.use(MessageRouter);

const upload = multer({
    limits: {
        fileSize: 100000000
    }
}).single('avatar')

// channel list
// display all channels for user, main panel
router.get("/dashboard", (req: Request, res: Response) => {
    const token: any = jwt.verify(req.cookies.jwt, key);
    db_context.Room.getUserChannels(token, channels => {
        res.cookie('channelList', JSON.stringify(channels));
        db_context.User.getUser(token.client_id, user =>
            res.render('index', {
                user: user,
                channels: channels,
            })
        );
    });
});

// hell
// absolute hell
// somewhat efficient, but hell
router.post("/dashboard", bodyParser.urlencoded({extended: false}), (req: Request, res: Response) => {
    const currentUser: any = jwt.verify(req.cookies.jwt, key);
    db_context.User.getUser(currentUser.client_id, user => {
        const oldAvatar: string = user.avatar;
        upload(req, res, async function(err: any) {
            if(err || req.file === undefined) {
                console.error(err);
                res.send(err);
            }
            else {
                let fileName = uuid() + '.png';
                try {
                    let image = await sharp(req.file.buffer).resize({width: 128, height: 128}).png({
                        quality: 100
                    }).toFile('src/views/assets/' + fileName).catch(err => { console.error(err); throw err; });
                } catch { return res.status(500).send({error: 'unsupported type'}); }
                (oldAvatar !== 'black.png') && fs.unlink(`src/views/assets/${oldAvatar}`, (err) => {
                    if(err) console.error(err);
                });
                const secret: any = process.env.ACCESS_TOKEN_SECRET;
                const payload = jwt.sign({
                    id: user.id,
                    client_id: user.user_id,
                    username: user.name,
                    email: user.email,
                    avatar: fileName
                }, secret, {algorithm: 'HS256'});
                res.cookie('jwt', payload);
                db_context.User.updateUserAvatar(currentUser.client_id, fileName, () => res.send({newAvatar: fileName}));
            }
        });
    });
});

// haven't even started on this god damn
router.get("/:channelId", (req: Request, res: Response) => {
    const { channelId } = req.params;
    const user: any = jwt.verify(req.cookies.jwt, key);
    db_context.Channel.getChannel(channelId, channel => {
        if(!channel) return res.status(404).render('404');
        db_context.Room.getChannelUsers(channel, users => {
            if(!(users.map(user => user.user_id).includes(user.id))) return res.status(401).send('resource not available');
            db_context.Channel.getAllMessages(channel.id, messages => {
                return res.render('channel', {
                    user: user.id,
                    users: users,
                    channel: channel,
                    messages: messages,
                    toMessage: null
                });
            });
        });
    });
});

router.get("/:channelId/invites", (req: Request, res: Response) => {
    const { channelId } = req.params;
    const channelList = JSON.parse(req.cookies.channelList) ?? null;
    if(!channelList.map((channel: any) => channel.ChannelId).includes(channelId)) return res.status(403);
    db_context.Channel.getChannelInvites(channelId, (valid, invites) => {
        if(!valid) return res.status(404).render('404');
        return res.render('channel-invites', {
            invites: invites
        });
    });
});

router.post("/:channelId", (req: Request, res: Response) => {
    const { channelId } = req.params;
    db_context.Channel.getChannel(channelId, channel => {
        if(!channel) return res.status(404).render('404');
        else {
            const user: any = jwt.verify(req.cookies.jwt, key);
            db_context.Room.checkDuplicate(user.id, channel.id, isDuplicate => {
                if(!isDuplicate)
                    db_context.Room.insert(user.id, channel.id);
                return res.send({message: 'ok'});
            });
        }
    });
});

export default router;