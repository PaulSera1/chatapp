import sqlite3 from 'sqlite3';

class Model {
    public readonly database: sqlite3.Database;

    constructor(source: string, ...args: any[]) {
        this.database = new sqlite3.Database(source);
    }
}

export default Model;
