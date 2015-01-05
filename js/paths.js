define(function () {

    var config = {

        paths:  {

            'fx-menu/start': './start',
            'fx-menu/templates': '../templates/',

            'jquery': '../node_modules/jquery/dist/jquery.min',
            'bootstrap': '../node_modules/bootstrap/dist/js/bootstrap.min',
            'text': "../node_modules/text/text"
        },

        shim: {

            "bootstrap": {
                deps: ["jquery"]
            }
        }
    };

    return config;
});