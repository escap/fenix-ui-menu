define([
    'loglevel',
    'jquery',
    'underscore',
    '../../../src/js/index',
    'dev/src/models/standard',
    'dev/src/models/dropdown',
], function (log, $, _, Menu, Model, DropdownModel) {

    'use strict';

    var s = {
            STANDARD: "#standard",
            DROPDOWN : "#dropdown"
        },
        instances = [];

    function Test() {

        console.clear()

        log.setLevel('trace');

        this.start();
    }

    Test.prototype.start = function () {

        log.trace("Test started");

        this._render();

    };

    Test.prototype._render = function () {

        this._renderStandard();

        this._renderJson();
    };

    Test.prototype._renderStandard = function () {

        var menu = this.createInstance({
            config : Model
        });
    };

    Test.prototype._renderJson = function () {

       var json = new Menu.Dropdown({
           el: s.DROPDOWN,
           model: DropdownModel
       });
    };

    //Utils

    Test.prototype.createInstance = function (params) {

        var instance = new Menu(params);

        instances.push(instance);

        return instance;
    };

    return new Test();

});