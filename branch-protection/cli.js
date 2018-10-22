#!/usr/bin/env node

const axios = require('axios');
const str_util = require('../str_util');

const config = require('./config.json');
 
var rootCas = require('ssl-root-cas')
                .create()
                .addFile('/etc/pki/tls/certs/ca-bundle.crt');

require('https').globalAgent.options.ca = rootCas;

const protections = require('./protections');

const protectHandlers = {
  'restrictions': { handle: protections.handleRestrictions },
  'required_pull_request_reviews': { handle: protections.handleReviews },
  'required_status_checks': { handle: protections.handleStatusChecks },
  'enforce_admins': { handle: protections.handleAdminEnforce }
};

var args = {};

function updateApiArgs(argv) {
  var githubToken = argv.githubToken || "";
  var githubHost = argv.githubHost || "github.com";

  args = {
    host: githubHost,
    headers: {
      "Authorization": "token " + githubToken
    }
  };

  if (argv.githubPreview) {
    args.headers["Accept"] = "application/vnd.github." + argv.githubPreview + "-preview+json";
  }
}


const baseUrls = {
  listBranches: "https://{{0}}/api/v3/repos/{{1}}/branches",
  protection: "https://{{0}}/api/v3/repos/{{1}}/branches/{{2}}/protection"
};


function checkBranchProtection(branch, data) {
  let updates = []
  console.log('\nEnsuring branch protection for ' + branch);
  for (let protection of Object.keys(protectHandlers)) try {
    protectData = null
    if (data && data.hasOwnProperty(protection)) {
      protectData = data[protection];
    }
    updates.push(protectHandlers[protection].handle(protectData));
  }
  catch(err) {
    console.log('Error: ' + err);
  }
  if (updates.some(function (update) {
    return update && update[0];
  })) { return updates; }
  else { return []; }
}

function updateBranchProtection(protectionUrl, updates) {
  let updateReq = {}
  for (let upd of updates) {
    upd_val = upd[1]
    for (let k of Object.keys(upd_val)) {
      updateReq[k] = upd_val[k];
    }
  }
  console.log(protectionUrl);
  console.log(updateReq);
  axios.put(protectionUrl,
            updateReq, {
              headers: args.headers
    })
    .then(function (response) {
      if (response.hasOwnProperty('status') && response.status == 200) {
        console.log('Updated successfully');
      }
      else {
        console.log(response);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}


function protectBranch(repo, branch) {
  let protectionUrl
    = str_util.format(baseUrls.protection,
                      args.host, repo, branch);
  axios.get(protectionUrl, {
      headers: args.headers
    })
    .then(function (response) {
      console.log(response.data);
      updates = checkBranchProtection(branch, response.data);
      if (updates && updates.length > 0) {
          console.log('Updates necessary');
          //console.log(updates);
          updateBranchProtection(protectionUrl, updates);
      } else {
          console.log('No updates necessary');
      }
    })
    .catch(function (error) {
      if (error.response
          && error.response.status
          && error.response.status === 404) {
        let data = error.response.data;
        if (data.hasOwnProperty('message')
            && data.message.toLowerCase() === "branch not protected")
          console.log('Branch not protected. Updates necessary');
          updates = checkBranchProtection(branch, {});
          //console.log(updates);
          updateBranchProtection(protectionUrl, updates);
      }
      else { console.log(error); }
    })
    .then(function () {
      // always executed
    });
}
 
function protectBranches(repo) {
  let branchesUrl
    = str_util.format(baseUrls.listBranches,
                      args.host, repo);
  axios.get(branchesUrl, {
      headers: args.headers
    })
    .then(function (response) {
      response.data.map(branch => branch.name)
        .forEach(function (branch, index, branches) {
          protectBranch(repo, branch);
        });
    })
    .catch(function (error) {
      console.log(error);
      throw new Error("Cannot get branches for repo " + repo);
    });
}


function protect() {
  config.repos.forEach(function (repo, index, repos) {
    console.log('Protecting ' + repo);
    protectBranches(repo);
  });
}


var argv = require('minimist')(process.argv.slice(2));

updateApiArgs(argv);

protect();
