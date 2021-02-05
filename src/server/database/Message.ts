import { UserObj } from './User';
import Model from './Base';
import { v4 as uuid } from 'uuid';
import { ChannelObj } from './Channel';

/** standard Message object */

interface MessageObj {
    id: number,
    content: string,
    date: string,
    author: UserObj
    channel: ChannelObj,
    edited: boolean
}

/**
 * Message table constructor.
 * @param source sqlite3 database location
 * @public
 */

class Message extends Model {

    constructor(source: string, ...args: any[]) {
        super(source);
    }

    /**
     * creates sqlite3 message table
     * columns include:
     * - id (primary key)
     * - hash (unique message hash)
     * - date (Date object [stringified in ISO format])
     * - author (user foreign key)
     * - channel (channel foreign key)
     * - edited (boolean whether message has been edited or not)
     * @param callback optional callback upon table creation
     * @returns callback
     */

    public createMessageTable(callback: () => void = () => null): void {
        this.database.run(`CREATE TABLE IF NOT EXISTS message (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hash TEXT NOT NULL,
            content TEXT NOT NULL,
            date TEXT NOT NULL,
            author INTEGER NOT NULL,
            channel INTEGER NOT NULL,
            edited INTEGER NOT NULL,
            FOREIGN KEY(author) REFERENCES user(id),
            FOREIGN KEY(channel) REFERENCES channel(id)
        )`, err => {
                if(err) {
                    console.error(err);
                    throw err;
                }
                return callback();
            });
    }

    /**
     * inserts new row in message table
     * @param content message text
     * @param date message creation timestamp
     * @param author id of author (user foreign key)
     * @param channel id of channel (channel foreign key)
     * @param callback optional callback upon completion
     * @returns callback
     */

    public insert(content: string, date: string, author: number, channel: number, callback: (newId: string) => void = () => null): void {
        const newId = uuid();
        this.database.run(`INSERT INTO message (
            hash, content, date, author, channel, edited)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [newId, content, date, author, channel, 0], err => {
                if(err) {
                    console.error(err);
                    throw err;
                }
                return callback(newId);
            }
        );
    }

    /**
     * queries message table for all rows
     * @param callback with message array passed
     * @returns callback
     */

    public getAllMessages(callback: (messages: any[]) => void = () => null) {
        this.database.all('SELECT * FROM message', (err, rows) => {
            if(err) {
                console.error(err);
                throw err;
            }
            return callback(rows);
        });
    }

    /**
     * returns first message with given hash (message id, **not** pk)
     * @param messageId unique message hash
     * @param callback callback with message passed
     * @returns callback
     */

    public getMessage(messageId: string, callback: (message: any) => void): void {
        this.database.get('SELECT * FROM message WHERE hash = ?', [messageId], (err, msg) => {
            if(err) {
                console.error(err);
                throw err;
            }
            return callback(msg);
        });
    }

    /**
     * deletes message from database
     * @param messageId unique message id string
     * @param user_id author (user) primary key
     * @param callback callback with success or not
     * @returns callback
     */

    public delete(messageId: string, user_id: number, callback: (error: boolean) => void): void {
        this.database.run('DELETE FROM message WHERE hash = ? AND author = ?', [messageId, user_id], function(err) {
            if(err) {
                console.error(err);
                throw err;
            }
            return callback(this.changes !== 1);
        });
    }

    /**
     * updates message from database
     * @param messageId unique message id string
     * @param newContent new message content
     * @param user_id author (user) primary key
     * @param callback callback with success or not
     * @returns callback
     */

    public update(messageId: string, newContent: string, user_id: number, callback: (error: boolean) => void): void {
        const sql = `UPDATE message
                     SET content = ?,
                         edited = ?
                     WHERE hash = ? AND author = ?`;
        this.database.run(sql, [newContent, 1, messageId, user_id], function(err) {
            if(err) {
                console.error(err);
                throw err;
            }
            return callback(this.changes !== 1);
        });
    }
}

export default Message;

export {
    MessageObj
};