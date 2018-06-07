/* eslint-disable no-undef */
Package.describe({
  name: 'socialize:groups',
  summary: 'A social friendship package',
  version: '1.0.0',
  git: 'https://github.com/storyteller/socialize-groups.git'
});

Package.onUse(function _(api) {
  api.versionsFrom('1.7');

  api.use([
    'check',
    'ecmascript',
    'reywood:publish-composite@1.6.0',
    'socialize:base-model@1.1.3',
    'socialize:linkable-model@1.0.3',
    'socialize:postable@1.0.1',
    'socialize:requestable@1.0.3'
  ]);

  api.mainModule('server/server.js', 'server');
  api.mainModule('client/client.js', 'client');
});
