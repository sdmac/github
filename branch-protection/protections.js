'use strict';

module.exports = {
  handleRestrictions: function (data) {
    let doUpdate = false; //!data || !Object.keys(data).length;
    return [doUpdate, { "restrictions": data
    //    "users": [],
    //    "teams": []
    }];
  },

  handleReviews: function (data) {
    let doUpdate = !data || !Object.keys(data).length;
    return [doUpdate, { "required_pull_request_reviews": {
      "dismissal_restrictions": {},
      "dismiss_stale_reviews": false,
      "require_code_owner_reviews": false
    }}];
  },

  handleStatusChecks: function (data) {
    let doUpdate = (!data || !Object.keys(data).length
      || !data.hasOwnProperty("strict")
      || data.strict !== true);
    return [doUpdate, { "required_status_checks": {
      "strict": true,
      "contexts": [
        "commit-build-check"
      ]
    }}];
  },

  handleAdminEnforce: function (data) {
    let doUpdate = (!data || !Object.keys(data).length
      || !data.hasOwnProperty("enabled")
      || data.enabled != true);
    let enforce = true; //doUpdate ? true : data.enabled;
    return [doUpdate, { "enforce_admins": enforce }];
  }

};
