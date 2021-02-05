import User, { UserObj } from './User';
import Message, { MessageObj } from './Message';
import Channel, { ChannelObj } from './Channel';
import Invite from './Invite';
import Room from './Room';

/**
 * Context constructor. Serves all tables in the database.
 * @param source database source
 * @public
 */

class Context {
    public User: User;
    public Message: Message;
    public Channel: Channel;
    public Room: Room;
    public Invite: Invite;
    private databases: any[];

    constructor(source: string, ...args: any[]) {
        this.User = new User(source);
        this.Message = new Message(source);
        this.Channel = new Channel(source);
        this.Invite = new Invite(source);
        this.Room = new Room(source);
        this.databases = [this.User, this.Message, this.Channel, this.Invite, this.Room]
    }

    /**
     * configures database and creates tables if needed
     * @param callback optional callback
     * @returns callback
     */

    public async configure(callback: () => void = () => null): Promise<void> {
        for(const model of this.databases) {
            const creationMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(model))
                .filter(method => method.match(new RegExp('^create', 'g')));
            for(const builder of creationMethods) {
                try { await model[builder](); }
                catch(err) { console.error(err); }
                finally { console.log(`${model.constructor.name} is ready`); }
            }
            return callback();
        }
    }
}

export default Context;

export {
    User,
    Message,
    Channel,
    Invite,
    Room,
    UserObj,
    MessageObj,
    ChannelObj,
};