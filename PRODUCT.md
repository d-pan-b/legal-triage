# Product

## Register

product

## Users

High-volume intake specialists at a legal services company that processes legal requests on behalf of major technology platforms. These users open 40–80 documents per day and need to make a routing decision within a minute. They are not attorneys; they are trained operators who rely on the AI's classification to triage correctly, then act. Secondary users: paralegals and legal ops staff who review edge cases, and attorneys who step in for escalated (Counsel Only) matters.

## Product Purpose

Nexus Legal Triage is a compliance operations tool. It accepts uploaded legal request documents (PDFs, DOCX, TXT), extracts structured fields using AI, identifies red flags, assigns urgency, and recommends a routing path (Junior Analyst / Senior Analyst / Counsel Only). The product exists to replace unstructured email-based intake with a fast, auditable, AI-assisted decision layer. Success means an intake specialist can correctly classify and route a legal request in under 60 seconds with documented rationale.

## Brand Personality

Authoritative. Precise. Dependable.

The product should feel like a well-trained associate: fast, correct, and never alarmist unless the situation warrants it. Users are under deadline pressure and legal obligation; the interface must project competence and calm, not excitement or informality.

## Anti-references

- **AI chatbot interfaces** (ChatGPT, Claude.ai): conversational framing, streaming responses, open-ended inputs. This tool processes structured documents and must feel like a decision instrument, not a dialogue.
- **Legal document CMS** (Westlaw, Clio): navigation-heavy, grey and dense, form-driven. This tool should be faster and more direct than legacy legal software.

## Design Principles

1. **Triage first, decoration never.** Every pixel earns its place by reducing cognitive load or surfacing a decision. Anything that doesn't do that gets removed.
2. **Speed + care, not speed or care.** The interface must support both fast scanning (urgent routing, red flags, deadline) and careful review (full document text, routing rationale). These modes must coexist on screen.
3. **Status is always visible.** At any moment the user knows: what request they are looking at, what the AI decided, and what action is pending. Nothing should require hunting.
4. **AI output is a recommendation, not a decision.** The UI must make clear that the analyst is the decision-maker. The human's action (escalate, assign, export) is the workflow terminal, not the AI's verdict badge.
5. **Auditability is part of the product.** Every triage session gets a traceable ID and timestamp. Exports must be reproducible. Red flags must be grounded in document evidence, not asserted.

## Accessibility & Inclusion

WCAG 2.1 AA. All interactive elements keyboard-navigable. Minimum 4.5:1 contrast for body text, 3:1 for large/bold text. All state changes (loading, error, success) announced to screen readers. No information conveyed by color alone.
