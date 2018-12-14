LaunchDarkly Environment Synchronizer
=====================================

This Node script simplifies the task of synchronizing flag rollout rules between two different environments.
It assumes that both environments are in the same project and account, and takes as input the API keys for
the two environments you're syncing.

The following properties will be synchronized on a single flag:

* If the evaluation rules are enabled
* The archived bit
* User target rules
* Attribute targeting rules
* Prerequisites
* Fallthrough rule

Quick setup
-----------

0. Install with `npm`

        npm install --save

1. Run the script, passing in the project key, flag key, source and destination environments, and API token:

        node index.js PROJECT_KEY FLAG_KEY SOURCE_ENVIRONMENT_KEY DEST_ENVIRONMENT_KEY API_TOKEN

Example Usage
-----------

```
node index.js default pricing-page-redesign staging production <my personal api token>
```

Note
----

This script works with the current (v2) verison of the LaunchDarkly API. If your account is still on the v1 version,
you should use the [v1 version](https://github.com/launchdarkly/sync-ld-flags/tree/v1) of this script.
