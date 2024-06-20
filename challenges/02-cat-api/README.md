# Cat API

1. Accept `'boxes' | 'clothes' | 'hats' | ... ` or another value from https://api.thecatapi.com/v1/categories?api_key=MjcxMzkw.
2. Request categories from that URL to turn the string into a category id. Cache the data once we’ve fetched it, and expire the cache every 15 minutes.
3. Expose a function accepting one of those category names and request 20 images from the api
4. Return the URLs of the images as an array of strings. If something went wrong (network failure, wrong data came back, etc), return an object `{ error: string }`.
