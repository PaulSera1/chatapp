import Model from './Base';
import { v4 as uuid } from 'uuid';

/** standard invite object */

/**
 * Invite table constructor.
 * @param source sqlite3 database location
 * @public
 */

class Invite extends Model {

    constructor(source: string, ...args: any[]) {
        super(source);
    }

    /**
     * creates sqlite3 invite table
     * @param callback optional callback upon table creation
     * @returns callback
     */

    public createInviteTable(callback: () => void = () => null): void {
        this.database.run(`CREATE TABLE IF NOT EXISTS invite (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT,
            channel_id INTEGER,
            CONSTRAINT code UNIQUE (code),
            FOREIGN KEY(channel_id) REFERENCES channel
        )`, err => {
                if(err) {
                    console.error(err);
                    throw err;
                }
                return callback();
            });
    }

    /**
     * inserts new row in invite table
     * @param channel_id unique channel id
     * @param callback optional callback upon completion
     * @returns callback
     */

    public insert(channel_id: number, callback: (code: string) => void = () => null): void {
        const code = uuid();
        this.database.run(`INSERT INTO invite (
            code, channel_id)
            VALUES (?, ?)`,
            [code, channel_id], err => {
                if(err) {
                    console.error(err);
                    throw err;
                }
                return callback(code);
            }
        );
    }

    /**
     * queries invite table for all rows
     * @param callback with invite array passed
     * @returns callback
     */

    public getAllInvites(callback: (data: any[]) => void): void {
        this.database.all("SELECT * FROM invite", (error, rows) => {
            if(error) {
                console.error(error);
                throw error;
            }
            return callback(rows);
        });
    }

    /**
     * validates invite and retrieves channel associated with invite
     * @param code unique invite code
     * @param callback with channel existence status and values passed
     */

    public validateInvite(code: string, callback: (valid: boolean, value: any|undefined) => void) {
        this.database.get("SELECT * FROM invite WHERE code = ?", [code], (error, row) => {
            if(error) {
                console.error(error);
                throw error;
            }
            if(!row) return callback(false, undefined);
            this.database.get("SELECT * FROM channel WHERE id = ?", [row.channel_id], (error, channel) => {
                if(error) {
                    console.error(error);
                    throw error;
                }
                return callback(true, channel);
            });
        });
    }
}

export default Invite;

export {

};