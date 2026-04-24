# BudgetWise Frontend

React + MUI v5 frontend for the BudgetWise household finance app.

---

## Local development

```bash
# Install dependencies
npm install

# Start dev server (proxies /api to localhost:3000)
npm run dev
```

Make sure the backend (`budget-api`) is running locally first.

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
3. Navigate to `/public_html/budget-api` (your subdomain root)
4. Upload **all contents** of the `/dist` folder (not the folder itself — the files inside it)
5. Also upload `public/.htaccess` to the same location

Your app will be live at `lambertchan.ca/budget-api`.

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
