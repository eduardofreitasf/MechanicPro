---
trigger: always_on
glob: "**/*"
description: Domain overview, rules, and core concepts for MechanicPro
---

# MechanicPro Domain Rules

## 1. Domain Overview & Purpose
- **Core Purpose**: MechanicPro is an offline-first desktop management application designed for mechanic and vehicle repair shops. It allows shop operators to manage clients, track vehicles, record service history, manage shop expenses, customize/print reports, and export/import data for backup purposes.

## 2. Key Domain Entities & Relationships
- **Client**: Represents a vehicle owner. Must have a name and optional phone number. Client names must be unique among active (non-deleted) clients.
- **Vehicle**: A customer's car or vehicle. Always belongs to a single Client and is identified by a license plate (normalized to uppercase, must be unique among active vehicles). Brand, model, and year are associated attributes.
- **Service Order**: A vehicle repair/maintenance service record. Tracks the vehicle, mileage at entry, labor hours, hourly labor rate, observations, and total price. Total price is calculated at creation as `(hours * hourly_rate) + sum(operation_prices)` and stored permanently.
- **Service Operation**: A specific task or part replacement line-item inside a Service Order. Each operation has a description and a price.
- **Expense**: A financial expenditure recorded in the shop (e.g. rent, utility bills, inventory purchase) containing date, description, cost, and receipt number.
- **Setting**: Configuration parameters for personalizing PDF/print layouts (company name, colors, styles, logo base64, visibility options).

## 3. Business & Financial Rules
- **Soft Deletion Protocol**: The main entities (`clients`, `vehicles`, `service_orders`, `expenses`) are never hard-deleted. They use a `deleted_at` timestamp. All listing, sorting, and fetching views must show active entities only (`deleted_at IS NULL`).
- **Uniqueness Check Rules**: Active client names and vehicle plates must be unique. Ensure plate inputs are trimmed and forced to uppercase before storing. Duplicate checks are enforced both in SQL (partial unique index) and in the application service layer (for clean error handling).
- **Price Calculation Invariance**: The total price of a Service Order is calculated and stored in the database at the time of creation. It must NOT be recalculated dynamically on reads. This keeps historical financial records invariant to any subsequent changes in hourly labor rates or operation prices.
- **PDF Visibility Rules**: Service Orders and Service Operations support custom toggles to hide/show individual operation prices or the entire labor breakdown on the client-facing print layout.
