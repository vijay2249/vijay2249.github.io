---
title: Vproxie
tagline: A direction-aware, privacy-first reverse proxy written in Go. Implements a strict deny-then-allow model for metadata and header routing, ensuring zero data leakage across network boundaries.
stack: Open Source · Reverse Proxy
tech: [GO, Proxy]
repo: https://github.com/vijay2249/vproxie
license: Not decided yet
status: active
year: '2024'
featured: true
order: 3
cover: ''
coverAlt: GO proxy flow diagram
highlights:
  - Direction-aware, privacy first reverse proxy written in GO
  - Implements a strict deny-then-allow model for metadata and header routing, ensuring zero data leakage across network boundaries
---


**Vproxie** is a reverse proxy in written in GO

> Personal side quest to do a small project in GO to understand the concepts of GO


## Why I built it.

I was working to do a local setup where the backend server should know nothing about the user/client, it should just receive the request and do the business logic and send the response.

So here when I was testing I saw in headers browsers are automatically sending multiple headers that can be used in creating a unique digital fingerprint for each client/user

Had to create some layer in the service to make sure that the client digital fingerprint items should not reach backend server, while researching about such ideas and frameworks, came across `ngix` which is industry standard reverse proxy layer in the system architecture.

At the same time I was learning GO language and having just learned about its performance, I thought to create this reverse proxy in GO as a project to learn about reverse proxy concepts and also learn about GO concepts.

Hence the birth of `Vproxie` reverse proxy for local projects setup.


## What it does
- Its just reverse proxy
- This removes the metadata in the request/response to try to make sure that digital fingerprint cannot be created for each systems


## Architecutre 
Architecture and Technical design writeup is on the way...