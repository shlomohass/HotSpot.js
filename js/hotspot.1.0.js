/*******************************************************************************
 * Created by: shlomo hassid.
 * Release Version : 1.0
 * Creation Date: 10/12/2014
 * Author E-mail: Shlomohassid@gmail.com
 * Suppot: support@14tec.com
 * require: jQuery latest, jQuery easing, hotspot.1.0.css	
 * Copyright 2014, shlomo hassid.
*******************************************************************************/

(function( $ ) {
  
    $.hotspot = function(element, options) {
        
        var defaults = {
            debug           : false,                     // True | False
            margin          : { t:5, l:5, b:5, r:5 },   // number | { t:number, l:number, b:number, r:number } | Num px Num px | Num px Num px Num px Num px
            pagePos         : "nw",                     // sw, se, ne, nw
            radius          : 0,                        // number | { tl:number, tr:number, br:number, bl:number } | Num px Num px Num px Num px
            mainSize        : 50,                       // number ( represent pixels )
            open            : "hor",                    // ver,hor
            easing          : "swing",                  // swing,easeInQuad,easeOutQuad,easeInOutQuad, easeInCubic,easeOutCubic,easeInOutCubic,easeInQuart, easeOutQuart, easeInOutQuart,easeInQuint, easeOutQuint, easeInOutQuint,easeInSine,easeOutSine,easeInOutSine,easeInExpo, easeOutExpo,easeInOutExpo,easeInCirc,easeOutCirc,easeInOutCirc, easeInElastic, easeOutElastic,easeInOutElastic,easeInBack,easeOutBack, easeInOutBack, easeInBounce,easeOutBounce,easeInOutBounce
            delayBetween    : 200,                      // number (mil secs)
            animDuration    : 800,                      // number mil secs
            
            smoothTransition: true,                     // True | False

            addShadow       : false,                    // True | False
            elements        : [],                       // Array ( elements array )
            customClass     : false,                    // False | String ( class name )
            
            closeOutClick   : true,                     // True | False
            openCallback    : function(){},             // Function
            closeCallback   : function(){},             // Function
            beforeOpen      : function(){},             // Function
            beforeClose     : function(){},             // Function
            created         : function(){},             // Function
            
            //System variables:
            def_pad         : 20,
            def_bg          : "black",
            def_sizeReduce  : "15%",
            def_cursor_disable : "default",
            def_close_disable : true,
            def_open_enable : false,
            def_newTab      : true,
            main_wider      : 2,
            def_iconPre     : "hsi_",
            def_iconSuf     : "_d"
            
        };
        
        var typo = {
            typo1: "Main ele not set.",
            typo2: "Bad variable set for 'margin' should be object : { t:numer, b:number, l:number, r:number }",
            typo3: "Bad variable set for 'mainSize' should be number >= 0",
            typo4: "Bad variable set for 'pagePos' should be string : se|sw|ne|nw",
            typo5: "Bad variable set for 'radius' should be number >= 0 : se|sw|ne|nw",
            typo6: "Bad variable set for 'open' should be be string : hor|ver",
            typo7: "Bad variable set for 'easing' should be be string : go to ducumentation for more details",
            typo8: "Bad variable set for 'delayBetween' should be be number >= 0",
            typo9: "Bad variable set for 'animDuration' should be be number >= 0",
            typo10: "Bad variable set for 'smoothTransition' should be be boolean|string: true|false",
            typo11: "Bad variable set for 'addShadow' should be be boolean|string: true|false",
            typo12: "Bad variable set for 'customClass' should be be string > 2chars",
            typo13: "Bad object set for 'margin'. ",
            typo14: "Bad object set for 'radius'. ",
            typo15: "Hotspot rebuilt. ",
            typo16: "Hotspot destroyed. ",
            typo17: "Hotspot disabled.",
            typo18: "Hotspot enabled.",
            typo19: "Hotspot created.",
            typo20: "Bad setting for `openCallback` should be a Function.",
            typo21: "Bad setting for `closeCallback` should be a Function.",
            typo22: "Bad setting for `created` should be a Function.",
            typo23: "Bad variable set for 'closeOutClick' should be be boolean|string: true|false",
            typo24: "Bad setting for `beforeOpen` should be a Function.",
            typo25: "Bad setting for `beforeClose` should be a Function."
        };
        
        //Private:
        var plugin = this; 
            plugin.settings = {};       
        var $element = $(element),
            $wraper = null,
            element = element,
            original =  $("<div />").append($(element).clone()).html(); 
            options = options || {};
        
        //Constructor:
        plugin.init = function() {
             
             //Extend options:
             plugin.settings = $.extend({}, defaults, options);
             
             //Timer for delay (future release):
             plugin.timerSet = null;

            //Find and intialize Main:
            var $main_clone = null;
            var _main = $element;
            
            //If we parse a list:
            if ( $element.eq(0).get(0).tagName.toLowerCase() !== "div" ) {
                $main_clone = $element.clone();
                oldAttr = $element.prop("attributes");
                main_new = $("<div />");
                $.each(oldAttr, function() {
                    if (this.name.indexOf("h-") !== 0 ) $(main_new).attr(this.name, this.value);
                });
                $element.replaceWith( $(main_new) );
                $element = $(main_new);
                element =  $(main_new)[0];
                original =  $("<div />").append($(main_new).clone()).html(); 
                
                main_new = null;
                oldAttr = null;
            }
            
            //Set needed elements:
            plugin.main_ele = $element;
            plugin.originalHTML = original;
            var _parent      = $element.parent();
            var _parentTag   = $(_parent).get(0).tagName;
            var _posEle      = {};
            var _posMain     = {};
            plugin.unique_namespace = plugin.methods.uniqueId(10);
            plugin._shadowToAdd = false;
            plugin.ele_arr = [];
            
            //intialize inline settings for elements:
            if ( $main_clone !== null ) {
                //update main settings:
               if ( typeof $main_clone.attr('H-margin') !== "undefined" ) { 
                   results = plugin.methods.margin_parse($main_clone.attr('H-margin')); 
                   if (results) plugin.settings.margin = results; 
               }
               if ( typeof $main_clone.attr('H-mainSize') !== "undefined" ) {
                   results = plugin.methods.int_parse($main_clone.attr('H-mainSize'));
                   if (results) plugin.settings.mainSize = results; 
               }
               if ( typeof $main_clone.attr('H-pagePos') !== "undefined" ) {
                   results = plugin.methods.valid_pos($main_clone.attr('H-pagePos'));
                   if (results) plugin.settings.pagePos = results; 
               }
               if ( typeof $main_clone.attr('H-radius') !== "undefined" ) {
                   results = plugin.methods.radius_parse($main_clone.attr('H-radius'));
                   if (results) plugin.settings.radius = results; 
               }
               if ( typeof $main_clone.attr('H-open') !== "undefined" ) {
                   results = plugin.methods.valid_open($main_clone.attr('H-open'));
                   if (results) plugin.settings.open = results; 
               }
               if ( typeof $main_clone.attr('H-easing') !== "undefined" ) {
                   results = plugin.methods.valid_easing($main_clone.attr('H-easing'));
                   if (results) plugin.settings.easing = results; 
               }
               if ( typeof $main_clone.attr('H-delayBetween') !== "undefined" ) {
                   results = plugin.methods.int_parse($main_clone.attr('H-delayBetween'));
                   if (results) plugin.settings.delayBetween = results; 
               }
               if ( typeof $main_clone.attr('H-animDuration') !== "undefined" ) {
                   results = plugin.methods.int_parse($main_clone.attr('H-animDuration'));
                   if (results) plugin.settings.animDuration = results; 
               }
               if ( typeof $main_clone.attr('H-smoothTransition') !== "undefined" ) {
                   results = plugin.methods.valid_bool($main_clone.attr('H-smoothTransition'));
                   if (results !== 'x') plugin.settings.smoothTransition = results; 
               }
               if ( typeof $main_clone.attr('H-addShadow') !== "undefined" ) {
                   results = plugin.methods.valid_pos($main_clone.attr('H-addShadow'));
                   if (results !== 'x') plugin.settings.addShadow = results; 
               }
               if ( typeof $main_clone.attr('H-customClass') !== "undefined" ) {
                   if ($main_clone.attr('H-customClass').trim().length) plugin.settings.customClass = $main_clone.attr('H-customClass').trim(); 
               }
               //Parse elements - from list:
               if ( $main_clone.find('li').length ) {
                    //Reset elements:
                    plugin.settings.elements = [];
                    $main_inline = $main_clone.find('li').eq(0);
                    plugin.settings.elements[0] = {
                        title        : ( typeof $main_inline.attr("H-title")        !== 'undefined' ? $main_inline.attr("H-title") : "" ),
                        bg           : ( typeof $main_inline.attr("H-bg")           !== 'undefined' ? $main_inline.attr("H-bg") : plugin.settings.def_bg ),
                        hoverBg      : ( typeof $main_inline.attr("H-hoverBg")      !== 'undefined' ? $main_inline.attr("H-hoverBg") : false ),
                        icon         : ( typeof $main_inline.attr("H-icon")         === 'string' ? $main_inline.attr("H-icon") : false ),
                        sizeReduce   : ( typeof $main_inline.attr("H-sizeReduce")   !== 'undefined' ? $main_inline.attr("H-sizeReduce") : plugin.settings.def_sizeReduce )
                    };
                    for ( var i=1; i<$main_clone.find('li').length; i++ ) {
                        $sub_inline = $main_clone.find('li').eq(i);
                         plugin.settings.elements[i] = {
                             title        : ( typeof $sub_inline.attr("H-title")       !== 'undefined' ? $sub_inline.attr("H-title")     : "" ),
                             bg           : ( typeof $sub_inline.attr("H-bg")          !== 'undefined' ? $sub_inline.attr("H-bg")        : plugin.settings.elements[0].bg ),
                             hoverBg      : ( typeof $sub_inline.attr("H-hoverBg")     !== 'undefined' ? $sub_inline.attr("H-hoverBg")   : false ),
                             pad          : ( typeof $sub_inline.attr("H-pad")         !== 'undefined' ? $sub_inline.attr("H-pad")       : plugin.settings.def_pad ),
                             icon         : ( typeof $sub_inline.attr("H-icon")        === 'string' ? $sub_inline.attr("H-icon")      : false ),
                             sizeReduce   : ( typeof $sub_inline.attr("H-sizeReduce")  !== 'undefined' ? $sub_inline.attr("H-sizeReduce"): plugin.settings.elements[0].sizeReduce ),
                             href         : ( typeof $sub_inline.attr("H-href")        !== 'undefined' ? $sub_inline.attr("H-href")      : false ),
                             func         : ( typeof $sub_inline.attr("H-func")        !== 'undefined' ? $sub_inline.attr("H-func")      : false ),
                             newTab       : ( typeof $sub_inline.attr("H-newTab")      !== 'undefined' ? $sub_inline.attr("H-newTab")    : true )
                         };
                        $sub_inline = null;
                    }
                }
                $main_clone = null;
                $sub_inline = null;
                $main_inline = null;
            }
                        
            //Validate settings:
            plugin.methods.validate_options();
            
            //get main ele settings:
            if (typeof plugin.settings.elements[0] !== undefined) {
                var mainSet = plugin.methods.validate_main(plugin.settings.elements[0]);
                plugin.settings["mainIcon"]        = mainSet.icon;
                plugin.settings["mainTitle"]       = mainSet.title;
                plugin.settings["mainSizeReduce"]  = mainSet.sizeReduce;
                plugin.settings["mainBg"]          = mainSet.bg;
                plugin.settings["mainHoverBg"]     = mainSet.hoverBg;
                mainSet = null;
            } else {
                if (plugin.settings.debug) console.log(typo.typo1);
                return;
            }    
            
            //set main classes: main, smooth, shadow, :
            $element.addClass("main_hotspot");
            if (plugin.settings.smoothTransition) 
                $element.addClass("smooth_transition_hotspot");
            switch (plugin.settings.addShadow) {
                case "ne": 
                    $element.addClass("shadow_ne_hotspot"); 
                    plugin._shadowToAdd = "shadow_ne_hotspot"; 
                    break;
                case "nw": 
                    $element.addClass("shadow_nw_hotspot"); 
                    plugin._shadowToAdd = "shadow_nw_hotspot"; 
                    break;
                case "se": 
                    $element.addClass("shadow_se_hotspot"); 
                    plugin._shadowToAdd = "shadow_se_hotspot"; 
                    break;
                case "sw": 
                    $element.addClass("shadow_sw_hotspot"); 
                    plugin._shadowToAdd = "shadow_sw_hotspot"; 
                    break;
            }            
            if (plugin.settings.mainIcon) 
                $element.addClass(plugin.settings.def_iconPre + plugin.settings.mainIcon);
            $element.addClass(plugin.unique_namespace);
            if (plugin.settings.customClass) 
                $element.addClass(plugin.settings.customClass);
            if (plugin.settings.mainTitle !== "")
                $element.attr("title",plugin.settings.mainTitle);
            
            //Add hover color main:
            if (plugin.settings.mainHoverBg) {
                $element.data("bgcolor-in",plugin.settings.mainHoverBg);
                $element.bind("mouseenter." + plugin.unique_namespace,plugin.methods.hoverInBg);
                $element.bind("mouseleave." + plugin.unique_namespace,plugin.methods.hoverOutBg);
            }
            
            //Set main CSS:
            $element.css({ 
                position:'absolute', 
                width:plugin.settings.mainSize + plugin.settings.main_wider, 
                height:plugin.settings.mainSize + plugin.settings.main_wider, 
                backgroundColor:plugin.settings.mainBg, 
                'z-index':(plugin.settings.elements.length + 1),
                borderTopLeftRadius: plugin.settings.radius.tl, 
                borderTopRightRadius: plugin.settings.radius.tr, 
                borderBottomLeftRadius: plugin.settings.radius.bl, 
                borderBottomRightRadius: plugin.settings.radius.br,
                WebkitBorderTopLeftRadius: plugin.settings.radius.tl, 
                WebkitBorderTopRightRadius: plugin.settings.radius.tr, 
                WebkitBorderBottomLeftRadius: plugin.settings.radius.bl, 
                WebkitBorderBottomRightRadius: plugin.settings.radius.br, 
                MozBorderTopLeftRadius: plugin.settings.radius.tl, 
                MozBorderTopRightRadius: plugin.settings.radius.tr, 
                MozBorderBottomLeftRadius: plugin.settings.radius.bl, 
                MozBorderBottomRightRadius: plugin.settings.radius.br, 
                backgroundSize: plugin.settings.mainSizeReduce
            });

            //wrap & save:
            $element.wrap("<div />");
            $wraper = $element.parent().addClass("wraper_hotspot reset_hotspot");

            //Set wrap CSS:
            if ( _parentTag.toLowerCase() === "body" ) {
                $wraper.css({ 
                    position : 'fixed', 
                    'z-index':1100, 
                    width:plugin.settings.mainSize + plugin.settings.main_wider, 
                    height:plugin.settings.mainSize + plugin.settings.main_wider 
                });
            } else {
                $(_parent).css({ position : 'relative' });
                $wraper.css({ 
                    position : 'absolute', 
                    'z-index':1000, 
                    width:plugin.settings.mainSize + plugin.settings.main_wider, 
                    height:plugin.settings.mainSize + plugin.settings.main_wider 
                });
            }

            //Append style and Position:
            switch (plugin.settings.pagePos.toLowerCase()) {
                case "ne":
                    $wraper.css({
                        top     : plugin.settings.margin.t,
                        right   : plugin.settings.margin.r
                    });
                    _posEle = { top:0, right:0 };
                    _posMain = { top:-1, right:-1 };
                break;                    
                case "se":
                    $wraper.css({
                        bottom  : plugin.settings.margin.b,
                        right   : plugin.settings.margin.r
                    });      
                    _posEle = { bottom:0, right:0 };
                    _posMain = { bottom:-1, right:-1 };
                break;
                case "sw":
                    $wraper.css({
                        bottom:plugin.settings.margin.b,
                        left:plugin.settings.margin.l
                    });  
                    _posEle = { bottom:0, left:0 };
                    _posMain = { bottom:-1, left:-1 };
                break;
                default : //nw
                    $wraper.css({
                        top:plugin.settings.margin.t,
                        left:plugin.settings.margin.l
                    });
                    _posEle = { top:0, left:0 };
                    _posMain = { top:-1, left:-1 };
            }
            
            $element.css(_posMain);
            $element.attr('stat','close');
            $element.attr('stat-dis','enable');
            
            //Clear unneeded:
            _parent = null;
            _parentTag = null;
            _posMain = null;
            
            //Create childrens:
            var calc_pad = 0;
            var clac_wrap_size = plugin.settings.mainSize;
            
            //Loop Elements:
            $.each( plugin.settings.elements, function( key, value ){
                if (key === 0) return; //Skip first its the main allready painted.
                value = plugin.methods.validate_ele(value);
                var ele = 
                      $("<div title='" + value.title + "' pad='" + value.pad + "' />")
                      .css({ 
                            position     : $element.css('position'), 
                            backgroundColor   : value.bg, 
                            width        : plugin.settings.mainSize, 
                            height       : plugin.settings.mainSize,
                            'z-index'    : plugin.settings.elements.length - key,
                            borderTopLeftRadius: plugin.settings.radius.tl, 
                            borderTopRightRadius: plugin.settings.radius.tr, 
                            borderBottomLeftRadius: plugin.settings.radius.bl, 
                            borderBottomRightRadius: plugin.settings.radius.br,
                            WebkitBorderTopLeftRadius: plugin.settings.radius.tl, 
                            WebkitBorderTopRightRadius: plugin.settings.radius.tr, 
                            WebkitBorderBottomLeftRadius: plugin.settings.radius.bl, 
                            WebkitBorderBottomRightRadius: plugin.settings.radius.br, 
                            MozBorderTopLeftRadius: plugin.settings.radius.tl, 
                            MozBorderTopRightRadius: plugin.settings.radius.tr, 
                            MozBorderBottomLeftRadius: plugin.settings.radius.bl, 
                            MozBorderBottomRightRadius: plugin.settings.radius.br,                             
                            backgroundSize: value.sizeReduce
                      }).css(_posEle).addClass("ele_hotspot");
                //Add hover color to ele:
                if (value.hoverBg) {
                    $(ele).data("bgcolor-in",value.hoverBg);
                    $(ele).bind("mouseenter." + plugin.unique_namespace,plugin.methods.hoverInBg);
                    $(ele).bind("mouseleave." + plugin.unique_namespace,plugin.methods.hoverOutBg);
                }
                //add classes:
                if (plugin.settings.smoothTransition) 
                    $(ele).addClass("smooth_transition_hotspot");
                $(ele).addClass(plugin.unique_namespace);
                if (value.icon) 
                    $(ele).addClass(plugin.settings.def_iconPre + value.icon);
                if (plugin.settings.customClass) 
                    $(ele).addClass(plugin.settings.customClass);
                //Add early to wraper:
                $wraper.append(ele);
                //Save pads:
                calc_pad += value.pad;
                clac_wrap_size += plugin.settings.mainSize;
                //Save to ele array:
                plugin.ele_arr.push(ele);
                //Ele behavior:
                plugin.methods.ele_behavior( ele, value );
                
            });
            
            calc_pad = null;
            clac_wrap_size = null;
            
            //Set expand event:
            $element.bind("click." + plugin.unique_namespace,function() {
                if ($(this).attr("stat-dis") === "disable") return;
                if ($(this).attr("stat") === "open" ) 
                    plugin.close(true,true);
                else
                    plugin.open(true,true);
            });

            //Close out click:
            if (plugin.settings.closeOutClick) {
                $(document).bind("click." + plugin.unique_namespace,function(e) {
                    if ($(e.target).is("." + plugin.unique_namespace)) return;
                    if ($element.attr("stat-dis") === "disable") return;
                    if ($element.attr("stat") === "close") return;
                    plugin.close(true);
                });
            }

            //Created callback:
            if (plugin.settings.debug) 
                console.log(typo.typo19 + " unique:" + plugin.unique_namespace + " id: " + $element.attr("id"));
            //Trigger:
            plugin.settings.created.call( element );
            
        };
        
        //More Events:
        plugin.destroy = function() {
            var newEle = $(plugin.originalHTML);
            $wraper.find('div').each(function(){
                $(this).unbind("."+plugin.unique_namespace);
            });
            $(document).unbind("." + plugin.unique_namespace);
            $wraper.replaceWith(newEle);
            plugin.methods.clear_timer();
            if (plugin.settings.debug) 
                console.log(typo.typo16 + "  unique:" + plugin.unique_namespace);
            return newEle;
        };
        plugin.rebuild = function(settings_re) {
            var newEle = plugin.destroy();
            var plugin_x = new $.hotspot(newEle, settings_re);
            $(newEle).data('hotspot', plugin_x);
            if (plugin_x.settings.debug) 
                console.log(typo.typo15 + "  unique:" + plugin_x.unique_namespace);
        };
        plugin.disable = function(cursor,close) {
            $element.attr('stat-dis','disable');
            if (cursor) $element.css({cursor:cursor});
            if (close) plugin.close(true,true);
            if (plugin.settings.debug) 
                console.log(typo.typo17 + "  unique:" + plugin.unique_namespace); 
        };
        plugin.enable = function(open) {
            var stat_dis = $element.attr('stat-dis');
            $element.attr('stat-dis','enable');
            if (stat_dis === 'disable') {
                $element.css({cursor:""});
                if (open) plugin.open(true,true);
            }
            if (plugin.settings.debug) 
                console.log(typo.typo18 + "  unique:" + plugin.unique_namespace); 
        };
        plugin.open = function(triggerBefore,triggerAfter) {
            if (triggerBefore) plugin.methods.hook_beforeOpen();
            if ($element.attr('stat') === "close") {
                $element.attr('stat','open');
                plugin.methods.expand_bar( plugin.ele_arr, "open", plugin._shadowToAdd, triggerAfter );
            }
        };
        plugin.close = function(triggerBefore,triggerAfter) {
            if (triggerBefore) plugin.methods.hook_beforeClose();
            if ($element.attr('stat') === "open") {
                $element.attr('stat','close');
                plugin.methods.expand_bar( plugin.ele_arr, "close", plugin._shadowToAdd, triggerAfter );
            }
        }; 
        //Plugin methods:
        plugin.methods = {
            validate_options : function() {
               //Validate main settings:
               //margin:
                if (typeof plugin.settings.margin !== "object" ) {
                   if (typeof plugin.settings.margin === "string" || typeof plugin.settings.margin === "number") {
                        results = plugin.methods.margin_parse(plugin.settings.margin);
                        if (results) plugin.settings.margin = results; 
                        else { 
                            plugin.settings.margin = defaults.margin;
                            if (plugin.settings.debug) console.log(typo.typo2); 
                        }
                   } else {
                       plugin.settings.margin = defaults.margin;
                       if (plugin.settings.debug) console.log(typo.typo2);
                   }
                }
                //mainSize:
                if (typeof plugin.settings.mainSize !== "number" ) {
                   results = plugin.methods.int_parse(plugin.settings.mainSize);
                   if (results) plugin.settings.mainSize = results; 
                   else {
                       plugin.settings.mainSize = defaults.mainSize;
                       if (plugin.settings.debug) console.log(typo.typo3);
                   }
                }
                //pagePos:
                if (typeof plugin.settings.pagePos === "string" ) {
                   results = plugin.methods.valid_pos(plugin.settings.pagePos);
                   if (results) plugin.settings.pagePos = results; 
                   else {
                       plugin.settings.mainSize = defaults.pagePos;
                       if (plugin.settings.debug) console.log(typo.typo4);
                    }
                } else {
                    plugin.settings.mainSize = defaults.pagePos;
                    if (plugin.settings.debug) console.log(typo.typo4);
                }
                //radius:
                if (typeof plugin.settings.radius !== "object" ) {
                   if (typeof plugin.settings.radius === "string" || typeof plugin.settings.radius === "number") {
                        results = plugin.methods.radius_parse(plugin.settings.radius);
                        if (results) plugin.settings.radius = results; 
                        else { 
                            plugin.settings.radius = defaults.radius;
                            if (plugin.settings.debug) console.log(typo.typo5); 
                        }
                   } else {
                       plugin.settings.radius = defaults.radius;
                       if (plugin.settings.debug) console.log(typo.typo5);
                   }
                }
                //open:
                if (typeof plugin.settings.open === "string" ) {
                   results = plugin.methods.valid_open(plugin.settings.open);
                   if (results) plugin.settings.open = results; 
                   else {
                       plugin.settings.open = defaults.open;
                       if (plugin.settings.debug) console.log(typo.typo6);
                    }
                } else {
                    plugin.settings.open = defaults.open;
                    if (plugin.settings.debug) console.log(typo.typo6);
                }
                //easing:
                if (typeof plugin.settings.easing === "string" ) {
                   results = plugin.methods.valid_easing(plugin.settings.easing);
                   if (results) plugin.settings.easing = results; 
                   else {
                       plugin.settings.easing = defaults.easing;
                       if (plugin.settings.debug) console.log(typo.typo7);
                    }
                } else {
                    plugin.settings.easing = defaults.easing;
                    if (plugin.settings.debug) console.log(typo.typo7);
                }
                //delayBetween:
                if (typeof plugin.settings.delayBetween !== "number" ) {
                   results = plugin.methods.int_parse(plugin.settings.delayBetween);
                   if (results) plugin.settings.delayBetween = results; 
                   else {
                       plugin.settings.delayBetween = defaults.delayBetween;
                       if (plugin.settings.debug) console.log(typo.typo8);
                   }
                }            
                //animDuration:
                if (typeof plugin.settings.animDuration !== "number" ) {
                   results = plugin.methods.int_parse(plugin.settings.animDuration);
                   if (results) plugin.settings.animDuration = results; 
                   else {
                       plugin.settings.animDuration = defaults.animDuration;
                       if (plugin.settings.debug) console.log(typo.typo9);
                   }
                }    
                //smoothTransition:
                if (typeof plugin.settings.smoothTransition !== "boolean" ) {
                   results = plugin.methods.valid_bool(plugin.settings.smoothTransition);
                   if (results !== 'x') plugin.settings.smoothTransition = results; 
                   else {
                       plugin.settings.smoothTransition = defaults.smoothTransition;
                       if (plugin.settings.debug) console.log(typo.typo10);
                   }
                }
                //addShadow:
                if (typeof plugin.settings.addShadow === "string" ) {
                   results = plugin.methods.valid_pos(plugin.settings.addShadow);
                   if (!results) {
                       plugin.settings.addShadow = defaults.addShadow;
                       if (plugin.settings.debug) console.log(typo.typo11);
                   }
                } else if (plugin.settings.addShadow !== false && plugin.settings.addShadow !== 0){
                   plugin.settings.addShadow = defaults.addShadow;
                   if (plugin.settings.debug) console.log(typo.typo11);
                }
                //customClass
                if ( typeof plugin.settings.customClass === "string" ) {
                    if (plugin.settings.customClass.trim().length < 2) {
                        plugin.settings.customClass = defaults.customClass;
                        if (plugin.settings.debug) console.log(typo.typo12);
                    } 
                }  else if (plugin.settings.customClass !== false && plugin.settings.customClass !== 0){
                     plugin.settings.customClass = defaults.customClass;
                     if (plugin.settings.debug) console.log(typo.typo12);
                }
                //openCB:
                if ( typeof plugin.settings.openCallback !== "function" ) {
                    plugin.settings.openCallback = defaults.openCallback;
                    if (plugin.settings.debug) console.log(typo.typo20);
                }
                //closeCB:
                if ( typeof plugin.settings.closeCallback !== "function" ) {
                    plugin.settings.closeCallback = defaults.closeCallback;
                     if (plugin.settings.debug) console.log(typo.typo21);
                }
                //beforeOpen:
                if ( typeof plugin.settings.beforeOpen !== "function" ) {
                    plugin.settings.beforeOpen = defaults.beforeOpen;
                     if (plugin.settings.debug) console.log(typo.typo24);
                }
                //beforeClose:
                if ( typeof plugin.settings.beforeClose !== "function" ) {
                    plugin.settings.beforeClose = defaults.beforeClose;
                     if (plugin.settings.debug) console.log(typo.typo25);
                }
                //createdCB:
                if ( typeof plugin.settings.created !== "function" ) {
                    plugin.settings.created = defaults.created;
                    if (plugin.settings.debug) console.log(typo.typo22);
                }
                //closeOutClick:
                if (typeof plugin.settings.closeOutClick !== "boolean" ) {
                   results = plugin.methods.valid_bool(plugin.settings.closeOutClick);
                   if (results !== 'x') plugin.settings.closeOutClick = results; 
                   else {
                       plugin.settings.closeOutClick = defaults.closeOutClick;
                       if (plugin.settings.debug) console.log(typo.typo23);
                   }
                }
            },
            validate_main : function( ele ) {
               if ( typeof ele.title === "undefined" || ele.title === '' ) ele["title"] = "";
               if ( typeof ele.bg === "undefined"  || ele.bg === '' ) ele["bg"] = plugin.settings.def_bg;
               if ( typeof ele.hoverBg === "undefined"  || ele.hoverBg === '' ) ele["hoverBg"] = false;
               if ( typeof ele.icon !== "string"  || ele.icon === '' ) { 
                   ele["icon"] = false; 
               } else {
                   ele["icon"] = plugin.methods.valid_icon(ele.icon); 
               }
               if ( 
                    typeof ele.sizeReduce === "undefined"  || 
                    ele.sizeReduce === '' ||
                    ele.sizeReduce === 'false' ||
                    ele.sizeReduce === false
               ) {
                    ele["sizeReduce"] = plugin.settings.def_sizeReduce;
                    ele.sizeReduce = plugin.methods.sizeReduce_parse(ele.sizeReduce);
               } else {
                    ele.sizeReduce = plugin.methods.sizeReduce_parse(ele.sizeReduce);
                    if (!ele.sizeReduce) {
                        ele.sizeReduce = plugin.settings.def_sizeReduce;
                        ele.sizeReduce = plugin.methods.sizeReduce_parse(ele.sizeReduce);
                    }                    
               }
               return ele;
            },
            validate_ele : function( ele ) {
               //Validtae Title:
               if ( typeof ele.title === "undefined" || ele.title === '' || ele.title === 'false') ele["title"] = "";
               //Validtae Bg:
               if ( typeof ele.bg === "undefined"  || ele.bg === '' ) ele["bg"] = plugin.settings.mainBg;
               //Validate hoverBg:
               if ( typeof ele.hoverBg === "undefined"  || ele.hoverBg === '' ) ele["hoverBg"] = false;
               //Validate pad:
               if ( typeof ele.pad === "undefined"  || ele.pad === '' ) ele["pad"] = plugin.settings.def_pad;
               //Validate icon:
               if ( typeof ele.icon !== "string"  || ele.icon === '' ) { 
                   ele["icon"] = false; 
               } else {
                   ele["icon"] = plugin.methods.valid_icon(ele.icon); 
               }
               //Validate margin:
               if ( 
                       typeof ele.sizeReduce === "undefined" || 
                       ele.sizeReduce === '' ||  
                       ele.sizeReduce === 'false' ||
                       ele.sizeReduce === false
               ) {
                    ele["sizeReduce"] = plugin.settings.mainSizeReduce;
               } else {
                    ele.sizeReduce = plugin.methods.sizeReduce_parse(ele.sizeReduce);
                    if (!ele.sizeReduce) {
                        ele.sizeReduce = plugin.settings.mainSizeReduce;
                    }
               }
               //Validate href:
               if ( typeof ele.href === "undefined"  || ele.href === '' ) ele["href"] = false;
               //Validate func:
               if ( typeof ele.func === "undefined"  || ele.func === '' ) ele["func"] = false;
               //Validate newTab:
               if ( typeof ele.newTab === "undefined"  || ele.newTab === '' ) ele["newTab"] = plugin.settings.def_newTab;
               
               return ele;
            },
            expand_bar : function( eles, stat, shadow, triggerAfter) {
                var pos = plugin.settings.pagePos.toLowerCase();
                var dir = plugin.settings.open;
                var width = plugin.settings.mainSize;
                var easing = plugin.settings.easing;
                var dur = plugin.settings.animDuration;
                var delay = plugin.settings.delayBetween;
                var pad_calc = 0;
                if (!shadow) shadow = "";
                if ( stat === "open" ) {
                    $.each(eles, function(key,ele) {
                        pad_calc += parseInt($(ele).attr('pad'));
                        var open_call = null;
                        if ( (key + 1) === eles.length && triggerAfter ) open_call = plugin.methods.hook_openCallBack;
                        switch (pos + dir) {
                            case "nwver":
                            case "never": $(ele).stop().animate({top:(width*(key+1)+pad_calc)}, (dur +(delay*key)), easing, open_call).addClass(shadow); break;
                            case "nwhor":
                            case "swhor": $(ele).stop().animate({left:(width * (key + 1) + pad_calc)}, (dur + (delay * key)), easing, open_call).addClass(shadow); break;                        
                            case "nehor":
                            case "sehor":  $(ele).stop().animate({right:(width * (key + 1) + pad_calc)}, (dur + (delay * key)), easing, open_call).addClass(shadow); break;
                            case "swver":
                            case "sever": $(ele).stop().animate({bottom:(width * (key + 1) + pad_calc)}, (dur + (delay * key)), easing, open_call).addClass(shadow); break; 
                        }
                    });
                } else {
                    $.each(eles, function(key,ele) {
                        var close_call = null;
                        if ( (key + 1) === eles.length && triggerAfter ) close_call = plugin.methods.hook_closeCallBack;
                        switch (pos + dir) {
                            case "nwver":
                            case "never": $(ele).stop().animate({top:0}, (dur + (delay * key)), easing, close_call).removeClass(shadow); break;
                            case "nwhor":
                            case "swhor": $(ele).stop().animate({left:0}, (dur + (delay * key)), easing, close_call).removeClass(shadow); break;                        
                            case "nehor":
                            case "sehor":  $(ele).stop().animate({right:0}, (dur + (delay * key)), easing, close_call).removeClass(shadow); break;
                            case "swver":
                            case "sever": $(ele).stop().animate({bottom:0}, (dur + (delay * key)), easing, close_call).removeClass(shadow); break; 
                        }
                    });                
                }
            },
            ele_behavior : function( ele, value ) {
                var tab = "_blank";
                if (!value.newTab) tab = "_self";
                if (value.href && value.func) {
                    $(ele).bind("click." + plugin.unique_namespace,function() {
                        window.open(value.href, tab); 
                        if ( typeof value.func === "string" ) 
                            eval(value.func);
                        if ( typeof value.func === "function" ) 
                            value.func.call( ele ); 
                    });
                }
                if (value.href && !value.func) { 
                    $(ele).bind("click." + plugin.unique_namespace,function() {
                        window.open(value.href, tab); 
                    });
                }
                if (!value.href && value.func) { 
                    $(ele).bind("click." + plugin.unique_namespace,function() {
                        if ( typeof value.func === "string" ) 
                            eval(value.func);
                        if ( typeof value.func === "function" ) 
                            value.func.call( ele ); 
                    });
                }
            },
            uniqueId : function(idlength) {
                var charstoformid = '_0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
                if (! idlength) idlength = 10;

                var uniqid = '';
                for (var i = 0; i < idlength; i++) {
                    uniqid += charstoformid[Math.floor(Math.random() * charstoformid.length)];
                }
                return uniqid;
            },
            margin_parse : function(value) {
                if (typeof value === "number") 
                    value = value.toString();
                if (value.match("^{") && value.match("}$")) {
                    try { return eval("("+value+")"); }
                    catch (e) {
                         if (plugin.settings.debug) {
                            if (e instanceof SyntaxError) console.log(typo.typo13 + " Syntax error - " + e.message);
                            else  console.log(typo.typo13 + " " + e.message);
                         }
                        return false;
                    }
                }
                _value = value.trim().split(" ");
                _return = false;
                if ( _value.length === 1 || _value.length === 2 || _value.length === 4 ) {
                    for (var j=0; j<_value.length; j++) _value[j] = _value[j].replace(/\D/g,'');
                    //try parse:
                    for ( var j=0; j<_value.length; j++ )
                       _value[j] = ( !isNaN(Number(_value[j])) ? Number(_value[j]): defaults.margin.t );
                    switch(_value.length) {
                        case 1:  _return = { t:_value[0], l:_value[0], b:_value[0], r:_value[0] }; break;
                        case 2:  _return = { t:_value[0], l:_value[1], b:_value[0], r:_value[1] }; break;
                        default: _return = { t:_value[0], l:_value[3], b:_value[2], r:_value[1] };
                    }
                }
                return _return;
            },
            sizeReduce_parse : function(value) {
                if (typeof value === "number") { 
                    value = plugin.settings.mainSize - value;
                    value = value.toString() + "px";
                    value = value + " " + value;
                    return value;
                }
                if (typeof value === "string") {
                    value = value.trim().split(' ');
                    for (var i=0; i<2; i++) {
                        if (typeof value[i] !== 'undefined') {
                            value[i] = value[i].replace(/[^0-9%]/g,'');
                            if (/%/i.test(value[i])) {
                                value[i] = parseInt(value[i].replace(/%/g,''));
                                if (!isNaN(value[i])) {
                                    value[i] = plugin.settings.mainSize - Math.floor(plugin.settings.mainSize * (value[i] / 100));
                                } else {
                                    if (i===1) value[i] = value[i-1];
                                    else return false;
                                }
                            } else {
                                value[i] = parseInt(value[i]);
                                if (!isNaN(value[i])) {
                                    value[i] = plugin.settings.mainSize - value[i];
                                } else {
                                    if (i===1) value[i] = value[i-1];
                                    else return false;
                                }
                            }                            
                        } else {
                            if (i === 1) value.push(value[i-1]);
                            else return false;
                        }
                    }
                    return value.join("px ") + "px";
                }
                return false;
            },
            radius_parse : function(value) {
                if (typeof value === "number") 
                    value = value.toString();
                if (value.match("^{") && value.match("}$")) {
                    try { return eval("("+value+")"); }
                    catch (e) {
                        if (plugin.settings.debug) {
                            if (e instanceof SyntaxError) console.log(typo.typo14 + " Syntax error:" + e.message);
                            else  console.log(typo.typo14 + " " + e.message);
                        }
                        return false;
                    }
                }
                _value = value.trim().split(" ");
                _return = false;
                if ( _value.length === 1 || _value.length === 4 ) {
                    for (var j=0; j<_value.length; j++) _value[j] = _value[j].replace(/\D/g,'');
                    //try parse:
                    for ( var j=0; j<_value.length; j++ )
                       _value[j] = ( !isNaN(Number(_value[j])) ? Number(_value[j]): defaults.radius );
                    switch(_value.length) {
                        case 1:  _return = { tl:_value[0], tr:_value[0], br:_value[0], bl:_value[0] }; break;
                        default: _return = { tl:_value[0], tr:_value[3], br:_value[2], bl:_value[1] };
                    }
                }
                return _return;
            },
            int_parse : function(value) {
                _value = value.trim().replace(/\D/g,'');
                return ( !isNaN(Number(_value)) ? Number(_value): false );
            },
            valid_pos : function(value) {
                _value = value.trim();
                switch (_value) {
                    case "sw":
                    case "se":
                    case "ne":
                    case "nw": return _value; break;
                    default: return false;
                }
            },
            valid_open : function(value) {
                _value = value.trim();
                switch (_value) {
                    case "ver":
                    case "hor": return _value; break;
                    default: return false;
                }
            },
            valid_easing : function(value) {
                _value = value.trim().replace(/[\W_]+/g,"");
                if (_value.length) return _value;
                return false;
            },
            valid_bool : function(value) {
                _value = (typeof value === 'string'? value.trim(): value);
                switch (_value) {
                    case "true":
                    case 1:
                    case "1": return true; break;
                    case "false":
                    case 0:
                    case "0": return false; break;
                    default: return 'x';
                }
            },
            valid_icon : function(value) {
                var reg = new RegExp("^"+plugin.settings.def_iconPre, "i");
                value = value.replace(reg,'');
                if (!/(_d|_w)$/.test(value)) {
                    value += plugin.settings.def_iconSuf;
                }
                return value;
            }, 
            hoverInBg : function(){
                $(this).data('bgcolor-out', $(this).css('background-color'))
                       .css('background-color', $(this).data('bgcolor-in'));
            },
            hoverOutBg : function(){
                $(this).css('background-color', $(this).data('bgcolor-out'));
            },
            clear_timer : function() {
                if (plugin.settings.debug) console.log('cleard');
                clearInterval(plugin.timerSet);
            },
            set_delay : function() {
                plugin.timerSet = setInterval(
                function(){
                }, plugin.settings.delayHover);
            },
            hook_closeCallBack : function(){
                plugin.settings.closeCallback.call( element );
            },
            hook_openCallBack : function(){
                plugin.settings.openCallback.call( element );
            },
            hook_beforeClose : function(){
                plugin.settings.beforeClose.call( element );
            },
            hook_beforeOpen : function(){
                plugin.settings.beforeOpen.call( element );
            }
        };
        //Finish.
        plugin.init();
        return plugin;
    };
    
    $.fn.destroy_hotspot = function(){
        return this.each(function() {
            $(this).data('hotspot').destroy();
        });
    };
    $.fn.rebuild_hotspot = function(settings_re){
        settings_re = settings_re || $(this).data('hotspot').settings;
        settings_re = $.extend({}, $(this).data('hotspot').settings, settings_re);
        return this.each(function() {
            $(this).data('hotspot').rebuild(settings_re);
        });
    };
    $.fn.enable_hotspot = function(open){
        open = (open === false || open === true)? open : $(this).data('hotspot').settings.def_open_enable;
        return this.each(function() {
            $(this).data('hotspot').enable(open);
        });
    };
    $.fn.disable_hotspot = function(cursor,close){
        cursor = cursor || $(this).data('hotspot').settings.def_cursor_disable;
        close = (close === false || close === true)? close : $(this).data('hotspot').settings.def_close_disable;
        return this.each(function() {
            $(this).data('hotspot').disable(cursor,close);
        });
    };
    $.fn.open_hotspot = function(triggerBefore, triggerAfter){
        triggerBefore = (triggerBefore === false || triggerBefore === true)? triggerBefore : false;
        triggerAfter = (triggerAfter === false || triggerAfter === true)? triggerAfter : false;
        return this.each(function() {
            $(this).data('hotspot').open(triggerBefore,triggerAfter);
        });
    };
    $.fn.close_hotspot = function(triggerBefore, triggerAfter){
        triggerBefore = (triggerBefore === false || triggerBefore === true)? triggerBefore : false;
        triggerAfter = (triggerAfter === false || triggerAfter === true)? triggerAfter : false;
        return this.each(function() {
            $(this).data('hotspot').close(triggerBefore,triggerAfter);
        });
    };

    $.fn.hotspot = function(options) {
        return this.each(function() {
            // if plugin has not already been attached to the element
            if (undefined === $(this).data('hotspot')) {
                var plugin = new $.hotspot(this, options);
                if (typeof plugin.main_ele !== 'undefined')
                    $(plugin.main_ele).data('hotspot', plugin);
            }
        });
    };

})( jQuery );