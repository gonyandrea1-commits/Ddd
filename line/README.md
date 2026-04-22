# line — Brands Excel Parser

This folder contains a small JavaScript project that loads brand data from Excel.

## Files

- `index.html` — main page
- `app.js` — JavaScript parser for Excel
- `styles.css` — page styles
- `baza-template.html` — helper page that generates `brands.xlsx`
- `brands.xlsx` — Excel data file to upload manually into this folder

## Excel file name

The main page looks for this file:

```text
line/brands.xlsx
```

## Required Excel sheet

Preferred sheet name:

```text
brands
```

If there is no `brands` sheet, the parser reads the first sheet.

## Columns

Use these columns:

```text
id, brand, category, country, price, description, image, link, active, sort
```

`brand` is required. `active` can be `yes` or `no`.

## How to create Excel

Open:

```text
line/baza-template.html
```

Click **Download brands.xlsx**, then upload the downloaded file into this same `line` folder.

## Important

Browser JavaScript can read Excel from the server, but it cannot save changes back to the uCoz/GitHub server by itself. To change data, edit `brands.xlsx` and upload it again.
