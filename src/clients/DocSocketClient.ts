import { Message, MessageType } from "../utils/Message";

export class DocSocketClient {
    readonly messages: Message[];
    
    constructor() {
        this.messages = [];
    }

    public request(name: string, args: string): void {
        this.messages.push(new Message(name, args, MessageType.REQUEST));
    }

    protected reponse(name: string, obj: object): void {
        this.messages.push(new Message(name, JSON.stringify(obj, null, 2), MessageType.RESPONSE));
    }

    public message(name: string): void {

    }
}