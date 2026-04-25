import dotenv from 'dotenv';
dotenv.config();
console.log(JSON.stringify({ pw: process.env.SQL_PASSWORD, host: process.env.SQL_HOST, db: process.env.SQL_DATABASE }));
