define([
        'dojo/_base/declare',
        'dojo/dom-construct',
        'dojo/aspect',
        'dijit/focus',
        'dijit/form/Button',
        'dijit/form/RadioButton',
        'dijit/form/CheckBox',
        'dijit/form/TextBox',
        'dojo/on',
        'dojo/query',
        'JBrowse/View/Dialog/WithActionBar'
    ],
    function(
        declare,
        dom,
        aspect,
        focus,
        dButton,
        dRButton,
        dCheckBox,
        dTextBox,
        on,
        query,
        ActionBarDialog
    ) {

return declare( ActionBarDialog, {

    constructor: function() {
        var thisB = this;
        aspect.after( this, 'hide', function() {
              focus.curNode && focus.curNode.blur();
              setTimeout( function() { thisB.destroyRecursive(); }, 500 );
        });
    },

    _dialogContent: function () {
        var content = this.content = {};

        var container = dom.create('div', { className: 'search-dialog' } );
        dom.create( 'img', {
            src: 'https://www.genome.gov/Images/feature_images/ENCODE_logo.gif',
            width: '100'
        }, container);
       

        // Render text box
        var searchBoxDiv = dom.create('div', {
            className: "section"
        }, container );
        dom.create( 'span', {
                        className: "header",
                        innerHTML: "Search for"
                    }, searchBoxDiv );

        content.searchBox = new dTextBox({}).placeAt( searchBoxDiv );
        var x = dom.create('p', {}, container);
        var thisB = this;
        var map = {};
        on(content.searchBox, 'change', function() {
            val = content.searchBox.get('value');
            fetch('https://www.encodeproject.org/search/?type=file&dataset=/experiments/'+val+'/&format=json&limit=all').then(function(res) {
                res.json().then(function(res2) {
                    res2['@graph'].forEach(function(elt) {
                        var b = dom.create('button', {class: 'mybutton', myhref: elt.title, innerHTML: 'Add'},x);
                        b._href = elt.href;
                        map[elt.title] = elt;
                        x.innerHTML += elt.title+' '+elt.assembly+' '+elt.output_type+' '+elt.file_format+'<br/>';
                    });
                    query('.mybutton').on('click', function(evt) {
                        var title = evt.target.getAttribute('myhref');
                        thisB.addTrack(map[title]);
                    });
                    thisB.resize();
                    console.log(res2)
                });

            }, function(err) {
                console.error('error', err)
            });
            console.log(content.searchBox.get('value'));
        });
        

        return container;
    },

    addTrack: function(url) {
        console.log(url);
		var storeConf = {
			browser: this.browser,
			refSeq: this.browser.refSeq,
			type: trackConf.storeClass,
			baseUrl: this.browser.config.baseUrl + 'data/',
			urlTemplate: trackConf.urlTemplate
		};
		var storeName = this.browser.addStoreConfig(null, storeConf);
		var thisB = this;
		storeConf.name = storeName;
		this.browser.getStore(storeName, function() {
			trackConf.store = storeName;
			if (trackConf.style && trackConf.style.color) {
				trackConf.style.color = eval('(' + trackConf.style.color + ')');
			}
			thisB.browser.publish('/jbrowse/v1/v/tracks/new', [trackConf]);
			thisB.browser.publish('/jbrowse/v1/v/tracks/show', [trackConf]);
		});
    },

    _fillActionBar: function ( actionBar ) {
        var thisB = this;

        new dButton({
                            label: 'Search',
                            iconClass: 'dijitIconBookmark',
                            onClick: function() {
                                var searchParams = thisB._getSearchParams();
                                thisB.callback( searchParams );
                                thisB.hide();
                            }
                        })
            .placeAt( actionBar );
        new dButton({
                            label: 'Cancel',
                            iconClass: 'dijitIconDelete',
                            onClick: function() {
                                thisB.callback( false );
                                thisB.hide();
                            }
                        })
            .placeAt( actionBar );
    },

    show: function ( browser, callback ) {
        this.browser = browser;
        this.callback = callback || function() {};
        this.set( 'title', "ENCODE search");
        this.set( 'content', this._dialogContent() );
        this.inherited( arguments );
        focus.focus( this.closeButtonNode );
    }

});
});
