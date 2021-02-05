import express, { Request, Response, NextFunction } from 'express';
import * as http from 'http';
import path from 'path';
import * as ws from 'socket.io';
import dotenv from 'dotenv';
import { ChannelRouter, InviteRouter } from './routers'
import Context from './database';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import * as jwt from 'jsonwebtoken';
import { isAuthenticated } from './middleware';

dotenv.config();

const app = express();
const srv = http.createServer(app);
const io = new ws.Server(srv);
const port = process.env.SERVER_PORT;
const db_context = new Context('./db.sqlite3');
db_context.configure();

interface Error {
    status?: number,
    message?: string
};

interface Message {
    content: string,
    jwt: string,
    channelId: number,
    room: string
};

app.set('views', path.join(__dirname, './../src/views/pages'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, './../src/views')));
app.use(cookieParser());

const secret: string = String(process.env.ACCESS_TOKEN_SECRET);

app.get("/", isAuthenticated, (req: Request, res: Response) => {
    res.redirect('/channels/dashboard');
});

app.post("/validate", bodyParser.urlencoded({extended: false}), (req: Request, res: Response) => {
    db_context.User.insert(req.body.username, req.body.password, req.body.email, req.body.avatar, () => res.send({message: 'success'}));
});

app.get("/login", (req: Request, res: Response) => {
    res.render('signin');
});

app.post("/login", bodyParser.urlencoded({extended: false}), (req: Request, res: Response) => {
    db_context.User.validateUser(req.body.password, req.body.email, (error, row) => {
        if(error || !row) return res.status(401).send();
        const payload: string = jwt.sign({
            id: row.id,
            client_id: row.user_id,
            username: row.name,
            email: row.email,
            avatar: row.avatar
        }, secret, {algorithm: 'HS256'});
        res.cookie('jwt', payload);
        res.send({message: 'success', token: payload});
    });
});

app.get("/signup", (req: Request, res: Response) => {
    res.render('signup');
});

app.get("/logout", (req: Request, res: Response) => {
    res.clearCookie('jwt');
    res.clearCookie('channelList');
    return res.render('logout');
});

app.use('/channels', isAuthenticated, ChannelRouter);
app.use('/invite', isAuthenticated, InviteRouter);

/* default route: 404 error page */
app.use((req: Request, res: Response, next: NextFunction) => res.status(404).render('404'));

/* default server error */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).send('oops')
});

io.on('connection', (socket: ws.Socket) => {
    socket.on('room', (room: string) => {
        socket.join(room);
    });
    socket.on('disconnect', () => {
        // nothing
    });
    socket.on('chat message', (msg: Message) => {
        const userInfo = Object(jwt.verify(msg.jwt, secret));
        const date = new Date().toISOString();
        db_context.Message.insert(msg.content, date, userInfo.id, msg.channelId, newId => {
            io.sockets.in(msg.room).emit('chat message', {id: newId, content: msg.content, date: date, author: userInfo});
        });
    });
    type socketDelete = {
        hash: string,
        user: string,
        room: string
    };
    type socketEdit = {
        hash: string,
        user: string,
        room: string,
        newContent: string
    }
    socket.on('message delete', (data: socketDelete) => {
        const user: any = jwt.verify(data.user, secret);
        db_context.Message.delete(data.hash, user.id, err => {
            if(err) {
                console.error(err);
                throw err;
            }
            io.sockets.in(data.room).emit('message delete', data.hash);
        });
    });
    socket.on('edited message', (data: socketEdit) => {
        const user: any = jwt.verify(data.user, secret);
        db_context.Message.update(data.hash, data.newContent, user.id, err => {
            if(err) {
                console.error(err);
                throw err;
            }
            io.sockets.in(data.room).emit('edited message', {
                hash: data.hash,
                newContent: data.newContent
            });
        })
    });
});

srv.listen(port, () => console.log(`server listening at port ${port}`));
