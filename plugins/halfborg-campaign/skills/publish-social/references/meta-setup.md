# Setting up Instagram and Threads posting

How a person connects their brand's Instagram and Threads accounts so `publish-social` can post to
them. Written to be read aloud or walked through by `/halfborg-campaign:setup-engine`, so it is plain
on purpose. Each is a one-off of about twenty minutes, plus a two-minute renewal every 60 days. They
are separate: set up only the one the brand posts to. Instagram is steps 1 to 6; Threads is the
section after renewal, and reuses the same Meta app from step 3.

**Never take any of these values in the conversation.** The token and the account number are typed
into Claude Code's plugin settings, which keep them in secure storage. If someone pastes a token into
chat, tell them it is now in the conversation, suggest they make a fresh one (step 4) and enter that
in the settings instead, and do not repeat it back.

Meta renames buttons on these pages from time to time. Where a label below has moved, look for the
nearest thing with the same job, and say so rather than guessing.

## What it needs

- the brand's Instagram account set to **professional** (Business or Creator). A personal account
  cannot be posted to from anywhere but the app;
- that account **linked to a Facebook Page** the person manages;
- a free **Meta developer account** and an app on it (the app is just the key-holder; nobody else
  sees it).

## 1. Make the Instagram account professional

In the Instagram app: **Settings → Account type and tools → Switch to professional account**, then
pick Business or Creator. Free, and reversible.

## 2. Link it to a Facebook Page

In the Instagram app: **Settings → Accounts Centre** (or the Page's settings on Facebook →
**Linked accounts → Instagram**), and connect the account to the brand's Facebook Page. A brand with
no Page can make one in a minute; it can stay empty.

## 3. Make a Meta app

1. Go to <https://developers.facebook.com>, log in with the Facebook account that manages the Page,
   and accept the developer terms if asked.
2. **My Apps → Create app.** Pick the business type when asked, and give it any name ("Acme
   posting"). Nothing about it is public.

## 4. Get the token

1. Open the **Graph API Explorer**: <https://developers.facebook.com/tools/explorer/>.
2. Choose the app you just made under **Meta App**.
3. Under **Permissions**, add: `instagram_basic`, `instagram_content_publish`, `pages_show_list`,
   `pages_read_engagement`. Those let the engine read the account's name and publish to it, nothing
   more.
4. Click **Generate Access Token** and approve, choosing the brand's Page and Instagram account when
   asked.
5. That token lasts about an hour. To stretch it to about 60 days, open the **Access Token Debugger**,
   <https://developers.facebook.com/tools/debug/accesstoken/>, paste the token in, click **Debug**, then
   **Extend Access Token** at the bottom. Copy the new, longer token it shows. That is the one to keep.

## 5. Find the account number

Still in the Graph API Explorer, with the long token in the token box:

1. Run `me/accounts`. It lists the person's Pages; note the `id` of the brand's Page.
2. Run `<that page id>?fields=instagram_business_account`. The number inside
   `instagram_business_account` (it looks like `17841400123456789`) is the **Instagram user id**.

## 6. Enter both in Claude Code

Type `/plugin`, open the **Installed** tab, select **Halfborg Campaign Engine**, and fill in
**Instagram access token** and **Instagram user id**. Then run `/reload-plugins`, or restart Claude
Code.

To check it worked, run `/halfborg-campaign:setup-engine` again: it reads the account's name and says
which account posting is connected to. That name must match the Instagram handle in the brand's
settings, or the engine will not post. If it is missing there, `/halfborg-campaign:setup-brand` adds
it.

## Renewing every 60 days

The token runs out after about 60 days, and posting stops until it is renewed. The engine says so in
plain words when it happens, and nothing is posted with a dead token.

To renew: repeat step 4 (the Explorer, then **Extend Access Token** in the Debugger), and replace the
token under `/plugin` → **Installed** → **Halfborg Campaign Engine**. The account number does not
change.

## Threads

Threads has its own token and its own account number, from the same Meta app made in step 3. Meta's
screens for Threads have moved more than Instagram's, and part of this route comes from developers'
reports rather than Meta's own guide, so where a step does not match what you see, say so and look
for the nearest thing with the same job.

**What it needs:** a Threads profile for the brand (made from its Instagram account in the Threads
app), and the Meta app from step 3.

1. **Add the Threads use case.** In the app's dashboard, under **Use cases**, add **Access the
   Threads API**. In its permissions, make sure `threads_basic` and `threads_content_publish` are
   included.
2. **Make the brand's profile a tester.** Until Meta reviews the app, it can only post for profiles
   listed on it. In the dashboard: **App roles → Roles → Add People → Threads Tester**, and enter the
   brand's Threads username. Then, in the Threads app on that profile, accept the invitation:
   **Settings → Account → Website permissions → Invites**.
3. **Get a token.** Open the **Graph API Explorer**,
   <https://developers.facebook.com/tools/explorer/>, choose the app, switch the API at the top from
   `graph.facebook.com` to `threads.net`, and generate a Threads access token, approving as the
   brand's profile. (Some app dashboards also offer a **User Token Generator** under the Threads use
   case's settings; if it works for you, it does the same job.)
4. **Stretch it to 60 days.** That token lasts about an hour. Open this address in the browser, with
   the token and the app's secret (**App settings → Basic → App secret**) filled in; it returns a
   long-lived token. Copy that one.

   ```
   https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=APP_SECRET&access_token=SHORT_TOKEN
   ```

   The secret goes in the browser's address bar only. It is never entered into Claude Code or a
   conversation.
5. **Find the account number.** In the Explorer, still on `threads.net`, with the long token in the
   token box, run `me?fields=id,username`. The `id` is the **Threads user id**.
6. **Enter both.** `/plugin` → **Installed** → **Halfborg Campaign Engine**: **Threads access
   token** and **Threads user id**. Then `/reload-plugins`, and check with
   `/halfborg-campaign:setup-engine`, which names the Threads account posting is connected to.

**Renewing.** The long token lasts about 60 days. Before it runs out, open this address with the
current long token, and paste the new token it returns into the settings in place of the old one:

```
https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=CURRENT_LONG_TOKEN
```

A token that has already run out cannot be refreshed: repeat steps 3 and 4 instead.

## One account per computer

The settings hold one Instagram account and one Threads account at a time. A workspace with several
brands posts only for the brand whose handle matches the connected account; for another brand, swap
the token and account number in the settings first.
