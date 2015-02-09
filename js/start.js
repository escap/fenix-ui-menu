/*global define*/
define([
    "jquery",
    "require",
    "text!fx-menu/templates/blank.html",
    "amplify",
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
        css: 'fx-menu/css/fenix-menu.css',
        eventPrefix : 'fx.menu.'
    };

    function FM(o) {

        this.o = $.extend(true, {}, defaultOptions, o);

        //default: EN
        this.o.lang = this.o.lang.toUpperCase();

        if (this.o.conf) {
            this.render();
        } else {
            this.loadConfiguration();
        }
    }

    FM.prototype.loadConfiguration = function () {

        var self = this;

        $.getJSON(this.o.url, function (data) {
            self.o.conf = data;
            self.render();
        }).error(function () {
            throw new Error('FENIX Top Menu: please specify a valid configuration file.');
        });
    };

    FM.prototype.render = function () {

        //Init auxiliary variables
        this.initVariables();

        //Reset menu. Useful if the menu configuration has to change dynamically
        this.resetMenu();

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

        // Create breadcrumb
        if (this.o.hasOwnProperty('breadcrumb') && this.o.breadcrumb.active === true) {
            this.renderBreadcrumb();
        }

        if (this.o.hasOwnProperty('callback') && typeof this.o.callback === 'function') {
            this.o.callback();
        }

    };

    FM.prototype.initVariables = function () {
        this.$template = $(this.o.template);
        this.$ul = this.$template.find(this.o.selectors.ul);
        this.$brand = this.$template.find(this.o.selectors.brand);
        this.$right = this.$template.find(this.o.selectors.right);
        this.$container = $(this.o.container);
    };

    FM.prototype.resetMenu = function () {

        this.$ul.empty();
        this.$right.empty();
        if (this.o.container !== 'body'){
            this.$container.empty();
        }
    };

    FM.prototype.importCss = function () {

        if (this.o.css && this.o.css !== null) {
            var link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = Require.toUrl(this.o.css);
            document.getElementsByTagName("head")[0].appendChild(link);
        }
    };

    FM.prototype.compileTemplate = function () {

        this.customizeMenu();
        this.renderBrand();
        this.renderItems(this.$ul, this.o.conf.items);
        this.renderLeftItems();
        this.renderItems(this.$right, this.o.conf.right);
        this.renderLanguagePicker();
        this.renderMenuType();

        return this.$template;
    };

    FM.prototype.customizeMenu = function () {

        if (!window.fx_menu_counter){
            window.fx_menu_counter = 0;
        }

        var klass =this.o.className ? this.o.className : (window.fx_menu_counter++);

        this.$template.addClass(klass);
        this.$template.find('[data-target="#fx-navbar-collapse"]').attr('data-target', "#fx-navbar-collapse".concat(klass));
        this.$template.find('#fx-navbar-collapse').attr('id', "fx-navbar-collapse".concat(klass));

        return this.$template;
    };

    FM.prototype.renderMenuType = function () {

        switch (this.o.conf.type) {
            case 'fixed-top':
                this.$template.addClass('navbar-fixed-top');
                break;
            case 'fixed-bottom':
                this.$template.addClass('navbar-fixed-bottom');
                break;
            case 'inverse' :
                this.$template.addClass('navbar-inverse');
                break;
            default:
                this.$template.addClass('navbar-static-top');
                break;
        }
    };

    FM.prototype.initializeMenu = function () {

        this.$container.find('ul.dropdown-menu [data-toggle=dropdown]').on('click', function (event) {
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
                var newpos = -menu.width();
            } else {
                var newpos = $(this).parent().width();
            }
            menu.css({left: newpos});

        });

    };

    FM.prototype.renderItems = function ($ul, items) {

        var self = this;

        $(items).each(function (index, item) {
            self.renderItem($ul, item);
        });
    };

    FM.prototype.renderItem = function ($container, item, submenu) {

        switch (item.type) {
            case 'dropdown' :
                this.renderDropdown($container, item, submenu);
                break;
            case 'divider' :
                this.renderDivider($container);
                break;
            default :
                this.renderSingleItem($container, item);
                break;
        }
    };

    FM.prototype.renderSingleItem = function ($container, item) {

        var $li = $("<li></li>"),
            $a = $("<a href='" + ( item.target || '#') + "'>" + item.label[this.o.lang] + "</a>");

        this.addItemAttrs($li, item);

        $a.on('click', $.proxy(function () {
            var topic = this.o.eventPrefix;

            if (item.hasOwnProperty('attrs')) {
                topic += item.attrs.id ? item.attrs.id : 'item';
            }

            amplify.publish(topic, item)
        }, this));

        $li.append($a);
        $container.append($li);
    };

    FM.prototype.renderDropdown = function ($ul, item, submenu) {

        var self = this;

        var $li = $('<li class="dropdown"></li>'),
            $a = $('<a href="#" class="dropdown-toggle" data-toggle="dropdown">' + item.label[this.o.lang] + '</b></a>'),
            $children = $('<ul class="dropdown-menu"></ul>');

        if (submenu === true) {
            $li.addClass('dropdown-submenu');
        } else {
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

    FM.prototype.renderDivider = function ($container) {

        $container.append('<li class="divider"></li>');
    };

    FM.prototype.addItemAttrs = function ($item, conf) {

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

    FM.prototype.renderBrand = function () {

        if (this.o.conf.brand) {
            this.$brand.attr('href', this.o.conf.brand.target || '#');
            if (this.o.conf.brand.url) {
                this.$brand.css('background-image', 'url(' + this.o.conf.brand.url + ')');
            }
        }

        return this.$template;
    };

    FM.prototype.renderLeftItems = function () {

        if (this.o.conf.left) {
        }

        return this.$template;
    };

    FM.prototype.renderLanguagePicker = function () {

        var $li = $('<li class="lang_picker_holder"></li>'),
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

    FM.prototype.selectCurrentItem = function () {

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

    FM.prototype.disableItem = function (item) {

        this.$template.find('li[id="' + item + '"] ').addClass("disabled");
    };

    FM.prototype.disable = function (items) {

        if (Array.isArray(items)) {
            for (var i = 0; i < items.length; i++) {
                this.disableItem(items[i]);
            }
        } else {
            this.disableItem(items);
        }

        this.$template.find("li.disabled a").on('click', function (e) {
            e.preventDefault();
            return false;
        });
    };

    FM.prototype.activateItem = function (item) {

        this.$template.find('li[id="' + item + '"] ').removeClass("disabled");
    };

    FM.prototype.activate = function (items) {

        if (Array.isArray(items)) {
            for (var i = 0; i < items.length; i++) {
                this.activateItem(items[i]);
            }
        } else {
            this.activateItem(items);
        }

        this.$template.find("li a").off('click');
    };

    FM.prototype.renderBreadcrumb = function () {

        if (!this.o.breadcrumb.hasOwnProperty('container') || $(this.o.breadcrumb.container).length === 0) {
            console.error("FENIX menu: impossible to find breadcrumb container");
            return
        }

        this.findActivePath({
            items: this.o.conf.items,
            callback: $.proxy(this.addItemsToBreadcrumb, this),
            path: []
        });
    };

    FM.prototype.findActivePath = function (obj) {

        var self = this;

        if (Array.isArray(obj.items)) {
            $(obj.items).each(function (index, item) {

                var o = $.extend(true, {}, obj);
                o['path'].push(item);

                if (item.hasOwnProperty("attrs") && item.attrs.id === self.o.active) {
                    o.callback(o['path']);
                } else {
                    if (item.hasOwnProperty('children')) {
                        o['items'] = item.children;
                        self.findActivePath(o);
                    }
                }
            });
        }
    };

    /*FM.prototype.findActivePath = function ( items ) {

     var self = this;

     if (Array.isArray(items)) {
     $(items).each(function (index, item) {

     if (item.hasOwnProperty("attrs") && item.attrs.id === self.o.active) {
     return [item];
     } else {
     if (item.hasOwnProperty('children')){
     var path = self.findActivePath( item.children);
     if (path){
     path.unshift(item);
     return path;
     }
     }
     }
     });
     }

     return null;
     };*/

    FM.prototype.addItemsToBreadcrumb = function (path) {

        var self = this;

        this.$brList = $('<ol>', {
            'class': 'breadcrumb'
        });

        $(this.o.breadcrumb.container).append(this.$brList);

        //Show always a link to home
        if (this.o.breadcrumb.showHome === true) {
            this.$brList.append($('<li><a href="./index.html"><i class="fa fa-home"></i></a></li>'));
        }

        if (Array.isArray(path)) {
            for (var i = 0; i < path.length; i++) {
                self.appendBreadcrumbItem(path[i], (i === path.length));
            }
        }

    };

    FM.prototype.appendBreadcrumbItem = function (item, isLast) {

        var $li = $('<li>'),
            $a = $('<a>', {
                href: isLast ? '#' : item.target,
                'class': isLast ? 'active' : '',
                text: item.breadcrumbLabel ? item.breadcrumbLabel[this.o.lang] : item.label[this.o.lang]
            });

        this.$brList.append($li.append($a));
    };

    return FM;
});