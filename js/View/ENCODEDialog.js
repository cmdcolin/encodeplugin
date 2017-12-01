define([
        'dojo/_base/declare',
        'dojo/dom-construct',
        'dojo/aspect',
        'dijit/focus',
        'dijit/form/Button',
        'dijit/form/RadioButton',
        'dijit/form/CheckBox',
        'dijit/form/TextBox',
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

        var introdiv = dom.create('div', {
            className: 'search-dialog intro',
            innerHTML: 'Browser ENCODE'
        }, container );

        // Render text box
        var searchBoxDiv = dom.create('div', {
            className: "section"
        }, container );
        dom.create( 'span', {
                        className: "header",
                        innerHTML: "Search for"
                    }, searchBoxDiv );
        

        return container;
    },

    _getSearchParams: function() {
        var content = this.content;
        return {
            expr: content.searchBox.get('value'),
            maxLen: 100
        };
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

    show: function ( callback ) {
        this.callback = callback || function() {};
        this.set( 'title', "ENCODE search");
        this.set( 'content', this._dialogContent() );
        this.inherited( arguments );
        focus.focus( this.closeButtonNode );
    }

});
});
