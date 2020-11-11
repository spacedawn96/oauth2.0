import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import axios from 'axios';
import cookieSession from 'cookie-session';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();
const app = express();

app.use(
  cookieSession({
    secret: process.env.COOKIE_SECRET,
  }),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.send('about oauth2.0!');
});
app.get('/login/github', (req, res) => {
  const redirect_uri = 'http://localhost:5000/login/github/callback';
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirect_uri}`,
  );
});

const client_id = process.env.GITHUB_CLIENT_ID;
const client_secret = process.env.GITHUB_CLIENT_SECRET;

console.log({ client_id, client_secret });

async function getAccessToken({
  code,
  client_id,
  client_secret,
}: {
  code: string;
  client_id: string;
  client_secret: string;
}) {
  const request = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id,
      client_secret,
      code,
    }),
  });
  const text = await request.text();
  const params = new URLSearchParams(text);
  return params.get('access_token');
}

async function fetchGitHubUser(token: string) {
  const request = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: 'token ' + token,
    },
  });
  return await request.json();
}

app.get(
  '/login/github/callback',
  async (req: any, res: Response, next: NextFunction) => {
    const code = req.query.code;
    const access_token = await getAccessToken({
      code,
      client_id,
      client_secret,
    });
    const user = await fetchGitHubUser(access_token);
    if (user) {
      req.session.access_token = access_token;
      req.session.githubId = user.id;
      res.redirect('/admin');
    } else {
      res.send('Login did not succeed!');
    }
  },
);

app.get('/admin', async (req, res) => {
  if (req.session && req.session.githubId === 53983883) {
    res.send('Hello woong <pre>' + JSON.stringify(req.session, null, 2));
  } else {
    res.redirect('/login/github');
  }
});

app.get('/logout', (req, res) => {
  if (req.session) req.session = null;
  res.redirect('/');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
