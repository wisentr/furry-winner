# Node.js recruitment task

## Prerequisites

You need to have docker and docker-compose installed on your local computer.

## Run this repo locally

1. Clone this repository
2. Create a .env file
3. Populate with the following required keys (keys 3 to 9 are firebase project keys)

```
JWT_SECRET=
IMDB_API_KEY=
API_KEY=
AUTH_DOMAIN=
DATABASE_URL=
PROJECT_ID=
STORAGE_BUCKET=
MESSAGING_SENDER_ID=
APP_ID=
```

4. Run `docker-compose up -d` from the root directory
5. When you want to turn it off, run `docker-compose down`

## Test this repo locally

1. Do the steps on the previous section up until running it
2. Run `docker-compose -f docker-compose-ci.yml up --abort-on-container-exit`

## Example request to the MoviesService

API uses the query params, like IMDB API. The parameter 't' is kept the same as the OMDB API.

### /GET movies request

```
curl --location --request GET '127.0.0.1:3001/movies' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywibmFtZSI6IkJhc2ljIFRob21hcyIsInJvbGUiOiJiYXNpYyIsImlhdCI6MTYzMjk1NDYxNywiZXhwIjoxNjUwOTU0NjE3LCJpc3MiOiJodHRwczovL3d3dy5uZXRndXJ1LmNvbS8iLCJzdWIiOiIxMjMifQ.1gAKj4mN2x8A1Ic0e3yxKII5_Fi885oamewuviIe5jA'
```

### /GET movies response

```
[{"director":"David Yates","genre":"Adventure, Drama, Fantasy","released":"15 Jul 2011","timestamp":1633164541,"title":"Harry Potter and the Deathly Hallows: Part 2"},{"director":"Joe Pytka","genre":"Animation, Adventure, Comedy","released":"15 Nov 1996","timestamp":1632865274,"title":"Space Jam"}]
```

### /POST movies request

```
curl --location --request POST '127.0.0.1:3001/movies?t=Harry' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywibmFtZSI6IkJhc2ljIFRob21hcyIsInJvbGUiOiJiYXNpYyIsImlhdCI6MTYzMjg2Nzg4OSwiZXhwIjoxNjMzMDQ3ODg5LCJpc3MiOiJodHRwczovL3d3dy5uZXRndXJ1LmNvbS8iLCJzdWIiOiIxMjMifQ.VcsBALHuiFhPlYIv0MdTQzmUvQYizmmXC8yyU3SRbjc'
```

### /POST movies response

```
{
    "title": "Harry Potter and the Deathly Hallows: Part 2",
    "released": "15 Jul 2011",
    "genre": "Adventure, Drama, Fantasy",
    "director": "David Yates",
    "timestamp": 1633167734
}
```

## Technologies Used

- Express.js
- Firebase Client SDK
- Jest for unit testing
- Supertest for end to end testing
- Docker

## What I would have done differently in real world

1. The authservice doesn't provide authentication, I would also implement it, and implement some logic with Firebase Functions to check users' access to the Realtime Database. At the moment, there's nothing stopping a malign user to smash my public database.
2. I would NEVER publish my .env file here, it is here just because I wanted you to test the app easily. Firebase Realtime database will be inaccessible after Fri Oct 08 2021 21:59:59 GMT+0000

## Recruitment task description

We'd like you to build a simple Movie API. It should provide two endpoints:

1. `POST /movies`
   1. Allows creating a movie object based on movie title passed in the request body
   2. Based on the title additional movie details should be fetched from
      https://omdbapi.com/ and saved to the database. Data we would like you to
      fetch from OMDb API:
   ```
     Title: string
     Released: date
     Genre: string
     Director: string
   ```
   3. Only authorized users can create a movie.
   4. `Basic` users are restricted to create 5 movies per month (calendar
      month). `Premium` users have no limits.
1. `GET /movies`
   1. Should fetch a list of all movies created by an authorized user.

?????? Don't forget to verify user's authorization token before processing the
request. The token should be passed in request's `Authorization` header.

```
Authorization: Bearer <token>
```

# Authorization service

To authorize users please use our simple auth service based on JWT tokens.
Auth service code is located under `./src` directory

## Prerequisites

You need to have `docker` and `docker-compose` installed on your computer to run the service

## Run locally

1. Clone this repository
1. Run from root dir

```
JWT_SECRET=secret docker-compose up -d
```

By default the auth service will start on port `3000` but you can override
the default value by setting the `APP_PORT` env var

```
APP_PORT=8081 JWT_SECRET=secret docker-compose up -d
```

To stop the authorization service run

```
docker-compose down
```

## JWT Secret

To generate tokens in auth service you need to provide env variable
`JWT_SECRET`. It should be a string value. You should use the same secret in
the API you're building to verify the JWT tokens.

## Users

The auth service defines two user accounts that you should use

1. `Basic` user

```
 username: 'basic-thomas'
 password: 'sR-_pcoow-27-6PAwCD8'
```

1. `Premium` user

```
username: 'premium-jim'
password: 'GBLtTyq3E_UNjFnpo9m6'
```

## Token payload

Decoding the auth token will give you access to basic information about the
user, including its role.

```
{
  "userId": 123,
  "name": "Basic Thomas",
  "role": "basic",
  "iat": 1606221838,
  "exp": 1606223638,
  "iss": "https://www.netguru.com/",
  "sub": "123"
}
```

## Example request

To authorize user call the auth service using for example `curl`. We assume
that the auth service is running of the default port `3000`.

Request

```
curl --location --request POST '0.0.0.0:3000/auth' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username": "basic-thomas",
    "password": "sR-_pcoow-27-6PAwCD8"
}'
```

Response

```
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywibmFtZSI6IkJhc2ljIFRob21hcyIsInJvbGUiOiJiYXNpYyIsImlhdCI6MTYwNjIyMTgzOCwiZXhwIjoxNjA2MjIzNjM4LCJpc3MiOiJodHRwczovL3d3dy5uZXRndXJ1LmNvbS8iLCJzdWIiOiIxMjMifQ.KjZ3zZM1lZa1SB8U-W65oQApSiC70ePdkQ7LbAhpUQg"
}
```

## Rules

- Database and framework choice are on your side.
- Your API has to be dockerized. Create `Dockerfile` and `docker-compose` and document the process of running it locally.
- Provided solution should consist of two microservices.
  - `Authentication Service` - provided by us to auth users
  - `Movies Service` - created by you to handle movies data
- Test your code.
- Provide documentation of your API.
- Application should be pushed to the public git repository and should have a
  working CI/CD pipeline that runs the tests. For example you can use GitHub
  Actions or CircleCI. Create a sample PR to show us the working CI/CD pipeline.

## What will be evaluated?

- Task completeness
- Architecture
- Code quality
- Tests quality
- Database design
- Technology stack
