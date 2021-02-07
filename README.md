<br />
<p align="center">
  <h3 align="center">Seek Cart Microservice</h3>

  <p align="center">
    Seek Coding Challenge
    <br />
  </p>
</p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
  * [Built With](#built-with)
  * [Features]($features)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
* [Notes](#notes)
* [Contact](#contact)

<!-- ABOUT THE PROJECT -->
## About The Project

A Cart Microservice for Seek's Coding Challenge

### Built With
* Node.js 12
* Koa
* AWS Dynamodb
* Docker Compose

### Features
* /add   - Add a product to the cart
  * Validates customer and product.
  * Adds a product to a customer's cart.
  * Will update a product's quantity if it is already in cart.

* /total - Get the total of a cart
  * Validates customer
  * Queries a product for discounts, queries a customer for their discount groups
  * Applies the intersection of the two queries against products.
  * Returns the `total` (undiscounted) price and the `discountTotal`.

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

* Node.js 12
* npm

### Installation
 
1. Clone the repo
2. Install NPM packages
```sh
npm install
```
3. Run the app
```sh
npm run local
```

### Testing
1. Run the tests
```sh
npm test
```

## Usage

Add Endpoint

```sh
curl --location --request POST 'localhost:3000/add' \
--header 'customer-id: customer-000001' \
--header 'Content-Type: application/json' \
--data-raw '{
    "product": "product-stand_out"
}'
```
```
200 OK
---
Product successfully added
```

Total Endpoint
```sh
curl --location --request GET 'localhost:3000/total' \
--header 'customer-id: customer-000001'
```
```
200 OK
---
{
    "total": 1778.94,
    "discountTotal": 1508.95
}
```

## Notes

* Customers can belong to multiple discount groups.
* Discount groups can have multiple discounts associated with them.
* Discounts can only map to one product and one discount group.
* A product can have multiple discounts.
* Discounts can be Flat (eg. $300 off) discounts or Quantity (eg. 3 for 2) based discounts.

I thought it would be a little bit of fun to try out Dynamodb's Modelling of relational data (https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-modeling-nosql-B.html) because I thought a traditional relational database was too easy.

### Assumptions
* All products added are in stock.
* Could have used Swagger and Typescript but thought development time would take too long.
* Could have moved the routes into a separate file from index.js but I ran out of time.
* Could have used a proper logger but ran out of time.

## Contact

Sam Chung - samchungy@gmail.com