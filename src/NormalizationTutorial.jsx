import { useState } from "react";

/**
 * NormalizationTutorial
 * -------------------------------------------------------------
 * Self-guided replacement for the live whiteboard walkthrough of
 * normalization (UNF -> 1NF -> 2NF -> 3NF) for MSE 245.
 *
 * Layout: four persistent columns (UNF | 1NF | 2NF | 3NF), as in the
 * course's worked examples. Columns fill left-to-right as the student
 * advances; earlier columns stay on screen so an attribute can be
 * traced across the normal forms. Only the active column is highlighted.
 *
 * Two modes:
 *   - "watch":    narrated walkthrough of the Order example.
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
    why: "Start with every attribute from the Sales Order document in one list. Order_No identifies an order, but the document records many lines per order \u2014 so Item_No, Item_Desc and Qty repeat. That repetition is what the three rules will remove.",
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
    why: "In the line table the key is (Order_No, Item_No). Item_Desc depends on Item_No alone \u2014 only part of the key \u2014 so it moves out into its own Item table. The order table has a single-attribute key, so it cannot have a part-key dependency and is left unchanged.",
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
    why: "In the order table, Customer_Name and Delivery_Addr depend on Customer_No \u2014 a non-key attribute \u2014 not directly on Order_No. They move into a Customer table (assuming one delivery address per customer). Customer_No stays behind as a foreign key. Now every non-key attribute depends on the key, the whole key, and nothing but the key.",
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
    why: "Every attribute from the transcript document, in one list. One student can take many courses, so the course attributes repeat. Your job is to drive this to 3NF one rule at a time \u2014 each column unlocks when you make the right call.",
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
        "Which attributes form the repeating group \u2014 the ones that occur more than once for a single student?",
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
        "Right. A student has many courses, so CourseNumber, CourseName, NumCredits and Grade repeat. They become their own table, keyed by the compound (Student_ID, CourseNumber) \u2014 you need both to identify one enrolment.",
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
        "Correct. CourseName and NumCredits are properties of the course itself \u2014 they depend on CourseNumber alone, not on which student took it. They move to a Course table. Grade depends on both student and course, so it stays.",
      wrong:
        "Re-check each one: does it change if a different student takes the same course? CourseName and NumCredits don't \u2014 they hang off CourseNumber only. Grade does change per student, so it depends on the whole key and stays put.",
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
        "Exactly. ProgramName depends on ProgramCode, which is itself a non-key attribute \u2014 not directly on Student_ID. It moves to a Program table; ProgramCode stays behind as a foreign key. The model is now in 3NF.",
      wrong:
        "Look for an attribute determined by another non-key attribute rather than by Student_ID. ProgramName is fixed once you know ProgramCode, so it depends on ProgramCode \u2014 a transitive dependency. That's the one to separate.",
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
  border-radius:10px;padding:4px;margin:18px 0 8px;}
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

/* ---- explanation / interaction panel ---- */
.nz-explain{margin-top:18px;background:#fcfbfd;border:1px solid var(--line);border-radius:12px;padding:16px 18px;}
.nz-stagehead{display:flex;align-items:baseline;flex-wrap:wrap;gap:10px;}
.nz-stagetitle{font-size:16.5px;font-weight:800;margin:0;}
.nz-jogger{font-size:11px;font-weight:700;letter-spacing:.04em;color:var(--plum-deep);background:var(--plum-soft);border:1px solid #e2d7e7;padding:3px 9px;border-radius:999px;}
.nz-why{color:var(--muted);font-size:14px;margin:8px 0 0;max-width:78ch;}

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

@media (prefers-reduced-motion:reduce){.nz-colhead,.nz-card,.nz-btn,.nz-opt{transition:none;}}
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
      <div className="nz-explain">
        <div className="nz-stagehead">
          <h3 className="nz-stagetitle">{s.title}</h3>
          {s.jogger && <span className="nz-jogger">{s.jogger}</span>}
        </div>
        <p className="nz-why">{s.why}</p>
        {last && (
          <FinalChecklist nextLabel="link the four tables on their shared keys, drop redundant links, then add cardinalities and optionalities to build the ER diagram \u2014 the procedure in the worked Order example." />
        )}
      </div>
      <div className="nz-nav">
        <button className="nz-btn ghost" disabled={step === 0} onClick={() => jump(step - 1)}>
          {"\u2190"} Back
        </button>
        {!last ? (
          <button className="nz-btn primary" onClick={next}>
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
      <div className="nz-explain">
        <div className="nz-stagehead">
          <h3 className="nz-stagetitle">{s.title}</h3>
          {s.jogger && <span className="nz-jogger">{s.jogger}</span>}
        </div>

        {isAsking ? (
          <>
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
          </>
        ) : (
          <>
            {solved[cur] && q && <div className="nz-feedback ok">{q.correct}</div>}
            <p className="nz-why">{s.why}</p>
            {cur === lastIdx && solved[cur] && (
              <FinalChecklist nextLabel="compare these four tables against your intuitive entity model, then build the ER diagram by linking shared keys and adding cardinalities." />
            )}
          </>
        )}
      </div>

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
              <button className="nz-btn primary" disabled={sel.length === 0} onClick={check}>
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
            <button className="nz-btn primary" onClick={() => setCur(cur + 1)}>
              {cur === 0 ? "Start" : "Continue"} {"\u2192"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================ ROOT ============================ */

export default function NormalizationTutorial() {
  const [mode, setMode] = useState("watch");

  return (
    <div className="nz-root">
      <style>{css}</style>
      <div className="nz-wrap">
        <header className="nz-head">
          <p className="nz-eyebrow">MSE 245 Relational model</p>
          <h1 className="nz-title">Normalization: from UNF to 3NF</h1>
          <p className="nz-sub">
            Watch a
            worked example fill in column by column, then drive the transcript exercise to 3NF
            yourself.
          </p>
        </header>

        <div className="nz-modes" role="group" aria-label="Choose a mode">
          <button
            className="nz-mode"
            aria-pressed={mode === "watch"}
            onClick={() => setMode("watch")}
          >
            Watch the process
          </button>
          <button
            className="nz-mode"
            aria-pressed={mode === "practice"}
            onClick={() => setMode("practice")}
          >
            Try it yourself
          </button>
        </div>
        <p className="nz-mode-note">
          {mode === "watch"
            ? "Worked example: a Sales Order document. Step right through each column and read why each attribute moves."
            : "Exercise: the student transcript document. Make the call for each column \u2014 it unlocks once you get it right (or hit \u201cShow answer\u201d)."}
        </p>

        {mode === "watch" ? <WatchMode /> : <PracticeMode />}
      </div>
    </div>
  );
}
