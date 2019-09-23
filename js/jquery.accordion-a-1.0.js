;(function($, undefined) {

    $.widget('accordiona.accordionA', {
    
        options: {
            section: '> section',
            header: '> header',
            content: '> .content',
        },
    
    
        _create: function() {
            
            this.$window = $(window);
            this.$document = $(document);
            this.sections = this.element.find(this.options.section);
            this.html = 
            $('html')
            // add js class for JavaScript exclusive CSS code
            .addClass('js');
            
            
            this.element
            .attr('role', 'tablist')
            .delegate(this.sections.prop('nodeName') + ' ' + this.options.header, 'click focus blur'.split(' ').concat('').join('.' + this.namespace + ' '), $.proxy(function(event) {
                
                var section = $(event.target).closest(this.sections),
                    header = section.find(this.options.header),
                    content = section.find(this.options.content);
                
                
                switch(event.type) {
                    
                    case 'click':
                        
                        header.addClass('no-outline');
                        this.toggle(section);
                        
                        break;
                    
                    case 'focusin':
                    
                        section.bind('keydown.' + this.namespace, $.proxy(function(event) {
                            
                            switch(event.keyCode) {
                                
                                // tab
                                case 9: header.removeClass('no-outline'); break;
                                
                                // space
                                case 32:
                                    
                                    event.preventDefault();
                                    this.toggle(section);
                                    
                                    break;
                            }
                        },
                        this));
                        
                        break;
                        
                    case 'focusout': section.unbind('keydown.' + this.namespace); break;
                }
            },
            this));
            
            
            // ensure single section with aria-expanded set to true
            this.sections
            .filter('[aria-expanded="true"]:not(:first)')
            .removeAttr('aria-expanded');
            
            
            this.sections
            .each($.proxy(function(i, current) {
                
                var section = $(current),
                    content = section.find(this.options.content);
                
                
                section
                .find(this.options.header)
                .attr({
                    role: 'tab',
                    tabindex: 0,
                });
                
                
                content
                .attr('role', 'tabpanel')
                .data(this.namespace, {
                    height: content.height(),
                })
                .addClass('no-transition');
                
                
                this.toggle(section, section.attr('aria-expanded') === 'true');
                setTimeout(function() { content.removeClass('no-transition'); });
            },
            this));
            
            
            this._hash();
        },
        
        
        destroy: function() {
            
            this.$window.unbind(this.namespace);
            this.$document.undelegate(this.namespace);
            this.element.undelegate(this.namespace);
            
            $.Widget.prototype.destroy.call(this);
        },
        
        
        toggle: function(selector, expand) {
            
            if(!selector.jquery)
            switch(typeof selector) {
                
                case 'object': selector = $(selector); break;
                case 'string': selector = this.element.find(selector); break;
                case 'number': selector = this.sections.eq(selector); break;
            }
                    
            if(selector.length) {
                
                if(typeof expand !== 'boolean') expand = selector.attr('aria-expanded') !== 'true';
                
                // collapse currently expanded section
                if(expand) this.toggle(this.sections.filter('[aria-expanded="true"]'), false);
                
                
                var content =
                selector
                .attr('aria-expanded', expand)
                // fix for Webkit CSS attribute selector
                .toggleClass('expanded', expand)
                .find(this.options.content);
                
                
                content.height(expand ? content.data(this.namespace).height : 0);
            
            
                this._trigger('toggle', null, {expand: expand});
            }
            
            return this;
        },
        
        
        _hash: function() {
            
            // initial hash in the URL
            if(location.hash) this._expandHash(location.hash);
            
            // hash anchor activation
            this.$document.delegate('a[href^="#"]:not([href="#"])', 'click.' + this.namespace, $.proxy(function(event) {
                
                this._expandHash($(event.target).attr('href'));
            },
            this));
            
            // navigation e.g. back button
            this.$window.bind('hashchange.' + this.namespace, $.proxy(function() {
                
                this._expandHash(location.hash);
            },
            this));
        },
        
        
        _expandHash: function(hash) {
    
            var target = this.element.find(hash);
            
            if(target.length) {
                
                var scroll = this.$document.height() > this.$window.height();
                
                scroll && this.element.addClass('no-transition');
                this.toggle(target.closest(this.sections), true);
                scroll && setTimeout($.proxy(function() { this.element.removeClass('no-transition'); }, this));
            }
        },
    });
    
    })(jQuery);