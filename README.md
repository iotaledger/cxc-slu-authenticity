# is-cxc-authenticity-collector
CityXChange microservices are responsible to collect informations about authentic SLU devices.
To do that the user get the possibility to create and to setup devices with the provided services:

dashboard:
The dashboard provide a visual representation of the devices where the user and can see the created devices, the related addresses, names and the send data.
Furthermore he can create other devices.
[Further information about the dashboard](dashboard/README.md)

one-shot-device:
The one-shot-device service creates one device identity and subscribes it to a channel. Further it saves the creator of the device and requests other services for saving the status and the nonce.
[Further information about the one-shot-device](one-shot-device/README.md)
 
authentictiy-collector:
The authentictiy-collector service saves the authentications, data of a device and saves the data also into his own channel. 
[Further information about the authentictiy-collector](authenticity-collector/README.md)

slu-status:
The slu-status service saves the nonce and the status of the devices.
[Further information abotu slu-status](slu-status/README.md)

ssi-proof-of-ownership:
The ssi-proof-of-ownership services proves the device identity by verifying his signature with the public key.
[Further information about ssi-proof-of-ownership](ssi-proof-of-ownership/README.md)

slu-scripts:
The slu-scripts folder includes several scripts which are run on the device and interact with the above mentioned services.
[Further informatiion about slu-scripts](slu-scripts/README.md)


