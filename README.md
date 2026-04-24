# BudgetWise Frontend

React + MUI v5 frontend for the BudgetWise household finance app.

---

## Local development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

This frontend is configured to call the live backend at `https://lambertchan.ca/budget-api`.

---

## Building for production

```bash
npm run build
```

This outputs static files to `/dist`.

---

## Deploying to GlowHost

1. Run `npm run build` on your local machine
2. Open cPanel → **File Manager**
3. Navigate to the document root for the site that serves this frontend
4. Upload **all contents** of the `/dist` folder (not the folder itself — the files inside it)
5. Also upload `public/.htaccess` to the same location

The frontend will call the API at `https://lambertchan.ca/budget-api`.

---

## Pages

| Route | Page |
|-------|------|
| `/` | Dashboard — monthly summary, charts, fund overview |
| `/transactions` | All transactions with scope/date filters |
| `/budgets` | Category budget limits and progress |
| `/household` | Shared income, expenses, and fund status |
| `/accounts` | Account balances and management |
| `/settings` | Personal fund allocations and profile |
