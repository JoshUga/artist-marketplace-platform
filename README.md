# artist-marketplace-platform
A comprehensive microservices-based online marketplace connecting artists with buyers. This platform enables artists to create detailed profiles and portfolios, manage art listings, and process secure payments. Buyers can discover art through advanced search and filters, place orders, and leave reviews. An administrative dashboard allows for robust

## Payram payment integration

- `docker-compose.yml` now includes a `payram` service based on `payramapp/payram:latest` with both API and HTTP ports exposed.
- Artwork payments are initiated through `POST /products/{product_id}/payments/checkout`.
- Merchant domain payments are initiated through `POST /products/merchant/payments/domain/checkout`.
- Product detail page now uses the **Buy Now** action to create a checkout session and redirect to Payram.
