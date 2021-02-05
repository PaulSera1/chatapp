import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const DOMAIN = process.env.DOMAIN;

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if(req.cookies.jwt)
        return next();
    res.redirect(`//${DOMAIN}/login`);
}

export {
    isAuthenticated
};
