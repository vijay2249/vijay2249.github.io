---
title: "SOLID, in practice"
description: An evolving note on what each SOLID principle actually buys you in a real Spring Boot service — with the smells that tell you a principle is being violated.
date: 2026-02-14
updated: 2026-06-27
category: note
tags:
  - architecture
  - java
  - spring-boot
  - clean-code
---

> 🌱 A digital-garden note — tended over time. It grows as I find better examples.

SOLID gets quoted a lot and applied a little. Here's how I actually use each principle, plus the smell that warns me it's being broken.

## S — Single Responsibility

A class should have one reason to change. **Smell:** a service that both talks to the database *and* formats responses *and* calls three other services. Split along reasons to change, not along arbitrary line counts.

```java
// Smell: one class, three reasons to change (persistence, tax rules, formatting)
class InvoiceService {
  void save(Invoice i) { /* JDBC */ }
  Money tax(Invoice i) { /* tax rules */ }
  String toPdf(Invoice i) { /* rendering */ }
}

// Better: one responsibility each
class InvoiceRepository { void save(Invoice i) { /* JDBC */ } }
class TaxCalculator     { Money tax(Invoice i) { /* tax rules */ } }
class InvoiceRenderer   { String toPdf(Invoice i) { /* rendering */ } }
```

## O — Open/Closed

Open for extension, closed for modification. **Smell:** a growing `if/else` (or `switch`) on a type field. Replace it with polymorphism — a strategy per case — so adding a case means adding a class, not editing an existing one.

```java
// Smell: every new method edits this switch
Money fee(Payment p) {
  switch (p.type()) {
    case CARD: return p.amount() * 0.029;
    case UPI:  return 0;
    // adding WALLET means editing here...
  }
}

// Better: add a class, touch nothing existing
interface FeePolicy { Money fee(Payment p); }
class CardFee   implements FeePolicy { public Money fee(Payment p) { return p.amount() * 0.029; } }
class UpiFee    implements FeePolicy { public Money fee(Payment p) { return Money.ZERO; } }
class WalletFee implements FeePolicy { public Money fee(Payment p) { /* new case, new class */ } }
```

## L — Liskov Substitution

Subtypes must be usable wherever their base type is expected. **Smell:** an override that throws `UnsupportedOperationException`, or one that quietly weakens a guarantee callers rely on.

```java
// Violation: callers of List can't trust add() anymore
class ImmutableList<T> extends ArrayList<T> {
  @Override public boolean add(T t) { throw new UnsupportedOperationException(); }
}

// Better: don't claim to be a mutable List if you aren't
interface ReadOnlyList<T> { T get(int i); int size(); }
```

## I — Interface Segregation

Many small interfaces beat one fat one. **Smell:** implementations full of empty methods because they only needed part of the contract.

```java
// Smell: a printer forced to implement scanning + faxing
interface Machine { void print(Doc d); void scan(Doc d); void fax(Doc d); }
class SimplePrinter implements Machine {
  public void print(Doc d) { /* ... */ }
  public void scan(Doc d) {}  // empty — red flag
  public void fax(Doc d)  {}  // empty — red flag
}

// Better: split the contract; implement only what you are
interface Printer { void print(Doc d); }
interface Scanner { void scan(Doc d); }
class SimplePrinter2 implements Printer { public void print(Doc d) { /* ... */ } }
```

## D — Dependency Inversion

Depend on abstractions, not concretions. **Smell:** a service that `new`s its own collaborators. Inject interfaces instead — it's what makes the thing testable.

```java
// Smell: hard-wired dependency, impossible to swap or mock
class NotificationService {
  private final SmtpClient smtp = new SmtpClient(); // concretion
  void notify(User u) { smtp.send(u.email(), "..."); }
}

// Better: depend on an abstraction, inject the concretion
interface Notifier { void send(String to, String body); }
class NotificationService2 {
  private final Notifier notifier;             // abstraction
  NotificationService2(Notifier notifier) { this.notifier = notifier; }
  void notify(User u) { notifier.send(u.email(), "..."); }
}
```

## The through-line

Every principle here is really about **isolating change**. When a requirement shifts, you want to touch one small place, not ripple across the codebase. That's the payoff — maintainability, not purity.

## Related notes

- These principles are what made [shipping swagger-view](/blog/shipping-swagger-view-local-first) cleanup features safe.

---

