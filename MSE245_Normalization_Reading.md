# Relational Databases and Normalization

**MSE 245, Lecture 7-2: Reading notes**

These notes follow the lecture slides and go into more detail than the slides themselves. They are meant to be read alongside the interactive tutorial: the tutorial walks through the mechanics of normalization step by step, and these notes cover the surrounding theory (the relational model, the integrity rules, primary keys, functional dependency, and how to turn a set of normalized tables into an ER diagram).

---

## 1. The relational model

A relational database stores data in **tables** (also called relations). The relational model has three parts:

1. A **structural** part: the tables themselves. A table is made up of **rows** (each row is one instance of an entity) and **columns** (each column is an attribute of that entity).
2. A **manipulative** part: a set of operations that act on tables and produce new tables. In practice this is SQL.
3. A set of **rules** that keep the data consistent (the integrity rules, covered in Section 5).

A useful way to read these three parts: the structure says what the data looks like, the manipulative part says how you query and change it, and the rules say what states the data is and is not allowed to be in.

## 2. From an entity to a table

When you design a database, each **entity** (a thing you want to keep data about, such as a customer or an order) becomes a table. The attributes of the entity become the columns of the table, and each real-world instance becomes a row.

For example, an Order entity with the attributes OrderID, CustomerID, and OrderDate becomes a table named Order with those three columns, and one row per order.

## 3. Characteristics of a table

A well-formed table in a relational database has these properties:

- **Single-valued cells.** A cell (the value in one column of one row) holds exactly one value. There are no multi-valued attributes and no lists packed into a single cell.
- **A primary key.** Each row is uniquely identified by a **primary key (PK)**: one column, or a combination of columns, whose value is different for every row.
- **Foreign keys.** A column that holds the primary key value of another table is a **foreign key (FK)**. Foreign keys are how tables refer to one another.
- **Foreign key placement in a one-to-many relationship.** In a one-to-many (1:M) relationship, the foreign key always sits in the table at the "many" end. For example, many orders belong to one customer, so the Order table carries CustomerID as a foreign key, not the other way around.

## 4. Keys in more detail

A **candidate key** is any column or set of columns that could uniquely identify a row. A table may have several candidate keys. You choose one of them as the **primary key**.

When you have a choice of candidate keys, prefer the one that is:

- **Smallest** (fewest columns).
- **Numeric** rather than alphabetic, where you have the option, since numeric keys are compact and fast to compare.

If a table has no column or combination of columns that uniquely identifies a row, it may not be a genuine entity table, and you should reconsider the design.

A **composite key** is a primary key made of more than one column. Composite keys appear often after normalization, for example in a table that records which items appear on which orders.

## 5. Database integrity rules

Two rules protect the consistency of the data:

- **Entity integrity rule:** no part of a primary key may be null. Every row must be identifiable, so the key that identifies it cannot be missing. This is the rule behind the insertion problem in Section 10: you cannot record a row whose key is not yet known.
- **Referential integrity rule:** for every foreign key value there must be a matching primary key value in the referenced table (or the foreign key must be null where that is allowed). This stops a row from referring to something that does not exist, for example an order that points to a customer who is not in the Customer table.

## 6. Four rules that apply to every table

These follow from the relational model and are worth stating explicitly:

1. The order of the rows is not significant.
2. The order of the columns is not significant.
3. Each row must be unique.
4. Each column holds only one value per row.

## 7. Entity-relationship diagrams

An **entity-relationship diagram (ERD)** shows the entities in a system and the relationships between them. Each entity is a box; each relationship is a line connecting two boxes.

A relationship has a **cardinality**, which says how many instances of one entity relate to how many of the other. The common cardinalities are one-to-one (1:1), one-to-many (1:M), and many-to-many (M:N). A relationship also has an **optionality**, which says whether participation is mandatory or optional (whether zero instances are allowed).

In **crow's foot notation**, which is the notation used in this course:

- A single **bar** across the line near an entity marks the "one" end.
- A **crow's foot** (a three-pronged fork) marks the "many" end.
- A small **circle** on the line shows optional participation (zero is allowed); a bar in that position shows mandatory participation (at least one).

Relationships are also given names, read in the direction of the relationship, such as "a Customer orders an Order".

## 8. Building a relational model

The overall workflow for turning a set of requirements into a relational design is:

1. Identify the attributes you need to store.
2. Find the right entity (table) for each attribute. This is the job of normalization.
3. Identify the relationships between the resulting tables.
4. Compare the result with the intuitive entity model you sketched at the start, and reconcile any differences.

The key idea is that normalization is not a separate exercise. It is the disciplined way of deciding which attribute belongs in which table.

## 9. Functional dependency

Normalization rests on the idea of **functional dependency**. An attribute B is functionally dependent on an attribute (or set of attributes) A if, for any one value of A at a given moment, there is exactly one possible value of B. We say "A determines B".

In a well-designed table, every non-key attribute is functionally dependent on the primary key, and on nothing else. If an attribute is not dependent on the key, it belongs in a different table. The whole of normalization is the repeated application of that single sentence.

## 10. Why normalize: the three anomalies

Normalization is the process of examining a list of attributes and applying a set of rules that convert it into a form that minimizes duplication, avoids redundancy, and protects data integrity.

The reason this matters is easiest to see in a flat, un-normalized table where customer and item facts are copied across many rows. Three problems appear, and they are the problems normalization removes:

- **Update anomaly.** Because a fact (such as a customer's name) is stored in many rows, changing it means changing every copy. If even one row is missed, the table now holds two conflicting values for the same fact, and the data contradicts itself.
- **Insertion anomaly.** You cannot record a fact until an unrelated fact also exists. For example, if every row must carry an Order_No, and Order_No is part of the key, then you cannot add a new product to the catalogue until somebody orders it, because there is no order to attach it to. This is the entity integrity rule biting: a key value cannot be null.
- **Deletion anomaly.** Removing one row throws away facts you wanted to keep. If a customer's only order is the only place that customer appears, deleting the order erases the customer too.

The "Why normalize?" mode of the interactive tutorial lets you trigger each of these on a flat Order table.

## 11. The three normal forms

Normalization applies three rule-checks one after another. An entity passes through these forms:

- **UNF** (un-normalized form): a single list of every attribute.
- **1NF** (first normal form): no repeating groups.
- **2NF** (second normal form): no part-key dependencies.
- **3NF** (third normal form): no non-key dependencies.

The memory jogger is: **repeating groups, part-key dependencies, non-key dependencies**.

We will use the Sales Order Document as the worked example, with one assumption: there is one delivery address for each customer.

### UNF

Read every attribute off the Sales Order form into one list. The primary key of the order is Order_No, but the form records many lines per order, so Item_No, Item_Desc, and Qty repeat.

```
Order_No (PK), Customer_No, Customer_Name, Order_Date,
Delivery_Addr, Item_No, Item_Desc, Qty
```

### 1NF: separate repeating groups

Item_No, Item_Desc, and Qty repeat for every line on an order. Lift that repeating group into its own table. To identify one line you need both the order and the item, so the new table has the composite key (Order_No, Item_No).

```
Order:  Order_No (PK), Customer_No, Customer_Name, Order_Date, Delivery_Addr
Line:   Order_No (PK), Item_No (PK), Item_Desc, Qty
```

### 2NF: remove part-key dependencies

A part-key dependency is when a non-key attribute depends on only part of a composite key. In the Line table, the key is (Order_No, Item_No). Item_Desc depends on Item_No alone, not on the whole key, so it moves into its own Item table. The Order table has a single-column key, so it cannot have a part-key dependency and is unchanged.

```
Order:  Order_No (PK), Customer_No, Customer_Name, Order_Date, Delivery_Addr
Line:   Order_No (PK), Item_No (PK), Qty
Item:   Item_No (PK), Item_Desc
```

### 3NF: remove non-key dependencies

A non-key dependency (also called a transitive dependency) is when a non-key attribute depends on another non-key attribute. In the Order table, Customer_Name and Delivery_Addr depend on Customer_No, which is itself a non-key attribute, not directly on Order_No. They move into a Customer table. Customer_No stays in the Order table as a foreign key.

```
Order:     Order_No (PK), Customer_No (FK), Order_Date
Customer:  Customer_No (PK), Customer_Name, Delivery_Addr
OrderItem: Order_No (PK, FK), Item_No (PK, FK), Qty
Item:      Item_No (PK), Item_Desc
```

At this point every non-key attribute depends on the key, the whole key, and nothing but the key.

The full migration in one view. Within each column, a blank cell marks the boundary where a new table splits off, so you can see the entities forming from left to right:

| UNF | 1NF | 2NF | 3NF | Table |
| --- | --- | --- | --- | --- |
| Order_No | Order_No | Order_No | Order_No | Order |
| Customer_No | Customer_No | Customer_No | Customer_No | |
| Customer_Name | Customer_Name | Customer_Name | Order_Date | |
| Order_Date | Order_Date | Order_Date | | |
| Delivery_Addr | Delivery_Addr | Delivery_Addr | Customer_No | Customer |
| Item_No | | | Customer_Name | |
| Item_Desc | Order_No | Order_No | Delivery_Addr | |
| Qty | Item_No | Item_No | | |
| | Item_Desc | Qty | Order_No | OrderItem |
| | Qty | | Item_No | |
| | | Item_No | Qty | |
| | | Item_Desc | | |
| | | | Item_No | Item |
| | | | Item_Desc | |

## 12. Testing for third normal form

To check whether a table is in 3NF, apply three tests to its non-key attributes:

1. For each non-key attribute, is there just one possible value for a given value of the key?
2. Do all of the non-key attributes depend on the whole key?
3. Do all of the non-key attributes depend directly on the key?

Test 1 corresponds to 1NF, Test 2 to 2NF, and Test 3 to 3NF.

## 13. Merging common entities

When you normalize several documents, the same entity often appears in more than one of them. For example, a Customer table might come out of both an order form and an invoice form. Merge the different versions of the same entity into one, combining their attributes, and then re-apply the 3NF tests to the merged table to make sure the result is still fully normalized.

## 14. From 3NF tables to an ER diagram

Once you have a set of 3NF tables, you can build the ER diagram directly from them. The rules are:

1. **Link entities that share a key.** Join any two entities that share an attribute, whether the shared attribute is a primary key or a foreign key.
2. **Remove redundant links.** If the link from A to C carries the same meaning as the path from A to B to C, the direct A to C link is redundant and should be removed.
3. **Add cardinalities.** Where a shared attribute is a simple primary key in one entity and either a foreign key or part of a composite key in the other, the first entity is at the "one" end and the second is at the "many" end of a one-to-many relationship.
4. **Draw the complete diagram** from these links and cardinalities.
5. **Add optionalities and relationship names.**
6. **Compare** the diagram you built from normalization with your intuitive diagram. At this stage you may add entities that normalization did not produce, such as subtypes. Then run the three 3NF tests one last time on the final model.

For the Order example, the four 3NF tables share keys as follows: Customer and Order share Customer_No; Order and OrderItem share Order_No; Item and OrderItem share Item_No. There are no redundant links. Applying the cardinality rule gives three one-to-many relationships:

- A Customer **orders** an Order (one Customer, many Orders).
- An Order **contains** an OrderItem (one Order, many OrderItems).
- An Item **is ordered as** an OrderItem (one Item, many OrderItems).

In crow's foot notation, the bar sits at the Customer, Order, and Item ends (the "one" ends), and the crow's foot sits at the Order and OrderItem ends (the "many" ends). The "Build the ER diagram" mode of the tutorial constructs this diagram one step at a time.

## 15. Summary of the normalization process

1. List the un-normalized attributes for each document or entity.
2. Apply the three normal-form rules in turn to produce fully normalized tables.
3. Merge different versions of the same entity.
4. Re-apply the 3NF test to each merged table.
5. Build the ER diagram and compare it with your intuitive entity model.

## 16. Exercise: the student transcript

Normalize the data on the student transcript document. The starting attributes are:

```
Student_ID (PK), StudentName, ProgramCode, ProgramName,
CourseNumber, CourseName, NumCredits, Grade
```

Work through it in the "Try it yourself" mode of the tutorial, which checks your answer at each step. For reference, the fully normalized result is:

```
Student:          Student_ID (PK), StudentName, ProgramCode (FK)
Program:          ProgramCode (PK), ProgramName
Course Enrolment: Student_ID (PK, FK), CourseNumber (PK, FK), Grade
Course:           CourseNumber (PK), CourseName, NumCredits
```

The reasoning mirrors the Order example: the course rows are the repeating group (separated at 1NF); CourseName and NumCredits depend on CourseNumber alone, which is part of the composite key (separated at 2NF); and ProgramName depends on ProgramCode, a non-key attribute (separated at 3NF).

## Using the interactive tutorial

https://instructormsci.github.io/mse-245-normalization-tutorial/

The tutorial has four modes that line up with these notes:

- **Why normalize?** demonstrates the update, insertion, and deletion anomalies (Section 10).
- **Watch the process** is the worked Order example from UNF to 3NF (Section 11).
- **Try it yourself** is the transcript exercise (Section 16).
- **Build the ER diagram** constructs the crow's foot diagram from the 3NF tables (Section 14).
