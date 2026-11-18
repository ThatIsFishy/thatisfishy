# That Is Fishy

A beginner's aquarium blog, knowledge base and shop list.
Built with Astro (pages), Sveltia CMS (writing screen at /admin), GitHub (storage) and Netlify (hosting).

## Where things live

| What | Where |
|---|---|
| Guides | `src/content/guides/*.md` |
| Journal entries | `src/content/journal/*.md` |
| Shops | `src/content/shops/*.json` |
| Site name and tagline | `src/consts.ts` |
| Colours and fonts | `src/styles/global.css` |
| CMS settings | `public/admin/config.yml` |

You can edit these files directly, or write in the CMS at `/admin` once the site is live.

## Run it on your computer

1. Install Node.js 22.23 or newer from nodejs.org.
2. In this folder run `npm install`, then `npm run dev`.
3. Open the address it prints (usually http://localhost:4321).

## Put it online

1. Create a GitHub repository named `thatisfishy` and upload this folder's files (not `node_modules` or `dist`).
2. The CMS settings in `public/admin/config.yml` already point to `ThatIsFishy/thatisfishy`. Change that line only if your username or repository name differs.
3. In Netlify choose "Add new site", then "Import an existing project", pick GitHub and the `thatisfishy` repository. The settings come from `netlify.toml`.
4. Wait for the first deploy. Your site appears at a `*.netlify.app` address.

## Log in to the writing screen

1. Open `your-site/admin/`.
2. Choose the GitHub sign-in option that uses a personal access token.
3. In GitHub, create a fine-grained token limited to the `thatisfishy` repository with read and write access to "Contents".
4. Paste the token into the CMS. Keep the token private.

When you publish in the CMS, it saves a file to GitHub and Netlify rebuilds the site.

## Connect your domains

1. In Netlify open Domain management and add `thatisfishy.com` as the primary domain.
2. Add `thatisfishy.nl` and `thatisfishy.eu` as domain aliases, so they forward to the primary.
3. Follow Netlify's instructions for the DNS records, and enter them in each domain's DNS settings at Porkbun.
4. Netlify then issues a free HTTPS certificate.

## First things to change

- Replace the three sample shops with real ones, or delete them.
- Rewrite the guides in your own words as you learn.
- Update the About page.
