import { Socket } from 'bun'
import { TCP_CLIENT_HOST, TCP_CLIENT_PORT } from '../config/tcp-client.config'

export interface AISProviderTCPOptions {
	hostname?: string
	port?: number
	onMessage?: (message: string) => void 
}

export class AISProviderTCP {

	private buffer = ''

	private socket?: Socket

	hostname: string
	port: number

	constructor(private options: AISProviderTCPOptions = {}) {
		this.hostname = options.hostname || TCP_CLIENT_HOST
		this.port = options.port || TCP_CLIENT_PORT
	}


	public extractStandardNMEAPart(sentence: string): string {
		const startIndex = sentence.search(/!B(1|2|S)VD(O|M)/)
		if (startIndex === -1) {
			throw new Error('Invalid AIS NMEA sentence')
		}
		// Extract and return the standard NMEA part
		return sentence.substring(startIndex)
	}

	close = () => this.socket?.end()

	async connect(){
		this.socket = await Bun.connect({
			hostname: this.hostname,
			port: this.port,
			socket: {
				data: (_socket, data) => {

					this.buffer += data.toString('ascii')

					const sentences = this.buffer.split(/\r?\n/)
					const completeSentences = sentences.slice(0, -1) // All but the last (potentially incomplete)
					const incompleteSentence = sentences[sentences.length - 1]

					
					completeSentences.forEach(sentence => {
						if(this.options.onMessage !== undefined){
							this.options.onMessage(this.extractStandardNMEAPart(sentence))
						}
						
					})

					this.buffer = incompleteSentence

				},
				open: () => console.info(`socket to NMEA sentence source established on ${this.hostname} ${this.port}`),
				close: () => console.info(`socket closed`),
				error: (_socket, error) => console.error(`socket error ${error}`),
				connectError: (_socket, error) => console.error(`socket connection error ${error}`),
			},
		})
	}
}