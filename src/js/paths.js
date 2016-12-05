if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(function () {

    var config = {

        paths:  {

            'fx-menu/start': './menu',
            'fx-menu/html': '../html/',
            'fx-menu/config' :  '../config',

            'jquery': '{FENIX_CDN}/js/jquery/2.1.1/jquery.min',
            'bootstrap': '{FENIX_CDN}/js/bootstrap/3.2/js/bootstrap.min',
            'text': '{FENIX_CDN}/js/requirejs/plugins/text/2.0.12/text',
            'amplify' : '{FENIX_CDN}/js/amplify/1.1.2/amplify.min'
        },

        shim: {
            "bootstrap": {
                deps: ["jquery"]
            },
            amplify: {
                deps: ['jquery'],
                exports: 'amplify'
            }
        }
    };

    return config;
});