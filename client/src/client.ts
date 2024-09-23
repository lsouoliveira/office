import { io, Socket } from "socket.io-client";

class Client {
    public socket: Socket;

    constructor(url: string, credentials: any) {
        this.socket = io(url);
        this.socket.auth = {
            username: credentials.username,
            sessionId: credentials.sessionId,
        }
    }

    moveTo(x: number, y: number) {
        this.socket.emit('player:move', { x, y });
    }
}

export {
    Client
}
