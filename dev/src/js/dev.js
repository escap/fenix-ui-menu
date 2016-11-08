define([
    'loglevel',
    'jquery',
    'underscore',
    '../../../src/js/index',
    'dev/src/models/standard',
], function (log, $, _, Menu, Model) {

    'use strict';

    var s = {
            STANDARD: "#standard",
            DROPDOWN : "#dropdown"
        },
        instances = [];

    function Dev() {

        this._importThirdPartyCss();

        console.clear();

        log.setLevel('trace');

        this.start();
    }

    Dev.prototype.start = function () {

        log.trace("Dev started");

        this._render();

    };

    Dev.prototype._render = function () {

        this._renderStandard();
        
    };

    Dev.prototype._renderStandard = function () {

        var menu = this.createInstance({
            config : Model
        });

    };

    //Utils

    Dev.prototype.createInstance = function (params) {

        var instance = new Menu(params);

        instances.push(instance);

        return instance;
    };


    // utils

    Dev.prototype._importThirdPartyCss = function () {

        //Bootstrap
        require('bootstrap/dist/css/bootstrap.css');

    };

    return new Dev();

});