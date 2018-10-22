"use strict";

let str_util = require("../branch-protection/protections");
let expect = require("chai").expect;

describe("'protections' Class Test Suite", function () {
    it("protections.handleRestrictions", function () {
        expect(str_util.handleRestrictions(null)).to.deep.equal([false, {"restrictions":null}]);
    });
    it("protections.handleReviews", function () {
        expect(str_util.handleReviews(null)).to.deep.equal([true,
          {
            "required_pull_request_reviews": {
              "dismissal_restrictions": {},
              "dismiss_stale_reviews": false,
              "require_code_owner_reviews": false
            }
          }
        ]);
    });
    it("protections.handleStatusChecks", function () {
        expect(str_util.handleStatusChecks(null)).to.deep.equal([true,
          {
            "required_status_checks": {
              "strict": true,
              "contexts": [
                "commit-build-check"
              ]
            }
          }
        ]);
    });
    it("protections.handleAdminEnforce", function () {
        expect(str_util.handleAdminEnforce(null)).to.deep.equal([true,
          {
            "enforce_admins": true
          }
        ]);
    });
});
