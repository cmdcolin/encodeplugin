define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/dom-construct',
    'dojo/aspect',
    'dijit/focus',
    'dijit/form/Button',
    'dijit/form/CheckBox',
    'dijit/form/TextBox',
    'dojo/on',
    'dojo/query',
    'JBrowse/View/Dialog/WithActionBar'
],
function (
    declare,
    array,
    dom,
    aspect,
    focus,
    Button,
    CheckBox,
    TextBox,
    on,
    query,
    ActionBarDialog
) {
    return declare(ActionBarDialog, {

        constructor: function () {
            var thisB = this;
            aspect.after(this, 'hide', function () {
                focus.curNode && focus.curNode.blur();
                setTimeout(function () { thisB.destroyRecursive(); }, 500);
            });
        },

        _dialogContent: function () {
            var content = this.content = {};

            var container = dom.create('div', { className: 'search-dialog' });
            dom.create('img', {
                src: 'https://www.genome.gov/Images/feature_images/ENCODE_logo.gif',
                width: '100'
            }, container);


            // Render text box
            var searchBoxDiv = dom.create('div', {
                className: 'section'
            }, container);
            dom.create('span', {
                className: 'header',
                innerHTML: 'Search for'
            }, searchBoxDiv);

            content.searchBox = new TextBox({}).placeAt(searchBoxDiv);
            var x = dom.create('p', {}, container);
            var thisB = this;
            var map = {};
            on(content.searchBox, 'change', function () {
                dom.empty(x);
                var val = content.searchBox.get('value');
                fetch('https://www.encodeproject.org/search/?type=file&dataset=/experiments/' + val + '/&format=json&limit=all').then(function (res) {
                    res.json().then(function (res2) {
                        var b1 = dom.create('button', {class: 'allbigwig', innerHTML: 'Add all BigWig'}, x);
                        var b2 = dom.create('button', {class: 'allbam', innerHTML: 'Add all BAM'}, x);
                        var b3 = dom.create('button', {class: 'allbigbed', innerHTML: 'Add all BigBed'}, x);
                        dom.create('br', {}, x);
                        on(b1, 'click', function () {
                            var arr = [];
                            Object.keys(map).forEach(function (r) {
                                if (map[r].file_format === 'bigwig') {
                                    arr.push(map[r]);
                                }
                            });
                            thisB.addMultiBigWig(arr);
                        });

                        res2['@graph'].forEach(function (elt) {
                            dom.create('button', {class: 'mybutton', myhref: elt.title, innerHTML: 'Add'}, x);
                            map[elt.title] = elt;
                            x.innerHTML += elt.title + ' ' + elt.assembly + ' ' + elt.output_type + ' ' + elt.file_format + '<br/>';
                        });

                        query('.mybutton').on('click', function (evt) {
                            var title = evt.target.getAttribute('myhref');
                            thisB.addTrack(map[title]);
                        });

                        thisB.resize();
                    });
                }, function (err) {
                    console.error('error', err);
                });
                console.log(content.searchBox.get('value'));
            });


            return container;
        },

        addMultiBigWig: function (arr) {
            var storeConf = {
                browser: this.browser,
                refSeq: this.browser.refSeq,
                type: 'MUltiBigWig/Store/SeqFeature/MultiBigWig',
                urlTemplates: array.map(arr, function (elt) { return {url: 'https://www.encodeproject.org' + elt.href, name: elt.title }; })
            };
            var storeName = this.browser.addStoreConfig(null, storeConf);

            var trackConf = {
                type: 'MultiBigWig/View/Track/MultiWiggle/MultiDensity',
                store: storeName,
                label: 'MultiBigWig',
                urlTemplates: array.map(arr, function (elt) { return {url: elt.href, name: elt.title }; })
            };
            trackConf.store = storeName;
            this.browser.publish('/jbrowse/v1/v/tracks/new', [trackConf]);
            this.browser.publish('/jbrowse/v1/v/tracks/show', [trackConf]);
        },
        addTrack: function (url) {
            var storeConf = {
                browser: this.browser,
                refSeq: this.browser.refSeq,
                type: 'JBrowse/Store/SeqFeature/BigWig',
                urlTemplate: 'https://www.encodeproject.org' + url.href
            };
            var storeName = this.browser.addStoreConfig(null, storeConf);

            var trackConf = {
                type: 'JBrowse/View/Track/Wiggle/XYPlot',
                store: storeName,
                label: url.title
            };
            trackConf.store = storeName;
            this.browser.publish('/jbrowse/v1/v/tracks/new', [trackConf]);
            this.browser.publish('/jbrowse/v1/v/tracks/show', [trackConf]);
        },

        _fillActionBar: function (actionBar) {
            var thisB = this;

            new Button({
                label: 'Search',
                iconClass: 'dijitIconBookmark',
                onClick: function () {
                    var searchParams = thisB._getSearchParams();
                    thisB.callback(searchParams);
                    thisB.hide();
                }
            }).placeAt(actionBar);
            new Button({
                label: 'Cancel',
                iconClass: 'dijitIconDelete',
                onClick: function () {
                    thisB.callback(false);
                    thisB.hide();
                }
            }).placeAt(actionBar);
        },

        show: function (browser, callback) {
            this.browser = browser;
            this.callback = callback || function () {};
            this.set('title', 'ENCODE search');
            this.set('content', this._dialogContent());
            this.inherited(arguments);
            focus.focus(this.closeButtonNode);
        }

    });
});
