/*
 * jQuery Backstretch
 * Version 1.2.5
 * http://srobbin.com/jquery-plugins/jquery-backstretch/
 *
 * Add a dynamically-resized background image to the page
 *
 * Copyright (c) 2011 Scott Robbin (srobbin.com)
 * Dual licensed under the MIT and GPL licenses.
 *
 * modified 2011-12-01 by Bartlomiej Walczak (feniks@akcja.pl)
 * added fitWidth and fitHeight options and relevant code
*/

(function($) {

    $.backstretch = function(src, options, callback) {
        var defaultSettings = {
            centeredX: true,         // Should we center the image on the X axis?
            centeredY: true,         // Should we center the image on the Y axis?
            speed: 0,                // fadeIn speed for background after image loads (e.g. "fast" or 500)
    					fitHeight: false,				 // fit height of the image within root element limits
						fitWidth: true,				   // fit width of the image within root element limits - default behaviour so far
        },
        container = $("#backstretch"),
        settings = container.data("settings") || defaultSettings, // If this has been called once before, use the old settings as the default
        existingSettings = container.data('settings'),
        rootElement = ("onorientationchange" in window) ? $(document) : $(window), // hack to acccount for iOS position:fixed shortcomings
        imgRatio, bgImg, bgWidth, bgHeight, bgOffset, bgCSS, imgWidth, imgHeight;
                
        // Extend the settings with those the user has provided
        if(options && typeof options == "object") $.extend(settings, options);
        
        // Just in case the user passed in a function without options
        if(options && typeof options == "function") callback = options;
    
        // Initialize
        $(document).ready(_init);
  
        // For chaining
        return this;
    
        function _init() {
            // Prepend image, wrapped in a DIV, with some positioning and zIndex voodoo
            if(src) {
                var img;
                
                // If this is the first time that backstretch is being called
                if(container.length == 0) {
                    container = $("<div />").attr("id", "backstretch")
                                            .css({left: 0, top: 0, position: "fixed", overflow: "hidden", zIndex: -999999, margin: 0, padding: 0, height: "100%", width: "100%"});
                } else {
                    // Prepare to delete any old images
                    container.find("img").addClass("deleteable");
                }
                
                img = $("<img />").css({position: "absolute", display: "none", margin: 0, padding: 0, border: "none", zIndex: -999999})
                                  .bind("load", function(e) {                                          
                                      var self = $(this);
                                          
                                      self.css({width: "auto", height: "auto"});
                                      imgWidth = this.width || $(e.target).width();
                                      imgHeight = this.height || $(e.target).height();
                                      imgRatio = imgWidth / imgHeight;

                                      _adjustBG(function() {
                                          self.fadeIn(settings.speed, function(){
                                              // Remove the old images, if necessary.
                                              container.find('.deleteable').remove();
                                              // Callback
                                              if(typeof callback == "function") callback();
                                          });
                                      });
                                      
                                  })
                                  .appendTo(container);
                 
                // Append the container to the body, if it's not already there
                if($("body #backstretch").length == 0) {
                    $("body").append(container);
                }
                
                // Attach the settings
                container.data("settings", settings);
                    
                img.attr("src", src); // Hack for IE img onload event
                // Adjust the background size when the window is resized or orientation has changed (iOS)
                $(window).resize(_adjustBG);
            }
        }
            
        function _adjustBG(fn) {
            try {
                bgCSS = {left: 0, top: 0}
								
                // Make adjustments based on image ratio
                // Note: Offset code provided by Peter Baker (http://ptrbkr.com/). Thanks, Peter!
								
                if((imgHeight >= rootElement.height()) || (imgWidth >= rootElement.width())) {
										// calculate fit height image
										bgHeight = rootElement.height();
										bgWidth = bgHeight * imgRatio; 
										// see if width is wider than element
										if ((bgWidth > rootElement.width())) {
											bgWidth = rootElement.width();
											if (settings.fitWidth) {
												// adjust height
												imgWidth = bgWidth;											
												imgHeight = imgWidth / imgRatio;
												// adjust vertical offset
												bgOffset = (bgHeight - imgHeight) / 2;
												if(settings.centeredY) $.extend(bgCSS, {top: bgOffset + "px"});
											} else if (settings.fitHeight && !settings.fitWidth) {
												imgHeight = bgHeight;
												imgWidth = imgHeight * imgRatio; 
												// stretch background
												bgWidth = rootElement.width();
												// adjust horizonal offset
												bgOffset = (imgWidth - bgWidth) / 2;
												if(settings.centeredX) $.extend(bgCSS, {left: "-" + bgOffset + "px"});																								
											} else {											
												// adjust both offsets
												if (imgHeight > bgHeight) {
													bgOffset = (imgHeight - bgHeight) / 2;
													if(settings.centeredY) $.extend(bgCSS, {top: "-" + bgOffset + "px"});
												} else {
													bgOffset = (bgHeight - imgHeight) / 2;
													if(settings.centeredY) $.extend(bgCSS, {top: bgOffset + "px"});													
												}
												bgOffset = (imgWidth - bgWidth) / 2;
												if(settings.centeredX) $.extend(bgCSS, {left: "-" + bgOffset + "px"});																								
											}
										} else {
											// stretch background
											bgWidth = rootElement.width();
											if (settings.fitHeight) {
												// adjust width
												imgHeight = bgHeight;
												imgWidth = imgHeight * imgRatio;											
												// adjust horizonal offset
												bgOffset = (bgWidth - imgWidth ) / 2;
												if(settings.centeredX) $.extend(bgCSS, {left: bgOffset + "px"});
											} else if (settings.fitWidth && !settings.fitHeight) {
												// adjust height
												bgWidth = rootElement.width();
												imgWidth = bgWidth;											
												imgHeight = imgWidth / imgRatio;
												// adjust vertical offset
												bgOffset = (bgHeight - imgHeight) / 2;
												if(settings.centeredY) $.extend(bgCSS, {top: bgOffset + "px"});												
											} else {
												// adjust both offsets
												bgOffset = (imgHeight - bgHeight) / 2;
												if(settings.centeredY) $.extend(bgCSS, {top: "-" + bgOffset + "px"});
												bgOffset = (imgWidth - bgWidth) / 2;
												if(settings.centeredX) $.extend(bgCSS, {left: "-" + bgOffset + "px"});																								
											}
												
										}					
                } else {
									// enlarge to fit in height
									imgHeight = rootElement.height();
									imgWidth = imgHeight * imgRatio;
									bgHeight = imgHeight;
									bgWidth = rootElement.width();
									// adjust horizontal offset
									bgOffset = (imgWidth - bgWidth) / 2;
									if(settings.centeredX) $.extend(bgCSS, {left: "-" + bgOffset + "px"});																								
                }
                $("#backstretch").width( bgWidth ).height( bgHeight );
                $("#backstretch img:not(.deleteable)").width( imgWidth ).height( imgHeight ).css(bgCSS);
            } catch(err) {
                // IE7 seems to trigger _adjustBG before the image is loaded.
                // This try/catch block is a hack to let it fail gracefully.
            }
      
            // Executed the passed in function, if necessary
            if (typeof fn == "function") fn();
        }
    };
  
})(jQuery);