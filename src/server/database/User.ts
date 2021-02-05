import Model from './Base';
import md5 from 'md5';
import { nanoid } from 'nanoid';

/** standard user object */

interface UserObj {
    id: number,
    user_id: string,
    name: string,
    password: string,
    email: string,
    avatar: string,
    superuser: number
};

function uniqueId(): string {
    return nanoid(18);
}

/**
 * User table constructor.
 * @param source sqlite3 database location
 * @public
 */

class User extends Model {

    constructor(source: string, ...args: any[]) {
        super(source);
    }

    /**
     * creates sqlite3 user table
     * @param email sets whether email is recorded, default true
     * @param callback optional callback upon table creation
     * @returns callback
     */

    public createUserTable(email: boolean = true, callback: () => void = () => null): void {
        this.database.run(`CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id text,
            name text,
            ${email && 'email text UNIQUE,'}
            password text,
            avatar text,
            superuser INTEGER,
            CONSTRAINT email_unique UNIQUE (email)
        )`, err => {
                if(err) {
                    console.error(err);
                    throw err;
                }
                return callback();
            });
    }

    /**
     * inserts new row in user table
     * @param userId new unique user id
     * @param username new username
     * @param password new password to be stored as hash
     * @param email new email
     * @param avatar new avatar
     * @param callback optional callback upon completion
     * @returns callback
     */

    public insert(username: string, password: string, email: string, avatar: string = 'basic', callback: () => void = () => null): void {
        this.database.run(`INSERT INTO user (
            user_id, name, email, password, avatar, superuser)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [uniqueId(), username, email, md5(password), avatar, 0], err => {
                if(err) {
                    console.error(err);
                    throw err;
                }
                return callback();
            }
        );
    }

    /**
     * queries user table for all rows
     * @param callback with user array passed
     * @returns callback
     */

    public getAllUsers(callback: (data: any[]) => void): void {
        this.database.all("SELECT * FROM user", (error, rows) => {
            if(error) {
                console.error(error);
                throw error;
            }
            return callback(rows);
        });
    }

    /**
     * queries all messages for given User
     * @param user User object to search by
     * @param callback with message array passed
     * @returns callback
     */

    public getAllMessages(user: UserObj, callback: (data: any[]) => void = () => null): void {
        this.database.all(`SELECT * FROM message WHERE author = ${user.id}`, (error, rows) => {
            if(error) {
                console.error(error);
                throw error;
            }
            return callback(rows)
        })
    }

    /**
     * validates user data against table
     * @param password unhashed pwd
     * @param email user email (should be unique)
     * @param callback with selected object passed
     * @returns callback
     */

    public validateUser(password: string, email: string, callback: (error: number | undefined, data: UserObj) => void): void {
        this.database.get(`SELECT * FROM user WHERE email='${email}'`, [], (error, row) => {
            if((error || !row) || row.password !== md5(password)) {
                return callback(401, row);
            }
            return callback(undefined, row);
        });
    }

    /**
     * updates avatar
     * @param email unique email
     * @param newAvatar new avatar file name
     * @param callback optional callback upon completion
     */

    public updateUserAvatar(client_id: string, newAvatar: string, callback: () => void = () => null): void {
        this.database.run(`UPDATE user SET avatar = ? WHERE user_id = ?`, [newAvatar, client_id], err => {
            if(err) return console.error(err)
        });
        return callback();
    }

    /**
     * gets UserObj by unique client_id
     * @param client_id unique client_id
     * @param callback callback upon completion with UserObj passed
     */

    public getUser(client_id: string, callback: (user: UserObj) => void): void {
        this.database.get(`SELECT * FROM user WHERE user_id='${client_id}'`, (err, user) => {
            if(err) {
                console.error(err);
                throw err;
            }
            else {
                return callback(user);
            }
        });
    }
}

export default User;

export { UserObj, uniqueId };