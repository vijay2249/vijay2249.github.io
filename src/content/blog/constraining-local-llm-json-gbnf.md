---
title: Constraining a local LLM to valid JSON with GBNF grammars
description: Prompts ask a model to "return JSON". Grammars make it impossible to return anything else. How I used GBNF + constrained decoding to get reliable structured output on-device.
date: 2026-06-06
category: tutorial
tags:
  - llm
  - ai-agents
  - developer-experience
  - design
cover: /images/llm-json-cover.svg
coverAlt: A GBNF grammar describing a strict JSON object
---

If you've ever asked an LLM to "respond with JSON," you know the failure mode: it mostly works, then one in fifty replies comes wrapped in a markdown fence, or with a chatty preamble, or with a trailing comma that breaks your parser. When I used a local model to extract structured records from documents, "mostly valid" wasn't good enough. The fix isn't a better prompt — it's a **grammar**.

## Prompts persuade; grammars constrain

A prompt is a *request*. The model can ignore it. **Constrained decoding** is different: at each step, the sampler is only allowed to choose tokens that keep the output valid against a formal grammar. Invalid tokens aren't discouraged — they're **masked out entirely**. With llama.cpp this grammar format is **GBNF** (a BNF-style notation).

The result: the model *cannot* emit a markdown fence, a preamble, or malformed JSON. The only reachable outputs are strings your parser will accept.

## A grammar for an extraction schema

Say I want each record to be an object with a date, an amount, and a type that's exactly `credit` or `debit`. A GBNF grammar pins that down:

```bnf
root      ::= "{" ws "\"date\"" ws ":" ws string ws ","
                  ws "\"amount\"" ws ":" ws number ws ","
                  ws "\"type\"" ws ":" ws kind ws "}"
kind      ::= "\"credit\"" | "\"debit\""
string    ::= "\"" ([^"\\] | "\\" .)* "\""
number    ::= "-"? [0-9]+ ("." [0-9]+)?
ws        ::= [ \t\n]*
```

Note what this buys you beyond "it's JSON": `type` can **only** be `credit` or `debit`. The model can't invent `transfer` or `Credit `. The enum is enforced by the decoder, not hoped for in a prompt.

## Where it fits in the pipeline

In the finance analyzer, the local model is used **only** as a fallback extractor when rule-based parsing can't handle a document. The flow is deliberately narrow:

```
document text ──▶ prompt + GBNF grammar ──▶ constrained decode ──▶ on-schema JSON ──▶ validate ──▶ records
```

Three guards, not one:

1. **Fixed invocation path.** There's no chat UI — the model is called in exactly one place with one job. No free-form conversation to go off the rails.
2. **Grammar-constrained output.** It can only emit valid, on-schema JSON.
3. **Post-decode validation.** Even valid JSON gets a plausibility pass (real dates, non-zero amounts) before anything is stored.

## Why bother when prompting "usually works"

Because "usually" is a reliability number, and on a long tail of messy inputs it's worse than you think. Constrained decoding turns a probabilistic behavior into a structural guarantee:

- **No parser babysitting.** You delete the regex that strips ```` ```json ```` fences and the retry loop for malformed output.
- **Enums actually hold.** Downstream code can trust the field is one of N values.
- **Smaller models get usable.** A 1.5B on-device model is far more reliable at *format* when format is enforced rather than learned — which is what makes the offline, on-device approach viable at all.

## The general lesson

The pattern generalizes past JSON: **when output feeds another program, constrain the output space instead of asking nicely.** Grammars for structured text, state machines for tool calls, schemas validated at the boundary. Prompts are for *intent*; constraints are for *guarantees*. Use the prompt to say what you want, and the grammar to make everything else unreachable.
