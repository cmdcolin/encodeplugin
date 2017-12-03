define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/Deferred',
    'dijit/MenuItem',
    'JBrowse/Plugin',
    './View/ENCODEDialog'
],
function (
    declare,
    lang,
    Deferred,
    MenuItem,
    JBrowsePlugin,
    ENCODEDialog
) {
    return declare(JBrowsePlugin, {
        constructor: function () {
            this.browser.afterMilestone('initView', function () {
                this.browser.addGlobalMenuItem('file', new MenuItem(
                    {
                        label: 'ENCODE track browser',
                        onClick: lang.hitch(this, 'createSearchTrack')
                    }));
            }, this);
        },

        createSearchTrack: function () {
            var searchDialog = new ENCODEDialog();
            searchDialog.show(this.browser,
                function () {

                });
        }
    });
});
