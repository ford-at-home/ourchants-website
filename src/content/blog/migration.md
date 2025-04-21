---
title: "Rebuilding OurChants: From Drupal to Serverless"
slug: "welcome"
date: "2024-04-15"
summary: "A brief technical overview on why this site migrated"
published: true
---

Warning: the next few paragraphs are technical and will not make sense if you don't know this domain. Feel free to skip!

OurChants.org was originally built in Drupal 7 and hosted on shared infrastructure. The original admin went dark, and all I could recover was a ZIP of the built site—no source code, no deployment pipeline. After running into endless PHP errors trying to revive it, I decided to rebuild it from scratch using a modern, serverless approach.

Now the site is open source and split into two GitHub repos:

- [`ourchants-api`](https://github.com/ford-at-home/ourchants-api) – AWS Lambda functions, API Gateway, and DynamoDB for dynamic content  
- [`ourchants-website`](https://github.com/ford-at-home/ourchants-website) – React frontend deployed to S3 with Tailwind styling

The chants themselves aren’t in GitHub—they’re stored in a public S3 bucket and served via pre-signed URLs.

This new setup is faster, cheaper, easier to maintain, and built for the long haul. No servers. No PHP. Just sacred songs delivered simply and securely.
