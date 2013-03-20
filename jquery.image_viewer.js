;(function ( $, window, document, undefined ) {
    var pluginName = "imageViewer",
        defaults = {
            start: 1,
			show: 5,
			prevLinkContent: '<<<',
			nextLinkContent: '>>>',
			prevRollerLinkContent: 'Prev',
			nextRollerLinkContent: 'Next',
			hideSource: false,
			previewHeight: 105,
			previewWidth: 100
        };

    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;

		this.links = [];
		this.thumbs = [];

		this.displayed = 1;
		
		this.roller = {
			lastDisplayed: 1,
			displayed: [],
			height: 0,
			width: 0
		};
		
        this.init();
    }

    Plugin.prototype = {

        init: function() {
			var _links = $(this.element).find('a');
			var _thumbs = $(this.element).find('img');
			var _images = [];
			var _this = this;
			
			_links.each(function(key, element) {
				_this.links[key] = $(element).attr('href');
				_images[key] = new Image();
				_images[key].src = _this.links[key];
			});
			_thumbs.each(function(key, element) {
				_this.thumbs[key] = $(element).attr('src');
			});
			
			if (this.options.hideSource) {
				$(this.element).hide();
			}
			
			this.createContainer();
			var countImages = this.links.length;
			if (this.options.start > countImages - 1) {
				this.options.start = 0;
			}
			
			if (countImages > 1) {
				this.appendRoller(this.options.start);
				this.appendImageLinks();
			}
			this.displayImage(this.options.start);
        },

        createContainer: function() {
			$('body').append(
				'<div class="' + pluginName + '-container">' +
					'<div class="' + pluginName + '-image-link ' + pluginName + '-image-link-prev">' +
					'</div>' +
					'<div class="' + pluginName +'-image">' +
					
					'</div>' +
					'<div class="' + pluginName +'-images-list">' +
					
					'</div>' +
					'<div class="' + pluginName + '-image-link ' + pluginName + '-image-link-next">' +
					'</div>' +
				'</div>'
			);
        },
		
		appendImageLinks: function() {
			var _this = this;
		
			var $containerPrevLink = $('.'  + pluginName + '-image-link.' + pluginName + '-image-link-prev');
			var $containerNextLink = $('.'  + pluginName + '-image-link.' + pluginName + '-image-link-next');
			
			$linkPrev = $('<a href="#prev">' + this.options.prevLinkContent + '</a>');
			$linkPrev.click(function() {
				_this.imagePrev();
				return false;
			});
			$containerPrevLink.append($linkPrev);
			
			$linkNext = $('<a href="#prev">' + this.options.nextLinkContent + '</a>');
			$linkNext.click(function() {
				_this.imageNext();
				return false
			});
			$containerNextLink.append($linkNext);
		},
		
		appendRoller: function(startItem) {
			var _this = this;
			var roller = $('.' + pluginName  +'-images-list');
			
			var rollerItems = $('<div class="' + pluginName + '-roller-items"/>');
			
			rollerItems.css({
				position: 'relative',
				height: this.options.show * this.options.previewHeight,
				width: _this.options.previewWidth,
				overflow: 'hidden'
			});
			
			this.roller.width = _this.options.previewWidth;
			this.roller.height = this.options.show * this.options.previewHeight;
			
			var prevLink = 
				'<a href="#prev" class="' + pluginName + '-roller-prev-link">' +
					this.options.prevRollerLinkContent +
				'</a>';
	
			var nextLink = 
				'<a href="#next" class="' + pluginName + '-roller-next-link">' +
					this.options.nextRollerLinkContent +
				'</a>';
				
			$.each(this.thumbs, function(key, item) {
				var elementContainer = $('<div class="' + pluginName + '-roller-item" data-number="' + key + '"/>');
				elementContainer.css({
					position: 'absolute',
					width: _this.options.previewWidth,
					height: _this.options.previewHeight,
					left: 0,
					top: _this.options.previewHeight * key
				});
				
				var element = 
					'<a href="' + _this.links[key] + '" data-number="' + key + '">' +
						'<img src="' + item + '" alt="" />' +
					'</a>';
				element = $(element);

				element.click(function() {
					_this.displayImage($(this).attr('data-number') * 1, false);
					return false;
				});
				
				elementContainer.append(element);
				
				rollerItems.append(elementContainer);
			});
			
			roller.html('');
			if (this.links.length > this.options.show) {
				prevLink = $(prevLink);
				prevLink.click(function(){
					_this.pollerPrev();
					return false;
				});			
				roller.append(prevLink);
			}
			
			roller.append(rollerItems);
				
			if (this.links.length > this.options.show) {
				nextLink = $(nextLink);
				nextLink.click(function(){
					_this.rollerNext();
					return false;
				});	
				roller.append(nextLink)
			}
			
			this.scrollRollerTo(this.options.start);
		},
		
		scrollRollerTo: function(start) {
			var _this = this;
			var position = 0;
			this.roller.displayed = [];
			
			if (start > this.thumbs.length - 1) {
				start = 0;
			}
			
			for (var i = 0; i < this.options.show; i++) {
				position = start + i;
				if (position > this.thumbs.length - 1) {
					position = 0;
				}
				this.roller.displayed[i] = position;
			}
			$('.' + pluginName + '-roller-item').each(function(key, item) {
				var $item = $(item);
				var position = $.inArray(
					$item.attr('data-number') * 1, 
					_this.roller.displayed
				) * _this.options.previewHeight;
				$item.css(
					'top', 
					position
				);
				$item.removeClass(pluginName + '-roller-item-hidden');
				if (position < 0) {
					$item.addClass(pluginName + '-roller-item-hidden');
				}
			});
		},
		
		scrollRoller: function(direction) {
			var _this = this;

			var lastDisplayed = this.roller.displayed;
			var newPosition = 0;

			this.roller.displayed = [];

			for (var i = 0; i < this.options.show; i++) {
				if (direction > 0) {
					newPosition = lastDisplayed[i] + 1;
					if (newPosition > this.thumbs.length - 1) {
						newPosition = 0;
					}
				} else {
					newPosition = lastDisplayed[i] - 1 ;
					if (newPosition < 0) {
						newPosition = this.thumbs.length - 1;
					}
				}
				this.roller.displayed[i] = newPosition;
			}
			
			$('.' + pluginName + '-roller-item').each(function(key, item) {
				var $item = $(item);
				var position = $.inArray(
					$item.attr('data-number') * 1, 
					_this.roller.displayed
				) * _this.options.previewHeight;
				$item.css(
					'top', 
					position
				);
				$item.removeClass(pluginName + '-roller-item-hidden');
				if (position < 0) {
					$item.addClass(pluginName + '-roller-item-hidden');
				}
			});
		},
		
		displayImage: function(position, scroll, direction) {
			var _this = this;
			
			scroll = typeof scroll !== 'undefined' ? scroll : true;
			direction = typeof direction !== 'undefined' ? direction : 1;
		
			if (position > this.thumbs.length - 1) {
				position = 0;
			}
			
			if (position < 0) {
				position = this.thumbs.length - 1;
			}
			
			this.displayed = position;
			
			$('.' + pluginName + '-roller-item').each(function(key, item) {
				var $item = $(item);
				$item.removeClass(pluginName + '-roller-item-active');
				if ($item.attr('data-number') * 1 == position) {
					$item.addClass(pluginName + '-roller-item-active');
				}
			});
			
			if (scroll && direction > 0 && (position == this.roller.displayed[2] + 1 || position == 0)) {
				this.scrollRoller(direction);
			}
			
			if (scroll && direction < 0 && (position == this.roller.displayed[0] - 1 || position == this.thumbs.length - 1)) {
				this.scrollRoller(direction);
			}
			
			var $link = $('<a href="#next" data-number="' + position + '" />');
			$link.click(function() {
				if (_this.links.length > 1) {
					_this.displayImage(position + 1);
				}
				return false;
			});
			
			$link.append($('<img src="' + this.links[position] + '"/>'));
			
			$('.' + pluginName  +'-image').html('').append($link);
			return false;
		},
		
		rollerNext: function() {
			var nowDisplayed = this.roller.lastDisplayed;
			nowDisplayed ++;
			if (nowDisplayed > this.thumbs.length - 1) {
				nowDisplayed = 0;
			}
			this.scrollRoller(1);
		},
		
		pollerPrev: function() {
			var nowDisplayed = this.roller.lastDisplayed;
			nowDisplayed --;
			if (nowDisplayed < 0) {
				nowDisplayed = this.thumbs.length - 1;
			}
			this.scrollRoller(-1);
		},
		
		imageNext: function() {
			this.displayImage(this.displayed + 1, true, 1);
		},
		
		imagePrev: function() {
			this.displayImage(this.displayed - 1, true, -1);
		}
    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );