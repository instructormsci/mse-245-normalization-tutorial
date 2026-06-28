import { useState } from "react";

/**
 * NormalizationTutorial
 * -------------------------------------------------------------
 * Self-guided replacement for the live whiteboard walkthrough of
 * normalization (UNF -> 1NF -> 2NF -> 3NF) for MSE 245.
 *
 * Three modes, read as one arc:
 *   - "why":      break the flat Order table to feel the three
 *                 anomalies normalization exists to remove.
 *   - "watch":    narrated walkthrough of the Order example, with the
 *                 four normal forms side by side, filling left-to-right.
 *   - "practice": the student transcript exercise, where the student
 *                 makes the decision for each column and gets feedback
 *                 tied to the three 3NF tests.
 *
 * Zero dependencies beyond React. Styles are scoped in a <style> block,
 * so it drops into a bare Vite scaffold with no setup.
 * -------------------------------------------------------------
 */

/* ============================ DATA ============================ */

// attribute: { n, pk?, fk? } | table: { id, name?, attrs[] }
// stage:     { key, title, jogger?, why, tables, focus:[names], newIds:[ids] }

const orderStages = [
  {
    key: "UNF",
    title: "Un-normalized form (UNF)",
    jogger: null,
    why: "Start with every attribute from the Sales Order document in one list. Order_No identifies an order, but the document records many lines per order - so Item_No, Item_Desc and Qty repeat. That repetition is what the three rules will remove.",
    focus: [],
    newIds: [],
    tables: [
      {
        id: "all",
        attrs: [
          { n: "Order_No", pk: true },
          { n: "Customer_No" },
          { n: "Customer_Name" },
          { n: "Order_Date" },
          { n: "Delivery_Addr" },
          { n: "Item_No" },
          { n: "Item_Desc" },
          { n: "Qty" },
        ],
      },
    ],
  },
  {
    key: "1NF",
    title: "First normal form (1NF)",
    jogger: "Repeating groups",
    why: "Item_No, Item_Desc and Qty repeat for every line on an order. Lift that repeating group into its own table. To identify one line we need both the order and the item, so its key is the compound (Order_No, Item_No).",
    focus: ["Item_No", "Item_Desc", "Qty"],
    newIds: ["line"],
    tables: [
      {
        id: "order",
        attrs: [
          { n: "Order_No", pk: true },
          { n: "Customer_No" },
          { n: "Customer_Name" },
          { n: "Order_Date" },
          { n: "Delivery_Addr" },
        ],
      },
      {
        id: "line",
        attrs: [
          { n: "Order_No", pk: true },
          { n: "Item_No", pk: true },
          { n: "Item_Desc" },
          { n: "Qty" },
        ],
      },
    ],
  },
  {
    key: "2NF",
    title: "Second normal form (2NF)",
    jogger: "Part-key dependencies",
    why: "In the line table the key is (Order_No, Item_No). Item_Desc depends on Item_No alone - only part of the key - so it moves out into its own Item table. The order table has a single-attribute key, so it cannot have a part-key dependency and is left unchanged.",
    focus: ["Item_Desc"],
    newIds: ["item"],
    tables: [
      {
        id: "order",
        attrs: [
          { n: "Order_No", pk: true },
          { n: "Customer_No" },
          { n: "Customer_Name" },
          { n: "Order_Date" },
          { n: "Delivery_Addr" },
        ],
      },
      {
        id: "line",
        attrs: [
          { n: "Order_No", pk: true },
          { n: "Item_No", pk: true },
          { n: "Qty" },
        ],
      },
      { id: "item", attrs: [{ n: "Item_No", pk: true }, { n: "Item_Desc" }] },
    ],
  },
  {
    key: "3NF",
    title: "Third normal form (3NF)",
    jogger: "Non-key dependencies",
    why: "In the order table, Customer_Name and Delivery_Addr depend on Customer_No - a non-key attribute - not directly on Order_No. They move into a Customer table (assuming one delivery address per customer). Customer_No stays behind as a foreign key. Now every non-key attribute depends on the key, the whole key, and nothing but the key.",
    focus: ["Customer_No", "Customer_Name", "Delivery_Addr"],
    newIds: ["customer"],
    tables: [
      {
        id: "order",
        name: "Order",
        attrs: [
          { n: "Order_No", pk: true },
          { n: "Customer_No", fk: true },
          { n: "Order_Date" },
        ],
      },
      {
        id: "customer",
        name: "Customer",
        attrs: [
          { n: "Customer_No", pk: true },
          { n: "Customer_Name" },
          { n: "Delivery_Addr" },
        ],
      },
      {
        id: "line",
        name: "OrderItem",
        attrs: [
          { n: "Order_No", pk: true, fk: true },
          { n: "Item_No", pk: true, fk: true },
          { n: "Qty" },
        ],
      },
      { id: "item", name: "Item", attrs: [{ n: "Item_No", pk: true }, { n: "Item_Desc" }] },
    ],
  },
];

const transcriptStages = [
  {
    key: "UNF",
    title: "Un-normalized form (UNF)",
    jogger: null,
    why: "Every attribute from the transcript document, in one list. One student can take many courses, so the course attributes repeat. Your job is to drive this to 3NF one rule at a time - each column unlocks when you make the right call.",
    focus: [],
    newIds: [],
    tables: [
      {
        id: "all",
        attrs: [
          { n: "Student_ID", pk: true },
          { n: "StudentName" },
          { n: "ProgramCode" },
          { n: "ProgramName" },
          { n: "CourseNumber" },
          { n: "CourseName" },
          { n: "NumCredits" },
          { n: "Grade" },
        ],
      },
    ],
  },
  {
    key: "1NF",
    title: "First normal form (1NF)",
    jogger: "Repeating groups",
    question: {
      prompt:
        "Which attributes form the repeating group - the ones that occur more than once for a single student?",
      options: [
        "StudentName",
        "ProgramCode",
        "ProgramName",
        "CourseNumber",
        "CourseName",
        "NumCredits",
        "Grade",
      ],
      answer: ["CourseNumber", "CourseName", "NumCredits", "Grade"],
      correct:
        "Right. A student has many courses, so CourseNumber, CourseName, NumCredits and Grade repeat. They become their own table, keyed by the compound (Student_ID, CourseNumber) - you need both to identify one enrolment.",
      wrong:
        "Not quite. For one Student_ID, which attributes can have several values? The name and program appear once; the course rows repeat. The repeating group is CourseNumber, CourseName, NumCredits and Grade.",
    },
    why: "The repeating course group is separated out, keyed by (Student_ID, CourseNumber). The student-level attributes stay in a table keyed by Student_ID alone.",
    focus: ["CourseNumber", "CourseName", "NumCredits", "Grade"],
    newIds: ["enrol"],
    tables: [
      {
        id: "student",
        attrs: [
          { n: "Student_ID", pk: true },
          { n: "StudentName" },
          { n: "ProgramCode" },
          { n: "ProgramName" },
        ],
      },
      {
        id: "enrol",
        attrs: [
          { n: "Student_ID", pk: true },
          { n: "CourseNumber", pk: true },
          { n: "CourseName" },
          { n: "NumCredits" },
          { n: "Grade" },
        ],
      },
    ],
  },
  {
    key: "2NF",
    title: "Second normal form (2NF)",
    jogger: "Part-key dependencies",
    question: {
      prompt:
        "The enrolment table has the compound key (Student_ID, CourseNumber). Which attributes depend on only PART of that key?",
      options: ["CourseName", "NumCredits", "Grade"],
      answer: ["CourseName", "NumCredits"],
      correct:
        "Correct. CourseName and NumCredits are properties of the course itself - they depend on CourseNumber alone, not on which student took it. They move to a Course table. Grade depends on both student and course, so it stays.",
      wrong:
        "Re-check each one: does it change if a different student takes the same course? CourseName and NumCredits don't - they hang off CourseNumber only. Grade does change per student, so it depends on the whole key and stays put.",
    },
    why: "CourseName and NumCredits depend on CourseNumber alone, so they split into a Course table. Grade depends on the whole key and remains in the enrolment table. The student table has a single-attribute key and is unchanged.",
    focus: ["CourseName", "NumCredits"],
    newIds: ["course"],
    tables: [
      {
        id: "student",
        attrs: [
          { n: "Student_ID", pk: true },
          { n: "StudentName" },
          { n: "ProgramCode" },
          { n: "ProgramName" },
        ],
      },
      {
        id: "enrol",
        attrs: [
          { n: "Student_ID", pk: true },
          { n: "CourseNumber", pk: true },
          { n: "Grade" },
        ],
      },
      {
        id: "course",
        attrs: [
          { n: "CourseNumber", pk: true },
          { n: "CourseName" },
          { n: "NumCredits" },
        ],
      },
    ],
  },
  {
    key: "3NF",
    title: "Third normal form (3NF)",
    jogger: "Non-key dependencies",
    question: {
      prompt:
        "In the student table, which attribute is functionally dependent on another NON-key attribute (a transitive dependency)?",
      options: ["StudentName", "ProgramCode", "ProgramName"],
      answer: ["ProgramName"],
      correct:
        "Exactly. ProgramName depends on ProgramCode, which is itself a non-key attribute - not directly on Student_ID. It moves to a Program table; ProgramCode stays behind as a foreign key. The model is now in 3NF.",
      wrong:
        "Look for an attribute determined by another non-key attribute rather than by Student_ID. ProgramName is fixed once you know ProgramCode, so it depends on ProgramCode - a transitive dependency. That's the one to separate.",
    },
    why: "ProgramName depends on ProgramCode (a non-key attribute), so it splits into a Program table, leaving ProgramCode behind as a foreign key. Every non-key attribute now depends on the key, the whole key, and nothing but the key.",
    focus: ["ProgramCode", "ProgramName"],
    newIds: ["program"],
    tables: [
      {
        id: "student",
        name: "Student",
        attrs: [
          { n: "Student_ID", pk: true },
          { n: "StudentName" },
          { n: "ProgramCode", fk: true },
        ],
      },
      {
        id: "program",
        name: "Program",
        attrs: [{ n: "ProgramCode", pk: true }, { n: "ProgramName" }],
      },
      {
        id: "enrol",
        name: "Course Enrolment",
        attrs: [
          { n: "Student_ID", pk: true, fk: true },
          { n: "CourseNumber", pk: true, fk: true },
          { n: "Grade" },
        ],
      },
      {
        id: "course",
        name: "Course",
        attrs: [
          { n: "CourseNumber", pk: true },
          { n: "CourseName" },
          { n: "NumCredits" },
        ],
      },
    ],
  },
];

const threeNfTests = [
  "For each non-key attribute, is there just one possible value for a given value of the key?",
  "Do all of the non-key attributes depend upon the whole key?",
  "Do all of the non-key attributes depend directly upon the key?",
];

// Flat (un-normalized) Order data for the "Why normalize?" mode.
// Customer A101 repeats across three lines; order 12 is C234's only order
// and the only place item P3 appears.
const flatCols = [
  { k: "ord", h: "Order_No" },
  { k: "cno", h: "Customer_No" },
  { k: "cname", h: "Customer_Name" },
  { k: "date", h: "Order_Date" },
  { k: "addr", h: "Delivery_Addr" },
  { k: "ino", h: "Item_No" },
  { k: "idesc", h: "Item_Desc" },
  { k: "qty", h: "Qty" },
];

const flatRows = [
  { ord: "10", cno: "A101", cname: "John Smith", date: "12/02/2010", addr: "12 Oak St", ino: "P1", idesc: "Widget", qty: "3" },
  { ord: "10", cno: "A101", cname: "John Smith", date: "12/02/2010", addr: "12 Oak St", ino: "P2", idesc: "Gadget", qty: "1" },
  { ord: "11", cno: "A101", cname: "John Smith", date: "23/04/2010", addr: "12 Oak St", ino: "P1", idesc: "Widget", qty: "5" },
  { ord: "12", cno: "C234", cname: "Jill Brown", date: "15/05/2010", addr: "9 Elm Rd", ino: "P3", idesc: "Sprocket", qty: "2" },
];

const anomalies = [
  { id: "update", label: "Update anomaly" },
  { id: "insert", label: "Insertion anomaly" },
  { id: "delete", label: "Deletion anomaly" },
];

// ER diagram from the 3NF Order tables. Boxes are positioned so the two
// vertical links share an x and the bottom link is horizontal, matching
// the worked example's layout. Shared keys drive the relationships.
const erBoxes = [
  {
    id: "customer",
    x: 40,
    y: 24,
    w: 185,
    title: "Customer",
    attrs: [{ t: "Customer_No", pk: true, shared: true }, { t: "Customer_Name" }, { t: "Delivery_Addr" }],
  },
  {
    id: "item",
    x: 455,
    y: 24,
    w: 185,
    title: "Item",
    attrs: [{ t: "Item_No", pk: true, shared: true }, { t: "Item_Desc" }],
  },
  {
    id: "order",
    x: 40,
    y: 300,
    w: 185,
    title: "Order",
    attrs: [
      { t: "Order_No", pk: true, shared: true },
      { t: "Customer_No", fk: true, shared: true },
      { t: "Order_Date" },
    ],
  },
  {
    id: "orderitem",
    x: 455,
    y: 300,
    w: 185,
    title: "OrderItem",
    attrs: [
      { t: "Order_No", pk: true, fk: true, shared: true },
      { t: "Item_No", pk: true, fk: true, shared: true },
      { t: "Qty" },
    ],
  },
];

const erStages = [
  {
    key: "1. Tables",
    title: "Start from the four 3NF tables",
    why: "Normalization produced four tables: Customer, Order, OrderItem and Item. Each one becomes an entity. The remaining steps turn the keys they share into relationships.",
    showLinks: false,
    showNotation: false,
    highlightShared: false,
  },
  {
    key: "2. Links",
    title: "Link entities that share a key",
    why: "Rule 1: join any two entities that share an attribute, whether it is a primary or foreign key. Customer and Order share Customer_No, Order and OrderItem share Order_No, and Item and OrderItem share Item_No. Rule 2 says to remove any redundant link (where A to C means the same as A to B to C), but this model has none. The shared keys are highlighted.",
    showLinks: true,
    showNotation: false,
    highlightShared: true,
  },
  {
    key: "3. Crow's foot",
    title: "Add cardinalities, optionalities and names",
    why: "Rule 3: where an attribute is a simple primary key in one entity and a foreign key (or part of a composite key) in the other, the first sits at the 'one' end and the second at the 'many' end. So Customer is one-to-many with Order, Order is one-to-many with OrderItem, and Item is one-to-many with OrderItem. The single bar marks the 'one' end, the crow's foot marks the 'many' end, and the small circle shows optional participation. Last, name each relationship. Now compare this against your intuitive ER diagram and run the three 3NF tests once more.",
    showLinks: true,
    showNotation: true,
    highlightShared: false,
  },
];

/* ============================ STYLES ============================ */

const css = `
.nz-root{
  --ink:#1c2230; --muted:#5b6478; --line:#e3e1ec; --paper:#ffffff;
  --ground:#f6f5f9; --plum:#6b4e71; --plum-deep:#4a3450; --plum-soft:#f1ebf3;
  --gold:#b8860b; --gold-soft:#fbf3df; --ok:#2f7d5b; --ok-soft:#e8f4ee;
  --no:#b23b4a; --no-soft:#fbecee;
  color:var(--ink); background:var(--ground);
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  line-height:1.5; padding:28px 20px 40px; box-sizing:border-box;
}
.nz-wrap{max-width:1060px;margin:0 auto;}
.nz-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;}

.nz-head{margin-bottom:14px;}
.nz-eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--plum);font-weight:700;margin:0 0 6px;}
.nz-title{font-size:26px;font-weight:800;margin:0 0 6px;letter-spacing:-.01em;}
.nz-sub{margin:0;color:var(--muted);font-size:14.5px;max-width:64ch;}

.nz-modes{display:inline-flex;gap:4px;background:#eceaf1;border:1px solid var(--line);
  border-radius:10px;padding:4px;margin:18px 0 8px;flex-wrap:wrap;}
.nz-mode{appearance:none;border:0;background:transparent;cursor:pointer;font:inherit;
  font-weight:600;font-size:13.5px;color:var(--muted);padding:7px 16px;border-radius:7px;}
.nz-mode[aria-pressed="true"]{background:var(--paper);color:var(--plum-deep);box-shadow:0 1px 2px rgba(28,34,48,.08);}
.nz-mode-note{color:var(--muted);font-size:13px;margin:2px 0 18px;max-width:74ch;}

.nz-panel{background:var(--paper);border:1px solid var(--line);border-radius:14px;
  padding:20px;box-shadow:0 1px 3px rgba(28,34,48,.05);}

/* ---- four-column grid ---- */
.nz-colscroll{overflow-x:auto;padding-bottom:6px;}
.nz-cols{display:flex;gap:12px;align-items:flex-start;min-width:min-content;}
.nz-col{flex:1 0 208px;min-width:208px;}
.nz-colhead{width:100%;box-sizing:border-box;text-align:left;appearance:none;cursor:pointer;font:inherit;
  border:1px solid var(--line);border-radius:10px;background:var(--paper);
  padding:9px 12px;margin-bottom:10px;display:flex;flex-direction:column;gap:1px;transition:all .15s ease;}
.nz-colhead:disabled{cursor:default;}
.nz-colkey{font-weight:800;font-size:13px;letter-spacing:.06em;color:var(--muted);}
.nz-coljog{font-size:11px;color:#9a93a8;min-height:14px;}
.nz-colhead.locked{opacity:.45;}
.nz-colhead.active{background:var(--plum);border-color:var(--plum);box-shadow:0 2px 8px rgba(107,78,113,.3);}
.nz-colhead.active .nz-colkey{color:#fff;}
.nz-colhead.active .nz-coljog{color:#e6dcea;}
.nz-colhead.ask{border-style:dashed;border-color:var(--plum);background:var(--plum-soft);}
.nz-colhead.ask .nz-colkey{color:var(--plum-deep);}
.nz-colbody{display:flex;flex-direction:column;gap:10px;}

.nz-card{width:100%;box-sizing:border-box;background:#fcfbfd;border:1px solid var(--line);
  border-radius:11px;overflow:hidden;transition:border-color .2s,box-shadow .2s;}
.nz-card.new{border-color:var(--plum);box-shadow:0 0 0 3px var(--plum-soft);}
.nz-cardtop{display:flex;align-items:center;justify-content:space-between;gap:8px;
  padding:7px 11px;border-bottom:1px solid var(--line);background:var(--plum);}
.nz-cardname{font-weight:700;font-size:12.5px;color:#fff;}
.nz-cardname.unnamed{color:#e6dcea;font-style:italic;font-weight:600;font-size:11.5px;}
.nz-newbadge{font-size:9.5px;font-weight:800;letter-spacing:.07em;color:var(--plum-deep);background:#fff;padding:2px 6px;border-radius:999px;}
.nz-attrs{list-style:none;margin:0;padding:6px 0;}
.nz-attr{padding:4px 11px;font-size:13px;display:flex;align-items:center;gap:6px;}
.nz-attr.pk .nz-attrname{text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1.5px;font-weight:600;}
.nz-attr.focus{background:var(--gold-soft);box-shadow:inset 3px 0 0 var(--gold);}
.nz-tag{font-size:9px;font-weight:800;letter-spacing:.05em;padding:1px 4px;border-radius:4px;}
.nz-tag.pk{color:var(--plum-deep);background:var(--plum-soft);}
.nz-tag.fk{color:#7a5d12;background:var(--gold-soft);}

.nz-ph{border:1px dashed var(--line);border-radius:11px;min-height:90px;display:flex;align-items:center;
  justify-content:center;text-align:center;color:#b8b2c2;font-size:12px;background:#faf9fc;padding:10px;}
.nz-ph.ask{border-color:var(--plum);color:var(--plum-deep);background:var(--plum-soft);font-weight:600;}

.nz-legend{display:flex;flex-wrap:wrap;gap:16px;margin-top:16px;color:var(--muted);font-size:12.5px;}
.nz-legend span{display:inline-flex;align-items:center;gap:6px;}
.nz-legend u{text-underline-offset:3px;text-decoration-thickness:1.5px;}
.nz-sw{width:12px;height:12px;display:inline-block;border-radius:2px;background:var(--gold-soft);box-shadow:inset 3px 0 0 var(--gold);}

/* ---- flat data table (why mode) ---- */
.nz-dwrap{overflow-x:auto;border:1px solid var(--line);border-radius:11px;}
.nz-dtable{width:100%;border-collapse:collapse;font-size:12.5px;}
.nz-dtable th{background:var(--plum);color:#fff;text-align:left;padding:7px 10px;font-weight:700;font-size:11.5px;white-space:nowrap;}
.nz-dtable td{padding:6px 10px;border-bottom:1px solid var(--line);white-space:nowrap;background:#fff;}
.nz-dtable tr:last-child td{border-bottom:0;}
.nz-dtable tr.warn td{background:var(--gold-soft);}
.nz-dtable tr.stale td{background:var(--no-soft);color:#8a2c38;font-weight:700;}
.nz-dtable tr.danger td{background:var(--no-soft);color:#8a2c38;text-decoration:line-through;}
.nz-dtable tr.ghost td{background:#f4f2f8;color:#9a93a8;font-style:italic;}
.nz-dtable td.flag{background:var(--no-soft);color:var(--no);font-weight:800;font-style:normal;}

.nz-anoms{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;}
.nz-anom{appearance:none;cursor:pointer;font:inherit;font-weight:600;font-size:13px;
  border:1px solid var(--line);background:var(--paper);color:var(--ink);padding:8px 14px;border-radius:9px;transition:all .12s ease;}
.nz-anom:hover{border-color:#c7c2d2;}
.nz-anom.active{background:var(--plum);border-color:var(--plum);color:#fff;}

.nz-fix{margin-top:14px;padding:11px 14px;border-radius:10px;font-size:13.5px;max-width:78ch;
  background:var(--plum-soft);border:1px solid #e2d7e7;color:var(--plum-deep);}
.nz-fix b{font-weight:700;}
.nz-stacknote{margin:10px 0 0;font-size:12.5px;color:var(--muted);font-style:italic;max-width:78ch;}

/* ---- source documents (UNF anchor) ---- */
.nz-srcwrap{margin-top:16px;}
.nz-srccard{border-left:3px solid #d7d3de;}
.nz-srctag{font-size:11px;font-weight:700;letter-spacing:.04em;color:var(--muted);background:#edecf0;
  border:1px solid var(--line);padding:3px 9px;border-radius:999px;}
.nz-srclabel{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 8px;}
.nz-repnote{font-size:11.5px;color:#7a5d12;background:var(--gold-soft);border:1px solid #ecdca6;
  border-radius:7px;padding:5px 9px;display:inline-block;margin-top:10px;max-width:78ch;}
.nz-doc-order{background:#efedf1;border:1px solid #d7d3de;border-radius:10px;padding:16px 18px;max-width:560px;}
.nz-doc-title{font-size:16px;font-weight:700;margin-bottom:12px;}
.nz-field{display:flex;align-items:flex-end;gap:8px;font-size:14px;margin:7px 0;}
.nz-field .lbl{white-space:nowrap;}
.nz-field .ln{flex:1;border-bottom:1px solid #9a96a3;min-width:50px;height:14px;}
.nz-doctable{width:100%;border-collapse:collapse;margin-top:14px;}
.nz-doctable th,.nz-doctable td{border:1px solid #8c8893;padding:6px 10px;font-size:13px;text-align:left;}
.nz-doctable th{font-weight:700;}
.nz-doctable tbody td{height:20px;}
.nz-doc-tr{background:#fff;border:1px solid var(--line);border-radius:10px;padding:4px 18px 12px;max-width:640px;}
.nz-doc-tr hr{border:0;border-top:2px solid var(--ink);margin:12px 0;}
.nz-doc-tr .row{font-size:14px;margin:4px 0;}
.nz-trtable{width:100%;border-collapse:collapse;}
.nz-trtable th{text-align:left;font-weight:700;font-size:12.5px;padding:4px 8px;}
.nz-trtable td{padding:4px 8px;font-size:13px;}
.nz-trtable tbody.repeat td{background:var(--gold-soft);}

/* ---- explanation / interaction panel ---- */
.nz-explain{margin-top:18px;background:#fcfbfd;border:1px solid var(--line);border-radius:12px;padding:16px 18px;}
.nz-stagehead{display:flex;align-items:baseline;flex-wrap:wrap;gap:10px;}
.nz-stagetitle{font-size:16.5px;font-weight:800;margin:0;}
.nz-jogger{font-size:11px;font-weight:700;letter-spacing:.04em;color:var(--plum-deep);background:var(--plum-soft);border:1px solid #e2d7e7;padding:3px 9px;border-radius:999px;}
.nz-why{color:var(--muted);font-size:14px;margin:8px 0 0;max-width:78ch;}
.nz-why b{color:var(--ink);font-weight:600;}

.nz-qprompt{font-size:14.5px;font-weight:600;margin:10px 0 12px;max-width:76ch;}
.nz-opts{display:flex;flex-wrap:wrap;gap:8px;}
.nz-opt{display:inline-flex;align-items:center;gap:8px;cursor:pointer;user-select:none;
  border:1px solid var(--line);background:var(--paper);padding:7px 12px;border-radius:9px;font-size:13px;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;transition:all .12s ease;}
.nz-opt:hover{border-color:#c7c2d2;}
.nz-opt.sel{border-color:var(--plum);background:var(--plum-soft);color:var(--plum-deep);font-weight:600;}
.nz-opt input{accent-color:var(--plum);width:15px;height:15px;}
.nz-opt.locked{cursor:default;}
.nz-opt.right{border-color:var(--ok);background:var(--ok-soft);}
.nz-opt.bad{border-color:var(--no);background:var(--no-soft);text-decoration:line-through;}

.nz-feedback{margin-top:14px;padding:11px 14px;border-radius:10px;font-size:13.5px;max-width:78ch;}
.nz-feedback.ok{background:var(--ok-soft);border:1px solid #bfe0cd;color:#235c43;}
.nz-feedback.no{background:var(--no-soft);border:1px solid #efc6cb;color:#8a2c38;}

.nz-final{margin-top:16px;border-top:1px dashed var(--line);padding-top:14px;}
.nz-finaltitle{font-size:14.5px;font-weight:800;margin:0 0 8px;}
.nz-tests{margin:0;padding-left:0;list-style:none;counter-reset:t;}
.nz-tests li{counter-increment:t;position:relative;padding:5px 0 5px 30px;font-size:13.5px;color:var(--muted);}
.nz-tests li::before{content:counter(t);position:absolute;left:0;top:5px;width:20px;height:20px;border-radius:6px;
  background:var(--plum-soft);color:var(--plum-deep);font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;}
.nz-nextstep{color:var(--muted);font-size:13px;margin:12px 0 0;}
.nz-nextstep b{color:var(--ink);}

.nz-nav{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:18px;}
.nz-navr{display:flex;gap:8px;}
.nz-btn{appearance:none;border:1px solid var(--line);background:var(--paper);cursor:pointer;font:inherit;
  font-weight:600;font-size:14px;color:var(--ink);padding:9px 18px;border-radius:9px;transition:all .15s ease;}
.nz-btn:hover:not(:disabled){border-color:#c7c2d2;}
.nz-btn:disabled{opacity:.4;cursor:default;}
.nz-btn.primary{background:var(--plum);border-color:var(--plum);color:#fff;}
.nz-btn.primary:hover:not(:disabled){background:var(--plum-deep);border-color:var(--plum-deep);}
.nz-btn.ghost{border-color:transparent;color:var(--muted);}
.nz-btn.ghost:hover:not(:disabled){color:var(--ink);}
.nz-btn.cta{background:var(--plum);border-color:var(--plum);color:#fff;font-size:15px;font-weight:700;
  padding:11px 26px;box-shadow:0 4px 14px rgba(107,78,113,.38);animation:nz-cta-pulse 2.4s ease-in-out infinite;}
.nz-btn.cta:hover:not(:disabled){background:var(--plum-deep);border-color:var(--plum-deep);
  box-shadow:0 6px 18px rgba(107,78,113,.5);animation:none;}
.nz-btn.cta:disabled{box-shadow:none;animation:none;}
@keyframes nz-cta-pulse{0%,100%{box-shadow:0 4px 14px rgba(107,78,113,.38);}50%{box-shadow:0 4px 20px rgba(107,78,113,.62);}}

/* ---- ER diagram mode ---- */
.nz-ersteps{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}
.nz-erchip{appearance:none;cursor:pointer;font:inherit;font-weight:700;font-size:12.5px;
  border:1px solid var(--line);background:var(--paper);color:var(--muted);padding:7px 13px;border-radius:999px;transition:all .15s ease;}
.nz-erchip:disabled{cursor:default;opacity:.5;}
.nz-erchip.done{color:var(--plum);background:var(--plum-soft);border-color:#d8cee0;}
.nz-erchip.active{background:var(--plum);border-color:var(--plum);color:#fff;box-shadow:0 2px 8px rgba(107,78,113,.3);}
.nz-erwrap{border:1px solid var(--line);border-radius:12px;background:#fcfbfd;padding:14px;overflow-x:auto;}
.nz-erwrap svg{display:block;width:100%;height:auto;max-width:680px;margin:0 auto;}
.nz-erlegend{display:flex;flex-wrap:wrap;gap:16px;margin-top:14px;color:var(--muted);font-size:12.5px;}
.nz-erlegend span{display:inline-flex;align-items:center;gap:7px;}

@media (prefers-reduced-motion:reduce){
  .nz-colhead,.nz-card,.nz-btn,.nz-opt,.nz-anom{transition:none;}
  .nz-btn.cta{animation:none;}
}
`;

/* ============================ PIECES ============================ */

function Attr({ a, focused }) {
  return (
    <li className={`nz-attr nz-mono${a.pk ? " pk" : ""}${focused ? " focus" : ""}`}>
      <span className="nz-attrname">{a.n}</span>
      {a.pk && <span className="nz-tag pk">PK</span>}
      {a.fk && <span className="nz-tag fk">FK</span>}
    </li>
  );
}

function TableCard({ table, isNew, focus }) {
  return (
    <div className={`nz-card${isNew ? " new" : ""}`}>
      <div className="nz-cardtop">
        <span className={`nz-cardname${table.name ? "" : " unnamed"}`}>
          {table.name || "(unnamed)"}
        </span>
        {isNew && <span className="nz-newbadge">NEW</span>}
      </div>
      <ul className="nz-attrs">
        {table.attrs.map((a, i) => (
          <Attr key={i} a={a} focused={focus.includes(a.n)} />
        ))}
      </ul>
    </div>
  );
}

function ColumnGrid({ stages, colState, onJump }) {
  return (
    <div className="nz-colscroll">
      <div className="nz-cols">
        {stages.map((s, i) => {
          const st = colState(i);
          return (
            <div className="nz-col" key={s.key}>
              <button
                className={`nz-colhead${st.active ? " active" : ""}${st.ask ? " ask" : ""}${
                  st.clickable ? "" : " locked"
                }`}
                disabled={!st.clickable}
                onClick={() => onJump(i)}
              >
                <span className="nz-colkey">{s.key}</span>
                <span className="nz-coljog">{s.jogger || "\u00a0"}</span>
              </button>
              <div className="nz-colbody">
                {st.filled ? (
                  s.tables.map((t) => (
                    <TableCard
                      key={t.id}
                      table={t}
                      isNew={st.active && s.newIds.includes(t.id)}
                      focus={st.active ? s.focus : []}
                    />
                  ))
                ) : (
                  <div className={`nz-ph${st.ask ? " ask" : ""}`}>
                    {st.ask ? "Your turn \u2193" : ""}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="nz-legend">
      <span>
        <u className="nz-mono">attr</u> primary key
      </span>
      <span>
        <span className="nz-tag fk">FK</span> foreign key
      </span>
      <span>
        <span className="nz-sw" /> attribute this step acts on
      </span>
    </div>
  );
}

function FinalChecklist({ nextLabel }) {
  return (
    <div className="nz-final">
      <p className="nz-finaltitle">Fully normalized. Now run the 3NF rule check:</p>
      <ol className="nz-tests">
        {threeNfTests.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ol>
      <p className="nz-nextstep">
        <b>Next:</b> {nextLabel}
      </p>
    </div>
  );
}

function SourceDoc({ kind }) {
  return (
    <div className="nz-explain nz-srccard">
      <div className="nz-stagehead">
        <h3 className="nz-stagetitle">Source document</h3>
        <span className="nz-srctag">reference</span>
      </div>
      {kind === "order" ? (
        <>
          <div className="nz-doc-order">
            <div className="nz-doc-title">Sales Order Document</div>
            {["Order No", "Customer No", "Customer Name", "Date of Order", "Delivery Address"].map(
              (l) => (
                <div className="nz-field" key={l}>
                  <span className="lbl">{l}:</span>
                  <span className="ln" />
                </div>
              )
            )}
            <table className="nz-doctable">
              <thead>
                <tr>
                  <th>Item No</th>
                  <th>Item Description</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2].map((i) => (
                  <tr key={i}>
                    <td>{"\u00a0"}</td>
                    <td>{"\u00a0"}</td>
                    <td>{"\u00a0"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <span className="nz-repnote">
            Every attribute on this form was read into the UNF list. The Item table repeats per order
            {"\u00a0"}{"-"} that became the repeating group at 1NF.
          </span>
        </>
      ) : (
        <>
          <div className="nz-doc-tr">
            <hr />
            <div className="row">Student ID: 12121212</div>
            <div className="row">Student Name: Ann Taylor</div>
            <div className="row">Program Code: CompEng</div>
            <div className="row">Program Name: Honours Co-op in Computer Engineering</div>
            <hr />
            <table className="nz-trtable">
              <thead>
                <tr>
                  <th>Course Number</th>
                  <th>Course Name</th>
                  <th>Number of Credits</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody className="repeat">
                <tr>
                  <td>CS123</td>
                  <td>Databases</td>
                  <td>0.5</td>
                  <td>87</td>
                </tr>
                <tr>
                  <td>CS235</td>
                  <td>Software Engineering</td>
                  <td>0.5</td>
                  <td>82</td>
                </tr>
                <tr>
                  <td>CS345</td>
                  <td>HCI</td>
                  <td>0.5</td>
                  <td>85</td>
                </tr>
              </tbody>
            </table>
            <hr />
          </div>
          <span className="nz-repnote">
            Every attribute here was read into the UNF list. The highlighted course rows repeat per
            student {"-"} that became the repeating group at 1NF.
          </span>
        </>
      )}
    </div>
  );
}

/* ==================== WHY MODE (anomalies) ==================== */

function AnomExplain({ active, applied, onApply, onReset }) {
  if (active === "update") {
    return (
      <div className="nz-explain">
        <div className="nz-stagehead">
          <h3 className="nz-stagetitle">Update anomaly</h3>
          <span className="nz-jogger">Redundancy</span>
        </div>
        <p className="nz-why">
          Customer <b>A101</b> is stored on three separate lines, so his name and delivery address
          are duplicated. Change his name and you have to edit every copy.
        </p>
        {!applied ? (
          <button className="nz-btn" style={{ marginTop: 12 }} onClick={onApply}>
            Rename A101 to {"\u201c"}John Smyth{"\u201d"} {"-"} but miss one row
          </button>
        ) : (
          <>
            <div className="nz-feedback no">
              One row still says {"\u201c"}John Smith{"\u201d"}. The database now claims A101 is two
              different people {"-"} the data contradicts itself.
            </div>
            <button className="nz-btn ghost" style={{ marginTop: 10 }} onClick={onReset}>
              Reset
            </button>
          </>
        )}
        <div className="nz-fix">
          In 3NF the name lives in one row of the <b>Customer</b> table, so a rename touches one
          place and can{"\u2019"}t go half-done.
        </div>
        <p className="nz-stacknote">
          In a real app: if an update writes the new name to some order rows but not all, your reads
          start disagreeing with each other.
        </p>
      </div>
    );
  }
  if (active === "insert") {
    return (
      <div className="nz-explain">
        <div className="nz-stagehead">
          <h3 className="nz-stagetitle">Insertion anomaly</h3>
          <span className="nz-jogger">Can{"\u2019"}t store</span>
        </div>
        <p className="nz-why">
          You want to add a new product, {"\u201c"}Flange{"\u201d"} (P4), to the catalogue {"-"}{" "}
          but no one has ordered it yet. Every row here needs an Order_No, and Order_No is part of
          the primary key.
        </p>
        <div className="nz-fix">
          A key attribute can{"\u2019"}t be null (the <b>entity integrity rule</b>), so there{"\u2019"}s
          nowhere to record an unordered item. In 3NF the <b>Item</b> table stands on its own {"-"}{" "}
          you can add a product before any order exists.
        </div>
        <p className="nz-stacknote">
          In a real app: you couldn{"\u2019"}t list a product on the store page until someone bought it
          {"-"} backwards.
        </p>
      </div>
    );
  }
  // delete
  return (
    <div className="nz-explain">
      <div className="nz-stagehead">
        <h3 className="nz-stagetitle">Deletion anomaly</h3>
        <span className="nz-jogger">Lost data</span>
      </div>
      <p className="nz-why">
        Delete order <b>12</b> {"-"} Jill Brown{"\u2019"}s only order. Those rows are the only place
        customer C234 and the item {"\u201c"}Sprocket{"\u201d"} (P3) appear, so deleting the order erases
        the customer and the product along with it.
      </p>
      <div className="nz-fix">
        In 3NF, <b>Customer</b> and <b>Item</b> are separate tables, so removing an order leaves them
        intact.
      </div>
      <p className="nz-stacknote">
        In a real app: cancelling an order shouldn{"\u2019"}t wipe the customer{"\u2019"}s account or pull a
        product from your catalogue.
      </p>
    </div>
  );
}

function WhyMode({ onNext }) {
  const [active, setActive] = useState(null);
  const [applied, setApplied] = useState(false);

  const a101 = flatRows.map((r, i) => (r.cno === "A101" ? i : -1)).filter((i) => i >= 0);
  const lastA101 = a101[a101.length - 1];

  const selectAnom = (id) => {
    setActive(id === active ? null : id);
    setApplied(false);
  };
  const rowClass = (r, i) => {
    if (active === "update") return r.cno === "A101" ? (applied && i === lastA101 ? "stale" : "warn") : "";
    if (active === "delete") return r.ord === "12" ? "danger" : "";
    return "";
  };
  const nameFor = (r, i) =>
    active === "update" && applied && r.cno === "A101" && i !== lastA101 ? "John Smyth" : r.cname;

  return (
    <div className="nz-panel">
      <p className="nz-why" style={{ marginTop: 0 }}>
        Here{"\u2019"}s the Sales Order data <b>before</b> normalization. Customer and item facts are
        copied across rows {"-"} notice John Smith repeated on three lines. Trigger each anomaly to
        see what breaks; these three problems are exactly what UNF {"\u2192"} 3NF removes.
      </p>

      <div className="nz-dwrap" style={{ marginTop: 14 }}>
        <table className="nz-dtable nz-mono">
          <thead>
            <tr>
              {flatCols.map((c) => (
                <th key={c.k}>{c.h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {flatRows.map((r, i) => (
              <tr key={i} className={rowClass(r, i)}>
                {flatCols.map((c) => (
                  <td key={c.k}>{c.k === "cname" ? nameFor(r, i) : r[c.k]}</td>
                ))}
              </tr>
            ))}
            {active === "insert" && (
              <tr className="ghost">
                <td className="flag">null?</td>
                <td>{"-"}</td>
                <td>{"-"}</td>
                <td>{"-"}</td>
                <td>{"-"}</td>
                <td>P4</td>
                <td>Flange</td>
                <td>{"-"}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="nz-anoms">
        {anomalies.map((a) => (
          <button
            key={a.id}
            className={`nz-anom${active === a.id ? " active" : ""}`}
            onClick={() => selectAnom(a.id)}
          >
            {a.label}
          </button>
        ))}
      </div>

      {active && (
        <AnomExplain
          active={active}
          applied={applied}
          onApply={() => setApplied(true)}
          onReset={() => setApplied(false)}
        />
      )}

      <div className="nz-nav">
        <span />
        <button className="nz-btn cta" onClick={onNext}>
          See how it{"\u2019"}s fixed {"\u2192"}
        </button>
      </div>
    </div>
  );
}

/* ===================== WATCH MODE (Order) ===================== */

function WatchMode() {
  const stages = orderStages;
  const [step, setStep] = useState(0); // active/focused column
  const [maxReached, setMax] = useState(0); // furthest revealed
  const last = step === stages.length - 1;
  const s = stages[step];

  const colState = (i) => ({
    filled: i <= maxReached,
    active: i === step,
    ask: false,
    clickable: i <= maxReached,
  });
  const jump = (i) => i <= maxReached && setStep(i);
  const next = () => {
    const n = step + 1;
    setStep(n);
    setMax((m) => Math.max(m, n));
  };

  return (
    <div className="nz-panel">
      <ColumnGrid stages={stages} colState={colState} onJump={jump} />
      <Legend />
      <div className="nz-nav">
        <button className="nz-btn ghost" disabled={step === 0} onClick={() => jump(step - 1)}>
          {"\u2190"} Back
        </button>
        {!last ? (
          <button className="nz-btn cta" onClick={next}>
            {step < maxReached ? "Next" : `Apply ${stages[step + 1].key}`} {"\u2192"}
          </button>
        ) : (
          <button
            className="nz-btn"
            onClick={() => {
              setStep(0);
              setMax(0);
            }}
          >
            {"\u21ba"} Start over
          </button>
        )}
      </div>
      <div className="nz-explain">
        <div className="nz-stagehead">
          <h3 className="nz-stagetitle">{s.title}</h3>
          {s.jogger && <span className="nz-jogger">{s.jogger}</span>}
        </div>
        <p className="nz-why">{s.why}</p>
        {last && (
          <FinalChecklist nextLabel="link the four tables on their shared keys, drop redundant links, then add cardinalities and optionalities to build the ER diagram - the procedure in the worked Order example." />
        )}
      </div>
      <SourceDoc kind="order" />
    </div>
  );
}

/* =================== PRACTICE MODE (Transcript) =================== */

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}

function PracticeMode() {
  const stages = transcriptStages;
  const [cur, setCur] = useState(0); // focused column
  const [solved, setSolved] = useState({}); // idx(1..3) -> true
  const [selected, setSelected] = useState({});
  const [checked, setChecked] = useState({}); // idx -> "ok" | "no"

  const lastIdx = stages.length - 1;
  let frontier = 99;
  for (let i = 1; i <= lastIdx; i++) {
    if (!solved[i]) {
      frontier = i;
      break;
    }
  }

  const colState = (i) => ({
    filled: i === 0 || !!solved[i],
    active: i === cur,
    ask: i === frontier,
    clickable: i === 0 || !!solved[i] || i === frontier,
  });
  const jump = (i) => {
    if (i === 0 || solved[i] || i === frontier) setCur(i);
  };

  const s = stages[cur];
  const q = s.question;
  const isAsking = !!q && !solved[cur] && cur === frontier;
  const sel = selected[cur] || [];
  const result = checked[cur];

  const toggle = (opt) => {
    setSelected((p) => {
      const c = p[cur] || [];
      return { ...p, [cur]: c.includes(opt) ? c.filter((o) => o !== opt) : [...c, opt] };
    });
    setChecked((p) => ({ ...p, [cur]: undefined }));
  };
  const check = () => {
    const ok = sameSet(sel, q.answer);
    setChecked((p) => ({ ...p, [cur]: ok ? "ok" : "no" }));
    if (ok) setSolved((p) => ({ ...p, [cur]: true }));
  };
  const reveal = () => {
    setSelected((p) => ({ ...p, [cur]: [...q.answer] }));
    setChecked((p) => ({ ...p, [cur]: "ok" }));
    setSolved((p) => ({ ...p, [cur]: true }));
  };
  const optClass = (opt) => {
    if (!solved[cur]) return sel.includes(opt) ? "nz-opt sel" : "nz-opt";
    const isAns = q.answer.includes(opt);
    if (isAns) return "nz-opt locked right";
    if (sel.includes(opt)) return "nz-opt locked bad";
    return "nz-opt locked";
  };

  return (
    <div className="nz-panel">
      <ColumnGrid stages={stages} colState={colState} onJump={jump} />
      <Legend />

      {isAsking && (
        <div className="nz-explain">
          <div className="nz-stagehead">
            <h3 className="nz-stagetitle">{s.title}</h3>
            {s.jogger && <span className="nz-jogger">{s.jogger}</span>}
          </div>
          <p className="nz-qprompt">{q.prompt}</p>
          <div className="nz-opts">
            {q.options.map((opt) => (
              <label key={opt} className={optClass(opt)}>
                <input type="checkbox" checked={sel.includes(opt)} onChange={() => toggle(opt)} />
                {opt}
              </label>
            ))}
          </div>
          {result === "no" && <div className="nz-feedback no">{q.wrong}</div>}
        </div>
      )}

      <div className="nz-nav">
        <button className="nz-btn ghost" disabled={cur === 0} onClick={() => jump(cur - 1)}>
          {"\u2190"} Back
        </button>
        <div className="nz-navr">
          {isAsking ? (
            <>
              <button className="nz-btn ghost" onClick={reveal}>
                Show answer
              </button>
              <button className="nz-btn cta" disabled={sel.length === 0} onClick={check}>
                Check
              </button>
            </>
          ) : cur === lastIdx && solved[cur] ? (
            <button
              className="nz-btn"
              onClick={() => {
                setCur(0);
                setSolved({});
                setSelected({});
                setChecked({});
              }}
            >
              {"\u21ba"} Start over
            </button>
          ) : (
            <button className="nz-btn cta" onClick={() => setCur(cur + 1)}>
              {cur === 0 ? "Start" : "Continue"} {"\u2192"}
            </button>
          )}
        </div>
      </div>

      {!isAsking && (
        <div className="nz-explain">
          <div className="nz-stagehead">
            <h3 className="nz-stagetitle">{s.title}</h3>
            {s.jogger && <span className="nz-jogger">{s.jogger}</span>}
          </div>
          {solved[cur] && q && (
            <div className="nz-feedback ok" style={{ marginTop: 12 }}>
              {q.correct}
            </div>
          )}
          <p className="nz-why">{s.why}</p>
          {cur === lastIdx && solved[cur] && (
            <FinalChecklist nextLabel="compare these four tables against your intuitive entity model, then build the ER diagram by linking shared keys and adding cardinalities." />
          )}
        </div>
      )}

      <SourceDoc kind="transcript" />
    </div>
  );
}

/* ==================== ER DIAGRAM MODE ==================== */

function ErBox({ b, highlightShared }) {
  const titleH = 26;
  const lineH = 20;
  const padTop = 6;
  const h = titleH + b.attrs.length * lineH + 8;
  return (
    <g>
      <rect x={b.x} y={b.y} width={b.w} height={h} fill="#fff" stroke="#6b4e71" strokeWidth="1.5" />
      <rect x={b.x} y={b.y} width={b.w} height={titleH} fill="#6b4e71" />
      <text x={b.x + 10} y={b.y + 18} fill="#fff" fontSize="13" fontWeight="700">
        {b.title}
      </text>
      {b.attrs.map((a, i) => {
        const ty = b.y + titleH + padTop + i * lineH + 11;
        const sh = highlightShared && a.shared;
        return (
          <g key={i}>
            {sh && <rect x={b.x + 4} y={ty - 13} width={b.w - 8} height="18" rx="3" fill="#fbf3df" />}
            <text
              x={b.x + 10}
              y={ty}
              fill="#1c2230"
              fontSize="12"
              fontFamily="ui-monospace, Menlo, monospace"
              style={a.pk ? { textDecoration: "underline" } : undefined}
            >
              {a.t}
              {a.fk ? "  (FK)" : ""}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function ErLinks({ showNotation }) {
  const S = "#4a3450";
  return (
    <g stroke={S} strokeWidth="1.6" fill="none">
      <line x1="132.5" y1="118" x2="132.5" y2="300" />
      <line x1="547.5" y1="98" x2="547.5" y2="300" />
      <line x1="225" y1="347" x2="455" y2="347" />
      {showNotation && (
        <>
          <line x1="124.5" y1="128" x2="140.5" y2="128" />
          <line x1="539.5" y1="108" x2="555.5" y2="108" />
          <line x1="235" y1="339" x2="235" y2="355" />
          <line x1="132.5" y1="283" x2="116.5" y2="300" />
          <line x1="132.5" y1="283" x2="132.5" y2="300" />
          <line x1="132.5" y1="283" x2="148.5" y2="300" />
          <line x1="547.5" y1="283" x2="531.5" y2="300" />
          <line x1="547.5" y1="283" x2="547.5" y2="300" />
          <line x1="547.5" y1="283" x2="563.5" y2="300" />
          <line x1="438" y1="347" x2="455" y2="331" />
          <line x1="438" y1="347" x2="455" y2="347" />
          <line x1="438" y1="347" x2="455" y2="363" />
          <circle cx="132.5" cy="274" r="4" fill="#fff" />
          <circle cx="547.5" cy="274" r="4" fill="#fff" />
          <circle cx="446" cy="347" r="4" fill="#fff" />
        </>
      )}
    </g>
  );
}

function ErDiagram({ stage }) {
  return (
    <svg
      viewBox="0 0 660 405"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Entity relationship diagram for the Order example"
    >
      {stage.showLinks && <ErLinks showNotation={stage.showNotation} />}
      {erBoxes.map((b) => (
        <ErBox key={b.id} b={b} highlightShared={stage.highlightShared} />
      ))}
      {stage.showNotation && (
        <g fill="#1c2230" fontSize="11.5" fontStyle="italic">
          <text x="140" y="212">orders</text>
          <text x="556" y="202">is ordered as</text>
          <rect x="306" y="330" width="66" height="16" fill="#fcfbfd" />
          <text x="339" y="342" textAnchor="middle">contains</text>
        </g>
      )}
    </svg>
  );
}

function ErMode() {
  const stages = erStages;
  const [step, setStep] = useState(0);
  const [maxReached, setMax] = useState(0);
  const last = step === stages.length - 1;
  const s = stages[step];
  const jump = (i) => i <= maxReached && setStep(i);
  const next = () => {
    const n = step + 1;
    setStep(n);
    setMax((m) => Math.max(m, n));
  };

  return (
    <div className="nz-panel">
      <div className="nz-ersteps">
        {stages.map((st, i) => (
          <button
            key={st.key}
            className={`nz-erchip${i === step ? " active" : i <= maxReached ? " done" : ""}`}
            disabled={i > maxReached}
            onClick={() => jump(i)}
          >
            {st.key}
          </button>
        ))}
      </div>

      <div className="nz-erwrap">
        <ErDiagram stage={s} />
      </div>

      {s.showNotation && (
        <div className="nz-erlegend">
          <span>Bar = one</span>
          <span>Crow{"\u2019"}s foot = many</span>
          <span>Circle = optional</span>
        </div>
      )}

      <div className="nz-nav">
        <button className="nz-btn ghost" disabled={step === 0} onClick={() => jump(step - 1)}>
          {"\u2190"} Back
        </button>
        {!last ? (
          <button className="nz-btn cta" onClick={next}>
            Next {"\u2192"}
          </button>
        ) : (
          <button
            className="nz-btn"
            onClick={() => {
              setStep(0);
              setMax(0);
            }}
          >
            {"\u21ba"} Start over
          </button>
        )}
      </div>

      <div className="nz-explain">
        <div className="nz-stagehead">
          <h3 className="nz-stagetitle">{s.title}</h3>
        </div>
        <p className="nz-why">{s.why}</p>
      </div>
    </div>
  );
}

/* ============================ ROOT ============================ */

const MODES = [
  { id: "why", label: "Why normalize?" },
  { id: "watch", label: "Watch the process" },
  { id: "practice", label: "Try it yourself" },
  { id: "er", label: "Build the ER diagram" },
];

const MODE_NOTE = {
  why: "The Sales Order data before normalization. Trigger each anomaly to see what breaks: the problems normalization exists to fix.",
  watch:
    "Worked example: a Sales Order document. Step right through each column and read why each attribute moves.",
  practice:
    "Exercise: the student transcript document. Make the call for each column. It unlocks once you get it right (or hit \u201cShow answer\u201d).",
  er: "From the four 3NF tables of the Order example, build the entity-relationship diagram step by step in crow\u2019s foot notation.",
};

export default function NormalizationTutorial() {
  const [mode, setMode] = useState("why");

  return (
    <div className="nz-root">
      <style>{css}</style>
      <div className="nz-wrap">
        <header className="nz-head">
          <p className="nz-eyebrow">MSE 245 Relational model</p>
          <h1 className="nz-title">Normalization: from UNF to 3NF</h1>
          <p className="nz-sub">
            See why normalization matters, then watch a worked example fill in column by column and
            drive the transcript exercise to 3NF yourself.
          </p>
        </header>

        <div className="nz-modes" role="group" aria-label="Choose a mode">
          {MODES.map((m) => (
            <button
              key={m.id}
              className="nz-mode"
              aria-pressed={mode === m.id}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="nz-mode-note">{MODE_NOTE[mode]}</p>

        {mode === "why" && <WhyMode onNext={() => setMode("watch")} />}
        {mode === "watch" && <WatchMode />}
        {mode === "practice" && <PracticeMode />}
        {mode === "er" && <ErMode />}
      </div>
    </div>
  );
}
