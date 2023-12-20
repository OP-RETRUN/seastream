export type Message = MessagePositionReportClassA | MessageStaticAndVoyageRelatedData | MessageUnknown

export interface MessageUnknown {
	messageType: number;
}

export interface MessageStaticAndVoyageRelatedData {
	messageType: number;
	mmsi: number;
	aisVersion: number;
	imoNumber: number;
	callSign: string;
	vesselName: string;
	shipType: number;
	dimensions: {
			toBow: number;
			toStern: number;
			toPort: number;
			toStarboard: number;
	};
	draught: number;
	destination: string;
	dte: number;
}

export interface MessagePositionReportClassA {
	messageType: number;
	mmsi: number;
	navigationStatus: number;
	rateOfTurn: number;
	speedOverGround: number;
	positionAccuracy: number;
	longitude: number;
	latitude: number;
	courseOverGround: number;
	trueHeading: number;
	timestamp: number;
}

export const MESSAGE_TYPE_POSITION_REPORT = 1
export const MESSAGE_TYPE_STATIC_REPORT = 5

export class AISParser {


	// Converts AIS ASCII armoring to binary string
	private static aisToBinary(aisMessage: string): string {
		let binary = ''
		for (let i = 0; i < aisMessage.length; i++) {
			let charCode = aisMessage.charCodeAt(i)
			charCode -= 48
			if (charCode > 40) {
				charCode -= 8
			}
			let bin = charCode.toString(2)
			binary += '0'.repeat(6 - bin.length) + bin // Pad to 6 bits
		}
		return binary
	}

	// Extracts a bit range from a binary string
	private static getBits(binary: string, start: number, length: number): string {
		return binary.substring(start, start + length)
	}

	// Converts a binary string to a decimal number
	private static binaryToDecimal(binary: string): number {
		return parseInt(binary, 2)
	}

	public static parseAISMessage(message: string) : Message {

		const aisData = this.extractAISData(message)

		const binary = this.aisToBinary(aisData)

		const messageType = this.binaryToDecimal(this.getBits(binary, 0, 6))

		// Example: Handle a few message types
		switch (messageType) {
			case MESSAGE_TYPE_POSITION_REPORT:
			case 2:
			case 3:
				return this.parsePositionReportClassA(binary)
			case MESSAGE_TYPE_STATIC_REPORT:
				return this.parseStaticAndVoyageRelatedData(binary)
			default:
				return { messageType }
		}
	}

	static extractAISData(message: string): any {
		const parts = message.split(',')
		if (parts.length < 6 || (!parts[4].startsWith('B') && !parts[4].startsWith('A')&& !parts[4].startsWith('C'))) {
			throw new Error('Invalid AIS NMEA sentence')
		}
		return parts[5]
	}

	// Converts binary latitude or longitude to decimal
	private static binaryToLatLon(binary: string): number {
		let decimal = AISParser.binaryToDecimal(binary)
		// AIS uses 1/10000 minute, convert to degrees
		return decimal / 600000
	}

	private static formatString(binary: string): string {
		return binary.replace(/@/g, ' ').trim()
	}

	private static decodeSixBitASCII(binary: string): string {
		let text = ''
		for (let i = 0; i < binary.length; i += 6) {
			const charCode = this.binaryToDecimal(binary.substring(i, i + 6))
			if (charCode >= 32 && charCode < 64) {
				text += String.fromCharCode(charCode + 32)
			} else if (charCode >= 0 && charCode < 32) {
				text += String.fromCharCode(charCode + 64)
			}
		}
		return text
	}

	private static parseStaticAndVoyageRelatedData(binary: string): MessageStaticAndVoyageRelatedData {
		const mmsi = this.binaryToDecimal(this.getBits(binary, 8, 30))
		const aisVersion = this.binaryToDecimal(this.getBits(binary, 38, 2))
		const imoNumber = this.binaryToDecimal(this.getBits(binary, 40, 30))
		const callSign = this.decodeSixBitASCII(this.getBits(binary, 70, 42))
		const vesselName = this.decodeSixBitASCII(this.getBits(binary, 112, 120))
		const shipType = this.binaryToDecimal(this.getBits(binary, 232, 8))
		const toBow = this.binaryToDecimal(this.getBits(binary, 240, 9))
		const toStern = this.binaryToDecimal(this.getBits(binary, 249, 9))
		const toPort = this.binaryToDecimal(this.getBits(binary, 258, 6))
		const toStarboard = this.binaryToDecimal(this.getBits(binary, 264, 6))
		const draught = this.binaryToDecimal(this.getBits(binary, 294, 8)) / 10
		const destination = this.decodeSixBitASCII(this.getBits(binary, 302, 120))
		const dte = this.binaryToDecimal(this.getBits(binary, 422, 1))

		return {
			messageType: MESSAGE_TYPE_STATIC_REPORT,
			mmsi,
			aisVersion,
			imoNumber,
			callSign: this.formatString(callSign),
			vesselName: this.formatString(vesselName),
			shipType,
			dimensions: { toBow, toStern, toPort, toStarboard },
			draught,
			destination: this.formatString(destination),
			dte
		}
	}

	private static parsePositionReportClassA(binary: string): MessagePositionReportClassA {
		const mmsi = this.binaryToDecimal(this.getBits(binary, 8, 30))
		const navigationStatus = this.binaryToDecimal(this.getBits(binary, 38, 4))
		const rateOfTurn = this.binaryToDecimal(this.getBits(binary, 42, 8))
		const speedOverGround = this.binaryToDecimal(this.getBits(binary, 50, 10)) / 10
		const positionAccuracy = this.binaryToDecimal(this.getBits(binary, 60, 1))
		const longitude = this.binaryToLatLon(this.getBits(binary, 61, 28))
		const latitude = this.binaryToLatLon(this.getBits(binary, 89, 27))
		const courseOverGround = this.binaryToDecimal(this.getBits(binary, 116, 12)) / 10
		const trueHeading = this.binaryToDecimal(this.getBits(binary, 128, 9))
		const timestamp = this.binaryToDecimal(this.getBits(binary, 137, 6))

		return {
			messageType: MESSAGE_TYPE_POSITION_REPORT,
			mmsi,
			navigationStatus,
			rateOfTurn,
			speedOverGround,
			positionAccuracy,
			longitude,
			latitude,
			courseOverGround,
			trueHeading,
			timestamp
		}
	}
}