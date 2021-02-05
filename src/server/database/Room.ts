import { ChannelObj } from './Channel';
import { UserObj } from './User';
import Model from './Base';

/** standard user object */

/**
 * Channel table constructor.
 * @param source sqlite3 database location
 * @public
 */

class Room extends Model {

    constructor(source: string, ...args: any[]) {
        super(source);
    }

    /**
     * creates sqlite3 room table. many-to-many relationship between Users and Channels
     * @param callback optional callback upon table creation
     * @returns callback
     */

    public createRoomTable(callback: () => void = () => null): void {
        this.database.run(`CREATE TABLE IF NOT EXISTS room (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            channel_id INTEGER,
            FOREIGN KEY(user_id) REFERENCES user(id),
            FOREIGN KEY(channel_id) REFERENCES channel(id)
        )`, err => {
                if(err) {
                    console.error(err);
                    throw err;
                }
                return callback();
            });
    }

    /**
     * inserts new row in channel table
     * @param name new channel name
     * @param ChannelId unique channel id
     * @param callback optional callback upon completion
     * @returns callback
     */

    public insert(userId: number, ChannelId: number, callback: () => void = () => null): void {
        this.database.run(`INSERT INTO room (
            user_id, channel_id)
            VALUES (?, ?)`,
            [userId, ChannelId], err => {
                if(err) {
                    console.error(err);
                    throw err;
                }
                return callback();
            }
        );
    }

    /**
     * queries room table for all users in a given channel
     * @param channel channel object
     * @param callback with user array passed
     * @returns callback
     */

    public getChannelUsers(channel: ChannelObj, callback: (data: any[]) => void): void {
        this.database.all(`SELECT * FROM user
                LEFT JOIN room ON room.user_id=user.id
                WHERE room.channel_id='${channel.id}'`,
            (error, rows) => {
                if(error) {
                    console.error(error);
                    throw error;
                }
                return callback(rows);
        });
    }

    /**
     * queries room table for all channels for a given user
     * @param user user object
     * @param callback with channel array passed
     * @returns callback
     */

    public getUserChannels(user: UserObj, callback: (data: any[]) => void): void {
        this.database.all(`SELECT * FROM channel
                LEFT JOIN room ON room.channel_id=channel.id
                WHERE room.user_id='${user.id}'`,
            (error, rows) => {
                if(error) {
                    console.error(error);
                    throw error;
                }
                return callback(rows);
        });
    }

    /**
     * checks whether a user is in a channel
     * @param userId user primary key
     * @param channelId channel primary key
     * @param callback with boolean value whether entry is a duplicate
     * @returns callback
     */

    public checkDuplicate(userId: number, channelId: number, callback: (isDuplicate: boolean) => void): void {
        this.database.get(`SELECT * FROM room
                WHERE user_id = ?
                AND channel_id = ?`, [userId, channelId], (error, row) => {
                    if(error) {
                        console.error(error);
                        throw error;
                    }
                    return callback(Boolean(row));
                });
    }

    /* for debugging purposes only */
    public getAllData(callback: (rows: any[]) => void): void {
        this.database.all('SELECT * FROM room', (err, rows) => {
            if(err) {
                console.error(err);
                throw err;
            }
            return callback(rows);
        })
    }
}

export default Room;

export {

};