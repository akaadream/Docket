import { DocSocketClient } from "./DocSocketClient";

export class WebSocketClient extends DocSocketClient {
    readonly username: string;
    readonly socket: WebSocket;

    constructor(address: string, username: string) {
        super(address);

        this.username = username;
        this.socket = new WebSocket(address);
        this.socket.onopen = function (_event) {

        }

        this.socket.onclose = function (_event) {

        }

        this.socket.onmessage = function (event) {
            const name = event.data.name;
            const options = event.data.options;
            if (name && options) {
                // TODO: create the message
            }
        }
    }

    public request(): void {
        
    }

    public service(): string {
        return "websocket";
    }
}