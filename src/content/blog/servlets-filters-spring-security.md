---
title: "Servlets & filters in Spring Security"
description: "How servlets and the filter chain underpin Spring Security — the request path from container to controller, and where auth fits in."
date: 2023-10-27
category: note
tags:
  - java
  - spring-boot
  - security
  - backend
cover: /images/servlets-filters-cover.svg
coverAlt: "A request walking the Spring Security filter chain"
---

### Servlets

In Java web apps, Servlet container (web server) takes care of translating the HTTP messages for java code to understand. One of mostly used servlet container is Apache Tomcat.

Servlet Container converts the HTTP messages into ServletRequest and hand over to Servlet method as a parameter

Similarly, ServletResponse returns as an output to Servlet Container from Servlet. So everything we write inside the Java web apps are driven by Servlets

---

### Filters

Filters inside Java Web Applications can be used to intercept each request/response and do some pre-work before our business logic. So using the same filters, Spring Security enforce security based on our configurations inside a web application

---

### Spring Security Internal Flow


#### Spring Security Filters

A series of spring security filters intercept each request and work together to identify if authentication is required or not.

If authentication is required, accordingly navigate the user to login page or use the existing details stored during the initial authentication

#### Authentication
Filters like _UsernamePasswordAuthenticationFilter_ will extract username/password from HTTP request and prepare Authentication type object. Because Authentication is the core standard of storing authenticated user details inside Spring Security Framework

#### AuthenticationProvider
AuthenticationProviders has all the core logic of validating user details for authentication

#### UserDetailsManager/UserDetailsService
UserDetailsManager/UserDetailsService helps in retrieving, creating, updating, deleting the User details from the DB/storage systems

#### PasswordEncoder
Service interface that helps in encoding and hashing passwords. Otherwise we may have to live with plain text passwords

#### SecurityContext
Once the request has been authenticated, the Authentication will usually be stored in a thread-local SecurityContext managed by the SecurityContextHolder.

This helps during the upcoming requests from the same user

---


## Sequence Flow

![Spring Security authentication sequence — request travels through the filter chain to the AuthenticationManager, AuthenticationProvider and UserDetailsService, then the authenticated result returns up the chain and is stored in the SecurityContext before the response](/images/spring-security-auth-flow.svg)

Reading the flow step by step:

1. **HTTP request** arrives and is intercepted by the **authentication filters** (e.g. `UsernamePasswordAuthenticationFilter`).
2. The filter **extracts the credentials** and builds an `Authentication` object — a `UsernamePasswordAuthenticationToken`.
3. It calls `authenticate(token)` on the **`AuthenticationManager`** (`ProviderManager`).
4. The manager delegates `authenticate(token)` to a suitable **`AuthenticationProvider`** (`DaoAuthenticationProvider`).
5. The provider calls `loadUserByUsername()` on the **`UserDetailsService`** (`InMemoryUserDetailsManager`) to fetch the stored user.
6. With the returned `UserDetails`, the provider verifies the password via the **`PasswordEncoder`** (`matches(raw, stored)`).
7. A fully populated, authenticated `Authentication` propagates back up: provider → manager → filter.
8. The filter stores it in the **`SecurityContext`** (thread-local, via `SecurityContextHolder`) so later requests from the same user are already authenticated — then the **response** is returned.

---

*Originally published on [dev.to](https://dev.to/vijay2249/servlets-filters-springsecurity-2ocd).*
