# Line project in Ddd

This is a separate Excel parser project. It does not replace the main `index.html`.

## Main files

- `line.html` — main page
- `line-app.js` — JavaScript Excel parser
- `line-style.css` — styles
- `line-template.html` — creates Excel template
- `line-brands.xlsx` — Excel data file, upload manually

## How to use

1. Open `line-template.html`.
2. Click **Download line-brands.xlsx**.
3. Edit the Excel file.
4. Upload `line-brands.xlsx` to the same folder/location as `line.html`.
5. Open `line.html`.

## Excel columns

```text
id, brand, category, country, price, description, image, link, active, sort
```

`brand` is required. `active` can be `yes` or `no`.

## Important

Browser JavaScript can read Excel, but cannot save edited Excel back to GitHub/uCoz automatically. To update data, edit `line-brands.xlsx` and upload it again.
