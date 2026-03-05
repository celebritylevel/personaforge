# PersonaForge

A Meta Ads creative tool for ICP discovery and ad angle generation.

## Features

- **ICP Discovery**: Enter a product description or website URL to automatically discover ideal customer personas using AI research
- **Persona Generation**: Creates 10+ distinct personas with pain points, buying reasons, demographics, and psychographics
- **Ad Angle Generation**: Generates compelling Meta Ads angles based on discovered personas
- **Andromeda Update Aligned**: Designed to create diverse ad creatives targeting different audience segments

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Perplexity API for AI research
- Cloudflare D1 for data persistence

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with:
   ```
   PERPLEXITY_API_KEY=your_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

### ICP Discovery

1. Enter a product description (e.g., "19 yo OnlyFans creator from US") or paste a website/OnlyFans/Fanvue URL
2. Click "Discover Personas"
3. Review the discovered personas with their pain points and buying reasons

### Ad Angles Generation

1. After completing ICP discovery, switch to the "Ad Angles" tab
2. Click "Generate Angles" to create ad angles for each persona
3. Each angle includes a hook, pain point, angle copy, CTA, and creative suggestions

## Deployment

The app is designed to be deployed on Cloudflare Pages with D1 database.

1. Create a D1 database:
   ```bash
   wrangler d1 create personaforge-db
   ```

2. Update `wrangler.toml` with your database ID

3. Apply the schema:
   ```bash
   wrangler d1 execute personaforge-db --file=./schema.sql
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

## License

MIT
