if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    'loglevel',
    'jquery',
    'underscore',
    'fx-menu/start'
], function (log, $, _, Menu) {

    'use strict';

    var s = {
            STANDARD: "#standard"
        },
        instances = [];

    function Test() {
    }

    Test.prototype.start = function () {

        log.trace("Test started");

        this._render();

    };

    Test.prototype._render = function () {

        //this._renderStandard();
    };

    Test.prototype._renderStandard = function () {

        var menu = this.createInstance({

        });
    };

    //Utils

    Test.prototype.createInstance = function (params) {

        var instance = new Catalog(params);

        instances.push(instance);

        return instance;
    };

    return new Test();

});