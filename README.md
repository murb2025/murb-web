# Murb

<p align="center">
<img src="./public/favicon.png" width="200" height="200">
</p>

## Tech Stack

- [x] Next.js
- [x] TypeScript
- [x] Sass
- [x] ESLint
- [x] Prettier
- [x] Husky
- [x] Commitlint
- [x] Jest

## Guidelines

1. **Packages**: Use `pnpm` for managing packages (version >=8.0.0).
2. **Environment Variables**: Use `.env.local` files for managing environment variables.
3. **Node Version**: Use an LTS node version `>=18.0.0`.

## Package Manager

This project uses `pnpm` as the package manager. Please do not use npm or yarn to maintain consistency across the project. Make sure you have pnpm version >=8.0.0 installed.

## Best Practices

1. **TypeScript**: Only use TypeScript for writing code.
2. **ESLint**: Make sure to follow the ESLint rules [here](./.eslintrc.json).
3. **Prettier**: Make sure to format the code using Prettier as per the rules [here](./.prettierrc).
4. **Husky**: Make sure to follow the commit message format as per the rules [here](./commitlint.config.js).
5. **Jest**: Write tests for the code and make sure to cover all the edge cases.
6. **Directory Structure**: MVC pattern should be followed for the directory structure.
7. **Global State**: Use Redux for managing global state.
8. **Styles**: Use Sass for writing styles.

## Local Setup

1.  Clone the repository.
2.  Navigate to the project directory.
3.  Create a `.env.local` file in the root of the project and add the environment variables listed in the `.env.example` file.
4.  Install dependencies.
5.  Start development server

## Scripts

```sh
# Install Docker

# 1. to stop any running docker process
docker stop $(docker ps -a -q)

# 2. kill any other docker process
docker rm $(docker ps -a -q)

# 3. Start the container
docker-compose up

# 4. Delete Previous migrations
pnpm prisma migrate reset

# 5. Create new migrations
pnpm prisma migrate deploy

# 6. pull migrations
pnpm prisma db pull

# 7. Generate
pnpm prisma generate

# seed test data of category
No need to seed data all are static data

# 8. Start the server
pnpm dev

```

## License

[MIT](LICENSE)

## Author

[Opengig](https://opengig.work)

## Acknowledgements

- [Next.js](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org)
- [MongoDB](https://www.mongodb.com)
- [Sass](https://sass-lang.com)
- [ESLint](https://eslint.org)
- [Prettier](https://prettier.io)
- [Husky](https://typicode.github.io/husky)
- [Commitlint](https://commitlint.js.org)
- [Jest](https://jestjs.io)
