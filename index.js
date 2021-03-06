#!/usr/bin/env node
'use strict';

var jsonpatch = require('fast-json-patch'),
  request = require('request'),
  baseUrl = 'https://app.launchdarkly.com/api/v2',
  projectKey = '',
  sourceEnvironment = '',
  destinationEnvironment = '',
  apiToken = '';



function patchFlag (patch, key, cb) {
  var options = {
    url: baseUrl + '/flags/' + projectKey + '/' + key,
    body: patch,
    headers: {
      'Authorization': apiToken,
      'Content-Type': 'application/json'
    }
  };

  request.patch(options, cb);
}

var fetchFlag = function (cb) {
  var options = {
    url: baseUrl + '/flags/' + projectKey + '/' + flagKey,
    headers: {
      'Authorization': apiToken,
      'Content-Type': 'application/json'
    }
  };

  function callback (error, response, body) {
    if (!error && response.statusCode === 200) {
      cb(null, JSON.parse(body));
    }
    else {
      cb(error);
    }
  }

  request(options, callback);
}

var copyValues = function (flag, destinationEnvironment, sourceEnvironment) {
  var attributes = [
    'on',
    'archived',
    'targets',
    'rules',
    'prerequisites',
    'fallthrough'
  ];
  attributes.forEach(function (attr) {
    flag.environments[destinationEnvironment][attr] = flag.environments[sourceEnvironment][attr];
  });
}

function syncEnvironment (fromKey, toKey) {
  fetchFlag(function (err, flag) {
    if (err) {
      throw new Error('Error fetching flag');
    }

    var fromFlag = flag.environments[sourceEnvironment],
        toFlag =  flag.environments[destinationEnvironment],
        observer = jsonpatch.observe(flag);

    if (!fromFlag) {flag
      throw new Error('Missing source environment flag. Did you specify the right project?');
    }
    if (!toFlag) {
      throw new Error('Missing destination environment flag. Did you specify the right project?');
    }
    console.log('Syncing ' + flag.key)
    copyValues(flag, destinationEnvironment, sourceEnvironment)

    var diff = jsonpatch.generate(observer);

    if (diff.length > 0) {
      console.log('Modifying', flag.key, 'with', diff);
      patchFlag(JSON.stringify(diff), flag.key, function (err) {
        if (err) {
          throw new Error(err);
        }
      });
    } else {
      console.log('No changes in ' + flag.key)
    }
  });
}

if (require.main === module) {
  var projectKey = process.argv[2],
      flagKey = process.argv[3],
      sourceEnvironment = process.argv[4],
      destinationEnvironment = process.argv[5],
      apiToken = process.argv[6];

  if (!projectKey) {
    throw new Error('Missing project key for sync');
  }

  if (!flagKey) {
    throw new Error('Missing flag key for sync');
  }

  if (!sourceEnvironment) {
    throw new Error('Missing source environment for sync');
  }

  if (!destinationEnvironment) {
    throw new Error('Missing destination environment for sync');
  }

  if (sourceEnvironment === destinationEnvironment) {
    throw new Error('Why are you syncing the same environment?!');
  }

  if (!apiToken) {
    throw new Error('Missing api token for sync');
  }

  syncEnvironment(sourceEnvironment, destinationEnvironment);
}
