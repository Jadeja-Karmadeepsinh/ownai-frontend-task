# React.js Assessment – Purchase Order Form

## Overview

This task is a **React.js Purchase Order Form** developed as part of a frontend assessment.  
The goal was to replicate the provided UI layout and implement all required **validations, form behavior, and business logic** using **React functional components and hooks**, along with **HTML, CSS, and Bootstrap**.

---

## Tech Stack

- **React.js** (Functional Components + Hooks)
- **JavaScript (ES6+)**
- **HTML5**
- **CSS3**
- **Bootstrap** (for styling & responsiveness)

---

## Getting Started

### 1️. Clone the Repository
```bash
git clone https://github.com/Jadeja-Karmadeepsinh/ownai-frontend-task.git
```

### 2. Open `index.html` in your browser

---

## Features Implemented

### Purchase Order Details

- **Client Name**
  - Mandatory
  - Single-selection dropdown

- **Purchase Order Type**
  - Mandatory
  - Dropdown options:
    - Group PO
    - Individual PO

- **Purchase Order No**
  - Mandatory
  - Alphanumeric + special characters allowed

- **Received On**
  - Mandatory
  - Date picker

- **Received From**
  - Mandatory
  - Includes:
    - Name
    - Email ID

- **PO Start Date**
  - Mandatory
  - Date picker

- **PO End Date**
  - Mandatory
  - Date picker
  - Cannot be earlier than PO Start Date

- **Budget**
  - Mandatory
  - Numeric input
  - Maximum 5 digits
  - Currency selector

---

### Talent Details

- **Job Title / REQ Name**
  - Mandatory
  - Single-selection dropdown
  - Displays REQs associated with the selected client

- **REQID / Assignment ID**
  - Auto-filled on Job Title selection
  - Each REQ handled as a separate section
  - One REQ shown by default

- **Add Another REQ**
  - Visible **only for Group PO**
  - Allows multiple REQ sections

- **Talent Listing & Selection**
  - Talents displayed after selecting REQ
  - Selecting a talent:
    - Opens associated mandatory detail fields
  - Rules:
    - **Individual PO:** Only one talent allowed
    - **Group PO:** Minimum two talents required

---

## Form Behavior

- **Submit**
  - Validates all fields
  - Logs complete form data to the console

- **Read-Only Mode**
  - After successful submission, form switches to read-only view mode

- **Reset**
  - Clears the entire form
  - Allows fresh data entry and re-submission

---

## Validations & Error Handling

- Mandatory field validation
- Conditional validation based on PO type
- Date dependency validation (Start Date → End Date)
- Talent selection rules enforcement
- Meaningful inline error messages
- Graceful handling of invalid states

---

## Responsiveness & Styling

- Fully responsive layout using **Bootstrap**
- Clean and structured UI
- Matches the provided design reference closely

---

## React Best Practices Used

- Functional components
- `useState` and `useEffect` for state management
- Controlled form inputs
- Conditional rendering for dynamic sections
- Clean and modular component structure
- Readable and maintainable code

---
