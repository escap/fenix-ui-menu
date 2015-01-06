define(function () {

    var config = {

        paths:  {

            'fx-menu/start': './start',
            'fx-menu/templates': '../templates/',

            'jquery': '{FENIX_CDN}/js/jquery/2.1.1/jquery.min',
            'bootstrap': '{FENIX_CDN}/js/bootstrap/3.2/js/bootstrap.min',
            'text': '{FENIX_CDN}/js/requirejs/plugins/text/2.0.12/text'
        },

        shim: {

            "bootstrap": {
                deps: ["jquery"]
            }
        }
    };

    return config;
});