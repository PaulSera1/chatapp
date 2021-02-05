import Model from './Base';

/** standard channel object */

interface ChannelObj {
    id: number,
    name: string,
    ChannelId: string
};

/**
 * Channel table constructor.
 * @param source sqlite3 database location
 * @public
 */

class Channel extends Model {

    constructor(source: string, ...args: any[]) {
        super(source);
    }

    /**
     * creates sqlite3 channel table
     * @param callback optional callback upon table creation
     * @returns callback
     */

    public createChannelTable(callback: () => void = () => null): void {
        this.database.run(`CREATE TABLE IF NOT EXISTS channel (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text,
            ChannelId text,
            CONSTRAINT ChannelId_unique UNIQUE (ChannelId)
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

    public insert(name: string, ChannelId: string, callback: () => void): void {
        this.database.run(`INSERT INTO channel (
            name, ChannelId)
            VALUES (?, ?)`,
            [name, ChannelId], err => {
                if(err) {
                    console.error(err);
                    throw err;
                }
                return callback();
            }
        );
    }

    /**
     * get channel by unique channel id
     * @param channelId channel's **unique** id
     * @param callback optional callback passed with row value
     * @returns callback
     */

    public getChannel(channelId: string, callback: (row: any) => void = () => null): void {
        this.database.get('SELECT * FROM channel WHERE ChannelId = ?', [channelId], (error, row) => {
            if(error) {
                console.error(error);
                throw error;
            }
            return callback(row);
        })
    }

    /**
     * queries channel table for all rows
     * @param callback with channel array passed
     * @returns callback
     */

    public getAllChannels(callback: (data: any[]) => void): void {
        this.database.all("SELECT * FROM channel", (error, rows) => {
            if(error) {
                console.error(error);
                throw error;
            }
            return callback(rows);
        });
    }

    /**
     * retrieves all messages for given channel
     * @param id channel id (foreign key)
     * @param callback with message array passed
     */

    public getAllMessages(id: number, callback: (data: any[]) => void): void {
        this.database.all(`SELECT hash AS id, content, date, edited, author, name, avatar, user_id
            FROM message INNER JOIN user ON message.author = user.id
            WHERE channel = ?`, [id], (error, rows) => {
            if(error) {
                console.error(error);
                throw error;
            }
            let output = [];
            for(const row of rows) {
                if(!row) break;
                output.push({
                    id: row.id,
                    content: row.content,
                    date: row.date,
                    edited: row.edited,
                    author: {
                        id: row.author,
                        user_id: row.user_id,
                        name: row.name,
                        avatar: row.avatar
                    }
                });
            }
            return callback(output);
        });
    }

    /**
     * get all valid invites for a given channel
     * @param ChannelId unique channel id (hash)
     * @param callback with invite array passed
     */

    public getChannelInvites(ChannelId: string, callback: (validChannel: boolean, invites: any[]) => void): void {
        this.database.get('SELECT * FROM channel WHERE ChannelId = ?', [ChannelId], (error, channel) => {
            if(error) {
                console.error(error);
                throw error;
            }
            if(!channel) return callback(false, []);
            this.database.all(`SELECT * FROM invite
                    LEFT JOIN channel ON channel.id = invite.channel_id
                    WHERE channel_id = ?`, [channel.id],
                (error, invites) => {
                    if(error) {
                        console.error(error);
                        throw error;
                    }
                    return callback(true, invites);
            });
        });
    }
}

export default Channel;

export { ChannelObj };