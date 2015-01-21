/*global define*/
define([
    "jquery",
    "require",
    "text!fx-menu/templates/blank.html",
    "bootstrap"
], function ($, Require, template) {

    'use strict';

    var defaultOptions = {
        container: 'body',
        url: 'fx-menu/config/default.json',
        template: template,
        selectors: {
            brand: ".navbar-brand",
            ul: ".fx-ul",
            right: ".navbar-right"
        },
        lang: "EN",
        css: 'fx-menu/css/fenix-menu.css'
    };

    function TP(o) {

        this.o = $.extend(true, {}, defaultOptions, o);

        //default: EN
        this.o.lang = this.o.lang.toUpperCase();

        if (this.o.conf) {
            this.render();
        } else {
            this.loadConfiguration();
        }
    }

    TP.prototype.loadConfiguration = function () {

        var self = this;

        $.getJSON(this.o.url, function (data) {
            self.o.conf = data;
            self.render();
        }).error(function () {
            throw new Error('FENIX Top Menu: please specify a valid configuration file.');
        });
    };

    TP.prototype.render = function () {

        //Init auxiliary variables
        this.initVariables();

        //Render the menu
        this.$container.prepend(this.compileTemplate());

        this.initializeMenu();

        //disable items
        this.disable(this.o.disable || []);

        //Select an item
        this.selectCurrentItem();

        //Auto import the CSS in the page
        if (this.o.hasOwnProperty('importCss') && this.o.importCss === true) {
            this.importCss();
        }

        if (this.o.hasOwnProperty('callback') && typeof this.o.callback === 'function') {
            this.o.callback();
        }
    };

    TP.prototype.initVariables = function () {
        this.$template = $(this.o.template);
        this.$ul = this.$template.find(this.o.selectors.ul);
        this.$brand = this.$template.find(this.o.selectors.brand);
        this.$right = this.$template.find(this.o.selectors.right);
        this.$container = $(this.o.container);
    };

    TP.prototype.importCss = function () {

        if (this.o.css && this.o.css !== null) {
            var link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = Require.toUrl(this.o.css);
            document.getElementsByTagName("head")[0].appendChild(link);
        }

        return false;
    };

    TP.prototype.compileTemplate = function () {
        this.renderBrand();
        this.renderItems(this.$ul);
        this.renderLeftItems();
        this.renderRightItems();
        this.renderLanguagePicker();
        this.renderMenuType();

        return this.$template;
    };

    TP.prototype.renderMenuType = function () {

        switch (this.o.conf.type){
            case 'fixed-top': this.$template.addClass('navbar-fixed-top'); break;
            case 'fixed-bottom': this.$template.addClass('navbar-fixed-bottom'); break;
            case 'inverse' :  this.$template.addClass('navbar-inverse'); break;
            default: this.$template.addClass('navbar-static-top'); break;
        }
    };

    TP.prototype.initializeMenu = function () {

        this.$container.find('ul.dropdown-menu [data-toggle=dropdown]').on('click', function(event) {
            // Avoid following the href location when clicking
            event.preventDefault();
            // Avoid having the menu to close when clicking
            event.stopPropagation();
            // If a menu is already open we close it
            //$('ul.dropdown-menu [data-toggle=dropdown]').parent().removeClass('open');
            // opening the one you clicked on
            $(this).parent().addClass('open');

            var menu = $(this).parent().find("ul");
            var menupos = menu.offset();

            if ((menupos.left + menu.width()) + 30 > $(window).width()) {
                var newpos = - menu.width();
            } else {
                var newpos = $(this).parent().width();
            }
            menu.css({ left:newpos });

        });

    };

    TP.prototype.renderItems = function ($ul) {

        var self = this;

        if (this.o.conf.items) {
            $(this.o.conf.items).each(function (index, item) {
                self.renderItem($ul, item);
            });
        }
    };

    TP.prototype.renderItem = function  ($container, item, submenu) {

        switch (item.type) {
            case 'dropdown' : this.renderDropdown($container, item, submenu); break;
            case 'divider' : this.renderDivider($container); break;
            default : this.renderSingleItem($container, item); break;
        }
    };

    TP.prototype.renderSingleItem = function ($container, item) {

        var $li = $("<li></li>"),
            $a = $("<a href='" + ( item.target || '#') + "'>" + item.label[this.o.lang] + "</a>");

        this.addItemAttrs($li, item);

        $li.append($a);
        $container.append($li);
    };

    TP.prototype.renderDropdown = function ($ul, item, submenu) {

        var self = this;

        var $li = $('<li class="dropdown"></li>'),
            $a = $('<a href="#" class="dropdown-toggle" data-toggle="dropdown">' + item.label[this.o.lang] + '</b></a>'),
            $children = $('<ul class="dropdown-menu"></ul>');

        if (submenu === true) {
            $li.addClass('dropdown-submenu');
        }else {
            $a.append($('<b class="caret">'));
        }

        $li.append($a).append($children);

        //Append dropdown children
        if (item.hasOwnProperty('children') && item['children'] !== null) {
            for (var i = 0; i < item['children'].length; i++) {

                self.renderItem($children, item['children'][i], true);
            }
        }

        this.addItemAttrs($li, item);
        $ul.append($li);
    };

    TP.prototype.renderDivider = function ($container) {

        $container.append('<li class="divider"></li>');
    };

    TP.prototype.addItemAttrs = function ($item, conf) {

        if (conf.hasOwnProperty('attrs')) {
            var attrs = Object.keys(conf['attrs']);

            for (var i = 0; i < attrs.length; i++) {
                if (conf['attrs'].hasOwnProperty(attrs[i])) {
                    $item.attr(attrs[i], conf['attrs'][attrs[i]]);
                }
            }
        }

        return $item;
    };

    TP.prototype.renderBrand = function () {

        if (this.o.conf.brand) {
            this.$brand.attr('href', this.o.conf.brand.target || '#');
            if (this.o.conf.brand.url) {
                this.$brand.css('background-image', 'url(' + this.o.conf.brand.url + ')');
            }
        }

        return this.$template;
    };

    TP.prototype.renderLeftItems = function () {

        if (this.o.conf.left) {
        }

        return this.$template;
    };

    TP.prototype.renderRightItems = function () {

        if (this.o.conf.right) {
            this.renderItems(this.$right)
        }

        return this.$template;
    };

    TP.prototype.renderLanguagePicker = function () {

        var $li = $('<li></li>'),
            $langPicker = $('<ul class="lang_picker"></ul>');

        if (this.o.conf.languages) {
            $(this.o.conf.languages).each(function (index, lang) {
                var $lang = $("<li></li>"),
                    $a = $("<a href='" + ( lang.target || '#') + "'>" + lang.label + "</a>");
                $lang.prepend($a);
                $langPicker.prepend($lang);
            });
        }

        this.$right.append($li.append($langPicker));
        return this.$template;
    };

    TP.prototype.selectCurrentItem = function () {

        if (this.o.conf) {
            this.$template.find('li[id="' + this.o.active + '"] ').addClass("active")
                .find("a").attr("href", "#");
        } else {
            if (this.o.conf.active) {
                this.$template.find('li[id="' + this.o.conf.active + '"] ').addClass("active")
                    .find("a").attr("href", "#");
            }
        }

        return this.$template;
    };

    TP.prototype.disableItem = function ( item ) {

        this.$template.find('li[id="' + item + '"] ').addClass("disabled");
    };

    TP.prototype.disable = function ( items ) {

        if (Array.isArray(items)) {
            for (var i = 0; i < items.length; i++) {
                this.disableItem(items[i]);
            }
        } else {
            this.disableItem(items);
        }

        this.$template.find("li.disabled a").click(function() {
            return false;
        });
    };

    TP.prototype.activateItem = function ( item ) {

        this.$template.find('li[id="' + item + '"] ').removeClass("disabled");
    };

    TP.prototype.activate = function ( items ) {

        if (Array.isArray(items)) {
            for (var i = 0; i < items.length; i++) {
                this.activateItem(items[i]);
            }
        } else {
            this.activateItem(items);
        }

    };

    return TP;
});