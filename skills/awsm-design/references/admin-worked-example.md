# Worked example: invoice operations

Illustrative design exercise, not a claim about an existing product or API.
Use the structure to reason about another domain; do not copy invoice fields into
HR, inventory or construction screens. For a queue-only request, stop at the queue.

## Task and boundaries

An operator finds overdue invoices, checks the record and corrects a draft.
Small scope: queue, detail, edit. Reuse one app shell. No revenue dashboard,
subscription billing, login redesign or new permission system unless requested.

| Surface | Content and primary action | Transition / preserved context |
| --- | --- | --- |
| Queue | Invoice/customer, status, due date, currency amount; search and status filter | Open detail; keep filter, sort and page on return |
| Detail | Identity, line items, subtotal/tax/total, due date, activity | Edit only if draft and allowed; explain locked state |
| Edit | Customer, dates and editable lines; calculated totals | Validate -> saving -> saved detail; cancel retains original |

Use an illustrative row such as INV-1042, customer PT Contoh, IDR 1,250,000, due
14 May, draft. Label fixture data as demo. Do not silently treat an overdue draft
as an issued invoice: confirm domain rules or separate lifecycle from due status.
Never imply Send, Pay or Approve performed a backend action when it was simulated.

## Anatomy and composition

Desktop: restrained sidebar, page title/primary action, compact filter bar, dense
table and a secondary summary only if it helps prioritize work. Right-align money,
show currency explicitly, keep status textual, use row actions rather than making
the whole row an inaccessible click target. Mobile: prioritize identity, status,
amount and next action; place secondary columns in detail or use a contained table
scroller when comparison requires columns. Never create page-wide overflow.

Palette: neutral layered surfaces, a brand accent for primary interaction and
separate semantic status tokens. Type: existing sans with legible numbers and
consistent tabular amount alignment. Choose fonts from actual installed/license
availability; this example is not a mandate to install a particular family.
Icons: search/filter/add/edit/more from the existing coherent family, with labels
on important actions. A shader is not useful behind the table; density and surface
hierarchy provide depth here.

## Component/state contracts

- FilterBar: query, status, clear; reflects URL/local routing convention.
- InvoiceRow: identity link, due status, amount, menu; focus and selection differ.
- StatusBadge: lifecycle label plus semantic tone; never color alone.
- InvoiceForm: field values/errors, submitting flag, save/cancel callbacks.
- RecordFeedback: saved/error/retry; preserved input after a failed save.

Example transition: edit draft -> invalid due date -> inline error next to the
field and summary focus -> corrected -> saving (no duplicate submit) -> network
failure (values intact) -> retry -> saved detail -> back to original filtered queue.

## Reject and revise

If the first screenshot has six equal KPI cards but overdue records are below the
fold, remove or demote the cards and expose the queue. If every field becomes a
mobile card, rebuild grouping around invoice identity and the task. Capture queue,
detail and failed-save states; test keyboard row navigation, filter reset and
return context. A pretty home screen without this journey does not pass.
