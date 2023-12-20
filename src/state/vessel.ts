export class Vessel {
	
	public long?: number
	public lat?: number
	public speed?: number

	constructor(public mmsi: number, public name: string) {}

}