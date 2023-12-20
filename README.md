# SeaStream AIS Maritime Data Parser 🌊📡🛠️

## Ahoy There! Welcome Aboard the SeaStream AIS Parser! ⚓🎉

Hello, ocean enthusiasts and data sailors! 🌐👋 We're thrilled to introduce **SeaStream AIS Parser** - your ultimate open-source tool for navigating through the vast ocean of NMEA messages! 🚢🌊

This project is designed to efficiently parse and process a sea of AIS (Automatic Identification System) messages, making it easier for you to handle maritime data like a seasoned captain! 🧭👨‍✈️

## What Can SeaStream AIS Parser Do? 🤔💡

- **Parse NMEA Messages**: Effortlessly decode a multitude of NMEA message formats. 📃🔍
- **Handle Massive Data**: Designed to process large volumes of data without sinking under the weight. 📊🏋️‍♂️
- **Extract Valuable Insights**: Turn raw data into valuable insights about maritime traffic and trends. 📈🚤
- **Open-Source Voyage**: As an open-source project, we welcome all hands on deck to contribute and improve. 🤝💻

## Setting Sail with SeaStream 🛠️⛵

Getting started is as easy as hoisting the sails:

```bash
git clone https://github.com/OP-RETRUN/seastream

docker-compose up

```


## Introduction to AIS

Automatic Identification System (AIS) is a tracking system used on ships and by vessel traffic services (VTS) for identifying and locating vessels through the exchange of electronic data with other nearby ships, AIS base stations, and satellites. AIS aims to enhance maritime safety, navigation, and environmental protection.

### AIS Messages Overview

AIS messages are used to communicate various types of information:

- **Static Information**: Such as vessel name, dimensions, and type.
- **Voyage-Related Information**: Such as destination, ETA, and type of cargo.
- **Dynamic Information**: Such as position, course, and speed.

These messages are crucial for collision avoidance, traffic management, and maritime security.

### Encoding of AIS Messages

AIS messages are uniquely encoded to ensure efficient transmission over the VHF radio frequency. The encoding involves several steps:

#### 1. Six-Bit ASCII Armoring

- AIS uses a six-bit ASCII encoding, which is a modified version of the standard ASCII.
- Each character is represented by six bits instead of the usual eight. This allows for a more compact representation, suitable for VHF data transmission.
- The six-bit characters include a range of standard alphanumeric characters and some special characters.

#### 2. Binary Message Structure

- Each AIS message is structured as a sequence of binary fields.
- The fields represent different pieces of information, depending on the message type.
- For example, a common message type for position reports (Types 1, 2, and 3) includes fields for position coordinates, time stamp, vessel status, and more.

#### 3. Bit-Level Manipulation

- Fields within AIS messages are packed at the bit level. This means that a field can start and end at any bit within the message, not just on byte boundaries.
- This packing requires careful bit-level manipulation to parse and construct messages.

#### 4. Checksum for Integrity

- Each AIS message includes a checksum for error checking.
- The checksum is calculated using the XOR of all the characters in the sentence.

### Parsing AIS Messages

Parsing AIS messages involves:

- Decoding the six-bit ASCII characters into a binary format.
- Extracting the relevant bits for each field in the message.
- Interpreting these bits according to the specification of


### AIS Messages

| Field Name             | Type    | Start Position | Size (bits) |
|------------------------|---------|----------------|-------------|
| Message Type           | Integer | 0              | 6           |
| Repeat Indicator       | Integer | 6              | 2           |
| MMSI                   | Integer | 8              | 30          |
| AIS Version            | Integer | 38             | 2           |
| IMO Number             | Integer | 40             | 30          |
| Call Sign              | String  | 70             | 42          |
| Vessel Name            | String  | 112            | 120         |
| Ship Type              | Integer | 232            | 8           |
| Dimension to Bow       | Integer | 240            | 9           |
| Dimension to Stern     | Integer | 249            | 9           |
| Dimension to Port      | Integer | 258            | 6           |
| Dimension to Starboard | Integer | 264            | 6           |
| Position Fix Type      | Integer | 270            | 4           |
| ETA Month              | Integer | 274            | 4           |
| ETA Day                | Integer | 278            | 5           |
| ETA Hour               | Integer | 283            | 5           |
| ETA Minute             | Integer | 288            | 6           |
| Draught                | Float   | 294            | 8           |
| Destination            | String  | 302            | 120         |
| DTE                    | Integer | 422            | 1           |
| Spare                  | Integer | 423            | 1           |


#### Position Report Class A

This message type is used by Class A transceivers for periodic position reporting.

| Field Name             | Type    | Start Position | Size (bits) | Description                                                        |
|------------------------|---------|----------------|-------------|--------------------------------------------------------------------|
| Message Type           | Integer | 0              | 6           | Identifies the message type; '1' for Position Report Class A.      |
| Repeat Indicator       | Integer | 6              | 2           | Indicates how many times the message has been repeated.            |
| MMSI                   | Integer | 8              | 30          | Unique Maritime Mobile Service Identity for the vessel.            |
| Navigation Status      | Integer | 38             | 4           | Status of the vessel, such as at anchor, under way, etc.           |
| Rate of Turn           | Integer | 42             | 8           | Rate at which the vessel is turning.                               |
| Speed Over Ground      | Float   | 50             | 10          | Current speed over ground in knots.                                |
| Position Accuracy      | Integer | 60             | 1           | Accuracy of the position fix; 1=high (<=10m), 0=low (>10m).        |
| Longitude              | Float   | 61             | 28          | Current longitude in decimal degrees.                              |
| Latitude               | Float   | 89             | 27          | Current latitude in decimal degrees.                               |
| Course Over Ground     | Float   | 116            | 12          | Current course over ground in degrees.                             |
| True Heading           | Integer | 128            | 9           | True heading of the vessel in degrees.                             |
| Timestamp              | Integer | 137            | 6           | UTC second when the report was generated.                          |
| Maneuver Indicator     | Integer | 143            | 2           | Indicates if the vessel is currently performing a maneuver.        |
| Spare                  | Integer | 145            | 3           | Spare bits, reserved for future use.                               |
| RAIM Flag              | Integer | 148            | 1           | Receiver Autonomous Integrity Monitoring flag.                     |
| Communication State    | Integer | 149            | 19          | Information about the communication state.                         |

#### Static and Voyage Related

Static and Voyage Related Data, is a complex message format used in the Automatic Identification System (AIS) to transmit static information about a vessel. This message is encoded in binary and contains various fields, each occupying a specific position and size within the message.

| Field Name             | Type    | Start Position | Size (bits) | Description                                                                 |
|------------------------|---------|----------------|-------------|-----------------------------------------------------------------------------|
| Message Type           | Integer | 0              | 6           | Identifies the message type; always '5' for Static and Voyage Related Data. |
| Repeat Indicator       | Integer | 6              | 2           | Indicates how many times the message has been repeated.                     |
| MMSI                   | Integer | 8              | 30          | Unique Maritime Mobile Service Identity for the vessel.                     |
| AIS Version            | Integer | 38             | 2           | Version of the AIS equipment used.                                          |
| IMO Number             | Integer | 40             | 30          | International Maritime Organization number, unique reference for ships.     |
| Call Sign              | String  | 70             | 42          | Radio call sign assigned to the vessel, 7 characters encoded in 6 bits each.|
| Vessel Name            | String  | 112            | 120         | Name of the vessel, 20 characters encoded in 6 bits each.                   |
| Ship Type              | Integer | 232            | 8           | Type of ship and cargo type.                                                |
| Dimension to Bow       | Integer | 240            | 9           | Length from the GPS antenna to the bow of the vessel.                       |
| Dimension to Stern     | Integer | 249            | 9           | Length from the GPS antenna to the stern of the vessel.                     |
| Dimension to Port      | Integer | 258            | 6           | Width from the GPS antenna to the port side of the vessel.                  |
| Dimension to Starboard | Integer | 264            | 6           | Width from the GPS antenna to the starboard side of the vessel.             |
| Position Fix Type      | Integer | 270            | 4           | Type of electronic position fixing device used.                            |
| ETA Month              | Integer | 274            | 4           | Estimated Time of Arrival - Month.                                          |
| ETA Day                | Integer | 278            | 5           | Estimated Time of Arrival - Day.                                            |
| ETA Hour               | Integer | 283            | 5           | Estimated Time of Arrival - Hour.                                           |
| ETA Minute             | Integer | 288            | 6           | Estimated Time of Arrival - Minute.                                         |
| Draught                | Float   | 294            | 8           | Maximum present static draught of the vessel in meters.                     |
| Destination            | String  | 302            | 120         | Vessel's destination, 20 characters encoded in 6 bits each.                 |
| DTE                    | Integer | 422            | 1           | Data Terminal Equipment (DTE) ready status.                                 |
| Spare                  | Integer | 423            | 1           | Spare bit, always set to zero.                                              |

## License 📜

SeaStream AIS Parser is released under the [GNU Affero General Public License (AGPL)](LICENSE). Feel free to use, modify, and distribute it in line with the license terms.

## Need a Compass? 🧭🆘

Lost in the sea of code? Open an issue in our [GitHub Issue Tracker](https://github.com/XYZ-GmbH/SeaStream-AIS-Parser/issues), or drop us a message in our [Support Channel](SUPPORT.md).

## Stay in the Loop! 🔄📢

Follow us on [Twitter](https://twitter.com/SeaStream) and [LinkedIn](https://www.linkedin.com/company/seastream) for the latest updates, features, and more! 🐦💼

---

Happy Parsing and Fair Winds to Your Code! ⛵🎈🌟

