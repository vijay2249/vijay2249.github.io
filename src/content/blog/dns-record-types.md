---
title: "DNS record types and what they're for"
description: "A quick reference to the common DNS record types — A, AAAA, CNAME, MX, TXT and friends — and the job each one does."
date: 2023-11-04
category: note
tags:
  - dns
  - networking
  - web
cover: /images/dns-records-cover.svg
coverAlt: "A table of DNS records"
---

DNS (Domain Name System) records are used to manage and translate domain names into IP addresses, allowing computers to locate and communicate with each other over the internet. There are various types of DNS records, each serving a specific purpose. Here are some common types of DNS records and their purposes:

1. A (Address) Record:
   - Purpose: Maps a domain name to an IPv4 address.
   - Example: example.com IN A 192.168.1.1

2. AAAA (IPv6 Address) Record:
   - Purpose: Maps a domain name to an IPv6 address.
   - Example: example.com IN AAAA 2001:0db8:85a3:0000:0000:8a2e:0370:7334

3. CNAME (Canonical Name) Record:
   - Purpose: Creates an alias for an existing A or AAAA record. It points one domain name to another.
   - Example: www.example.com IN CNAME example.com

4. MX (Mail Exchanger) Record:
   - Purpose: Specifies the mail server responsible for receiving email messages for a domain.
   - Example: example.com IN MX 10 mail.example.com

5. TXT (Text) Record:
   - Purpose: Used for storing text-based information, such as SPF (Sender Policy Framework) records, DKIM (DomainKeys Identified Mail) keys, and other human-readable data.
   - Example: example.com IN TXT "v=spf1 include:_spf.example.com ~all"

6. SRV (Service) Record:
   - Purpose: Specifies the location of services, such as SIP, XMPP, and other network services.
   - Example: _sip._udp.example.com IN SRV 0 5 5060 sipserver.example.com

7. NS (Name Server) Record:
   - Purpose: Specifies the authoritative name servers for a domain.
   - Example: example.com IN NS ns1.example-dns.com

8. PTR (Pointer) Record:
   - Purpose: Used for reverse DNS lookups to map an IP address to a domain name.
   - Example: 1.1.168.192.in-addr.arpa IN PTR example.com

9. SOA (Start of Authority) Record:
   - Purpose: Contains administrative information about a zone, including the primary name server and contact information.
   - Example: example.com IN SOA ns1.example-dns.com admin.example.com 2023102401 7200 3600 604800 3600

10. SPF (Sender Policy Framework) Record:
   - Purpose: Specifies which IP addresses are allowed to send email on behalf of a domain, helping to prevent email spoofing and phishing.
   - Example: example.com IN TXT "v=spf1 include:_spf.example.com ~all"

These DNS record types serve different functions and are essential for the proper functioning of the internet. They allow domain names to be associated with various services and resources, such as web servers, email servers, and more. The choice of which record type to use depends on the specific requirements of the domain and the services it provides.

---

*Originally published on [dev.to](https://dev.to/vijay2249/what-are-the-different-types-of-dns-records-and-what-are-their-specific-purposes-3ef4).*
