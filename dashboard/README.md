# is-cxc-authenticity-collector

CityXChange microservice collects information about authentic SLU devices.

## Installation

1.  You have to install dependencies and run the project:

```bash

$ npm install
$ npm run dev

```

2.  Create a  `.env`  and add the corresponding necessary configuration:

```bash
VITE_IOTA_IS_SDK_API_KEY="XXXXXXXXXX"
VITE_IOTA_IS_SDK_GATEWAY_URL="XXXXXXXXXX"
VITE_DEVICE_MANAGEMENTE_API_REST_URL="XXXXXXXXXX"
VITE_SLU_STATUS_API_KEY ="XXXXXXXXXX"
VITE_SLU_GATEWAY_URL = "XXXXXXXXXX"

```
## Devices

When the operator (logged user) creates a device, the following steps are also completed:

 - Create a channel for that device.
 - Create the device.
 - Authorize the created identity on the channel.
 
 #### Device Manager
 Display a list of all your devices.
 
 `ListManager` props:

-  `title`: list title

-  `tableData`: table data

-  `actionButtons`: array with button actions, in this case, *Create Device* button

-  `message`: message shown if there is no data in the table (*No devices found*)

-  `showSearch`: the search is available in the list

-  `onSearch`: function that is executed when searching

-  `searchQuery`: query placeholder

 
 #### Device details
 The device details contain all the information about the device, that includes the following features:
 - Nonce
 - Status
 - Authenticity
 - Subscribers: pending & authorized
 - Channel messages

`DeviceDetails` props:

- `device`: the selected device object includes:
 ```js
 
{
	id: string;
	nonce: string;
	name: string;
	channelAddress: string;
}

```

## Authors

[Rubén Álvarez Gallego](https://github.com/evavirseda) (ralvarez@boxfish.studio)
[Begoña Álvarez de la Cruz](https://github.com/begonaalvarezd) (balvarez@boxfish.studio)  
[Eva Virseda Sanz](https://github.com/evavirseda) (evirseda@boxfish.studio)  

