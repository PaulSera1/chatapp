import express, { Router, Request, Response } from 'express';
import Context from '../database';
import dotenv from 'dotenv';

dotenv.config();

const router: Router = express.Router();
const db_context = new Context('./db.sqlite3');
const key: any = process.env.ACCESS_TOKEN_SECRET;

router.get('/:inviteCode', (req: Request, res: Response) => {
    const { inviteCode } = req.params;
    db_context.Invite.validateInvite(inviteCode, (status, channel) => {
        if(!status) res.status(404).render('404');
        else {
            return res.render('invite-page', {
                channel: channel
            });
        }
    });
});

export default router;