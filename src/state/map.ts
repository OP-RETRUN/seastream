import { MESSAGE_TYPE_POSITION_REPORT, MESSAGE_TYPE_STATIC_REPORT, Message, MessagePositionReportClassA, MessageStaticAndVoyageRelatedData } from '../parser/parser'
import { Vessel } from './vessel'
import { BehaviorSubject, Subject } from 'rxjs'

export interface AISMapEventSpawn {
	name: string
	mmsi: number
}

export interface AISMapEventPosition {
	mmsi: number
	long: number
	lat: number
}

export class AISMap {

	spawn$ = new Subject<AISMapEventSpawn>()
	position$ = new Subject<AISMapEventPosition>()

	constructor(private registry = new Map<number, Vessel>()) {}

	list(){
		return Array.from(this.registry.entries())
	}

	applyMessage(message: Message) {
		switch (message.messageType) {
			case MESSAGE_TYPE_POSITION_REPORT: {
				const msg = message as MessagePositionReportClassA
				const vessel = this.registry.get(msg.mmsi)
				if (vessel) {
					vessel.lat = msg.latitude
					vessel.long = msg.longitude
					this.registry.set(vessel.mmsi, vessel)
					this.position$.next({
						mmsi: msg.mmsi,
						long: msg.longitude,
						lat: msg.latitude,
					})
				}
				// console.log(`position of mmsi ${message.mmsi} reported as longitude ${message.longitude.toFixed(2)} latitude ${message.latitude.toFixed(2)} speed ${message.speedOverGround}`)
				break
			}
			case MESSAGE_TYPE_STATIC_REPORT: {
				const msg = message as MessageStaticAndVoyageRelatedData
				const vessel = this.registry.get(msg.mmsi)
				if (vessel) {
					if(vessel.name != msg.vesselName){
						vessel.name = msg.vesselName
						this.registry.set(vessel.mmsi, vessel)
					}
				} else {
					this.registry.set(msg.mmsi, {
						name: msg.vesselName,
						mmsi: msg.mmsi,
					})
					this.spawn$.next({
						mmsi: msg.mmsi,
						name: msg.vesselName,
					})
				}
				// console.log(`report mmsi ${message.mmsi} as ${message.vesselName.replace(/\@/g, ' ').trim()} callSign ${message.callSign.replace(/\@/g, ' ').trim()}`)

				break
			}
		}
	}

}