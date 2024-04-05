# Druvis: Translate English article to Japanese and summarize it

## Typegen

Generate types for your Cloudflare bindings in `wrangler.toml`:

```sh
bun typegen
```

You will need to rerun typegen whenever you make changes to `wrangler.toml`.

## Development

Run the Vite dev server:

```sh
bun dev
```

To run Wrangler:

```sh
bun run build
bun start
```

## Deployment

> [!WARNING]
> Cloudflare does _not_ use `wrangler.toml` to configure deployment bindings.
> You **MUST** [configure deployment bindings manually in the Cloudflare dashboard][bindings].

First, build your app for production:

```sh
bun run build
```

Then, deploy your app to Cloudflare Pages:

```sh
bun run deploy
```

[bindings]: https://developers.cloudflare.com/pages/functions/bindings/
