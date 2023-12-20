import { ServerWebSocket } from 'bun'
import { AISMap } from '../state/map'
import { WEBSOCKET_SERVER_PORT } from '../config/websocket-server.config'

export class SeaStreamServiceWebsocket {

	private channels?: ServerWebSocket<unknown>[] = []

	constructor(private aisMap?: AISMap){ }

	publish(message: string){
		this.channels?.forEach(ws=>ws.send(message))
	}

	connect(){
		console.info(`start websocket server on port ${WEBSOCKET_SERVER_PORT}`)
		Bun.serve({
			port: WEBSOCKET_SERVER_PORT,
			fetch(req, server) {
				// upgrade the request to a WebSocket
				if (server.upgrade(req)) {
					return; // do not return a Response
				}
				return new Response("Upgrade failed :(", { status: 500 });
			},
			websocket: {
				message: (ws) => {
					const currentList = this.aisMap?.list()
					if(currentList){
						ws.send(JSON.stringify(currentList))
					}
				},
				close: (ws) =>{
					console.log(`ws connection closed with ${ws.remoteAddress}`)
				},
				open: (ws) => {
					const currentList = this.aisMap?.list()
					if(currentList){
						ws.send(JSON.stringify(currentList))
					}
					this.channels?.push(ws)
					console.log(`ws connection open with ${ws.remoteAddress}`)
					ws.subscribe('raw')
				}
			},
		});
	}
}