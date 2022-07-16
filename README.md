# Session Manager

## Introdution

This firefox extension has been built on top of this example
https://github.com/mdn/webextensions-examples/tree/master/beastify

CICD can be implemented using the signing api
https://addons-server.readthedocs.io/en/latest/topics/api/signing.html

## What it does ##

Clicking a folder opens all the direct child bookmarks it has.
If however the folder has no child bookmarks, the folder shows it's child folders.

Clicking a bookmark opens that bookmark in a new tab.

The "Open selected(s)" button opens all the selected bookmarks in a new window. Opens selected folders' direct child bookmarks.   
The "Open recursively" button opens all the bookmarks in a new window per folder.  
The "Delete item(s)" is an destructive operation. It will remove all the selected bookmarks and deletes all the folders recursively.

Note that:

* if the user reloads the tab, or switches tabs, while the popup is open, then the popup won't be able to beastify the page any more (because the content script was injected into the original tab).

* by default [`tabs.executeScript()`](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/executeScript) injects the script only when the web page and its resources have finished loading. This means that clicks in the popup will have no effect until the page has finished loading.

* it's not possible to inject content scripts into certain pages, including privileged browser pages like "about:debugging" and the [addons.mozilla.org](https://addons.mozilla.org/) website. If the user clicks the beastify icon when such a page is loaded into the active tab, the popup displays an error message.

## What it shows ##

* write a browser action with a popup
* how to have different browser_action images based upon the theme
* give the popup style and behavior using CSS and JS
* inject a content script programmatically using `tabs.executeScript()`
* send a message from the main extension to a content script
* use web accessible resources to enable web pages to load packaged content
* reload web pages

## Compability

https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNode
