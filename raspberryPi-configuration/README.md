# Install the Raspbian OS

Your **Mac/Windows/Linux** must have an SD card reader. To install the **Raspbian OS**:

-   Download the **Raspberry Pi Imager** - https://www.raspberrypi.com/software/
-   Put the SD card into the reader and run **Raspberry Pi Imager**.
-   To browse the operating systems that are available click `Choose OS button`. Choose either the recommended `32bit Raspberry Pi OS`, or pick up the `64bit version` from the submenu. The gears button opens the `Advanced Options`, where you can set device name, configure Wifi, set hostname, etc. Hit the write button to create OS image.
-   After Imager is finished put the SD card into your **Raspberry Pi**. You can now start working with it.

     <br />

# Enable SSH on the Raspberry Pi

If you haven't enabled the **SSH** in the `Advanced Option` while creating the OS image:

-   Open the `Raspberry Pi Configuration` window from the `Preferences` menu.

-   Click on the `Interfaces` tab.

-   Select `Enable` next to the **SSH** row.

-   Click on the `OK` button for the changes to take effect.

<br />

Or, alternatively, enable the **SSH** from the terminal:

-   Open your terminal either by using the **Ctrl+Alt+T** keyboard shortcut or by clicking on the terminal icon, start the `raspi-config` by typing:

```bash
    raspi-config
```

-   Select `SSH` and press Enter.

-   You will be prompted whether you like to enable the **SSH server**. Select `Yes` and press Enter.

-   Press Enter top go back to the main menu and select `Finish` to close the `raspi-config.

    <br />

# Connecting Raspberry Pi via SSH:

To connect to the **Raspberry Pi** via **SSH** you need to obtain its IP address. You can find the IP address using one of the following methods:

1. Finding the IP address with **mDNS**

Since **Raspberry Pi OS** supports multicast **DNS** you can reach your Raspberry Pi by using its hostname (the default is raspberrypi) and the .local suffix.

```bash
    ping <hostname>.local
```

It should return your device IP address:

```bash
    PING <hostname>.local (192.168.1.131): 56 data bytes
64 bytes from 192.168.1.131: icmp_seq=0 ttl=255 time=2.618 ms
```

2. Using **Network Mapper**

**Network Mapper** is an free open-source tool allowing you to find device IP address. It is available for **Windows, Linux** and **MacOS**.

-   To install on **Linux**, install the nmap package:

```bash
    apt install nmap
```

-   To install on **macOS** or **Windows**, got to https://nmap.org/download.html

To use `nmap` command you first need to know the subnet you device is connected to:

-   On **Windows**, open the `Control Panel`, then `Network and Sharing Center`, click `View network connections`, select your active network connection and click `View status of this connection` to view the IP address

-   On **Linux**, open the terminal and type `hostname -I`

-   On **macOS**, open the `System Preferences` then `Network` and select your active network connection to view the IP address

Once you have your computers IP address you an scan the whole subnet range for other devices. You can append /<numbits> to an IP address or hostname and `Nmap` will scan every IP address for which the first <numbits> are the same as for the reference IP or hostname given. For example, 192.168.10.0/24 would scan the 256 hosts between 192.168.10.0 (binary: 11000000 10101000 00001010 00000000) and 192.168.10.255 (binary: 11000000 10101000 00001010 11111111), inclusive. 192.168.10.40/24 would scan exactly the same targets. To scan the whole subnet range use `nmap` command with the `-sn` flag:

```bash
    sudo nmap -sn 192.168.1.0/24
```

After few seconds for each discovered device it should return output, i.e for a default hostmane raspberrypi:

```bash
    Nmap scan report for raspberrypi (192.168.1.8)
    Host is up (0.0030s latency).
    Nmap done: 256 IP addresses (4 hosts up) scanned in 2.41 seconds
```

# Passwordless SSH Access

To access your **Raspberry Pi** from another computer without being asked for providing the password you need to use an SSH key instead. Follow these steps to set up an SSH access:

1. Check for existing keys on your **Raspberry Pi**. In terminal type:

```bash
    ls ~/.ssh
```

If it returns files `id_rsa.pub` or `id_dsa.pub` then you have already the SSH keys set up and you can skip to #3

2. Generate new SSH keys byt typing the following in the terminal:

```bash
    ssh-keygen
```

-   You will be asked where you want to have the keys saved. The recommended is to keep them in the default location (~/.ssh/id_rsa) - just simply press `Enter`.
-   Enter a passpharse to encrypt your **private SSH** key.
-   Check if the files were created by again typing:

```bash
    ls ~/.ssh
```

-   you should now see the files `id_rsa.pub` and `id_dsa.pub`
-   to see how the public key looks like type the following command:

```bash
    cat ~/.ssh/id_rsa.pub
```

3. Copy your **Mac/Windows/Linux** key to the **Raspberry Pi**:

-   using the computer that you will be connecting from, add the public key you your `authorized_keys` file on the **Raspberry Pi** by sending it over **SSH**:

```bash
    ssh-copy-id <USERNAME>@<IP-ADDRESS>
```

-   you will be prompted for a password. Once that is done your SSH access is completed and you will be able to connect to the **Raspberry Pi** without the password by typing the following command:

```bash
    ssh <USER>@<IP-ADDRESS>
```

# Setup Node.js

# Install Git

```

```
