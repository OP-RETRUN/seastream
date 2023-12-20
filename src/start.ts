import { AISProviderTCP } from './provider/tcp.provider'
import { AISParser, MESSAGE_TYPE_POSITION_REPORT, MESSAGE_TYPE_STATIC_REPORT } from './parser/parser'
import { SeaStreamServiceWebsocket } from './service/websocket.service'
import { AISMap } from './state/map'


const map = new AISMap()
map.spawn$.subscribe(spawn=>{
	websocketService.publish(JSON.stringify(spawn))
})
map.position$.subscribe(position=>{
	websocketService.publish(JSON.stringify(position))
})

const websocketService = new SeaStreamServiceWebsocket(map)
websocketService.connect()

const provider = new AISProviderTCP({
	onMessage: (msg) => {
		try {
			const message : any = AISParser.parseAISMessage(msg)
			map.applyMessage(message)
		} catch (error) {
			console.error("Error parsing message:", msg, error)
		}
	}
})

provider.connect()