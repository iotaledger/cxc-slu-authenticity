# is-cxc-authenticity-collector
CityXChange microservices are responsible to setup and collect data about authentic SLU devices.

### dashboard:
The dashboard provides a visual representation of the devices where the user can see the created devices, the related addresses, names and sent data.
Furthermore he can create other devices. </br>
[Further information about the dashboard](dashboard/README.md)

### one-shot-device:
The one-shot-device service creates one device identity and subscribes it to a channel. Further it saves the creator of the device and requests other services for saving the status and the nonce. </br>
[Further information about the one-shot-device](one-shot-device/README.md)
 
### authentictiy-collector:
The authentictiy-collector service saves the authentications, data of a device and saves the data also into his own channel.  </br>
[Further information about the authentictiy-collector](authenticity-collector/README.md)

### slu-status:
The slu-status service saves the nonce and the status of the devices. </br>
[Further information abotu slu-status](slu-status/README.md)

### ssi-proof-of-ownership:
The ssi-proof-of-ownership service proves the device identity by verifying his signature with the public key. </br>
[Further information about ssi-proof-of-ownership](ssi-proof-of-ownership/README.md)

### slu-scripts:
The slu-scripts folder includes several scripts which are run on the device and interact with the above mentioned services. </br>
[Further information about slu-scripts](slu-scripts/README.md)


