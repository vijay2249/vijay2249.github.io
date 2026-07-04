---
title: AlgoRythm
tagline: Algorithms with pseudocode and implementations across multiple languages.
stack: Open source · Multi-language
tech: [Go, Python, Java, JavaScript]
repo: https://github.com/vijay2249/AlgoRythm
license: No formal license yet (all rights reserved by default)
status: experimental
year: '2024'
featured: false
order: 6
highlights:
  - Pseudocode-first explanations alongside real implementations
  - Multiple languages for the same algorithm
  - A learning resource I keep adding to
---

**AlgoRythm** is a collection of algorithms presented pseudocode-first, with concrete implementations across multiple languages. 
It's part learning resource, part reference — the kind of thing I wish I'd had while drilling DSA in Go and Python.

## Architecture

There's no framework here — the "architecture" is a deliberately simple convention. Each algorithm is explained once in language-neutral **pseudocode**, then implemented the same way across languages so you can compare idioms side by side.

![Pseudocode-first repo layout: one algorithm, explained once, implemented per language](/images/algorythm-structure.svg)

## Technical explanation

Leading with pseudocode keeps the *idea* separate from any one language's syntax, so the implementations become a study in how each language expresses the same logic — slices vs. lists, error handling, iteration style. Keeping the structure flat and predictable is what makes it easy to keep adding to over time.

This one is intentionally experimental and informal — a growing reference rather than a finished product.
