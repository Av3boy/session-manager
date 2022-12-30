# Session Manager

## Introdution

This firefox extension has been built on top of this example
https://github.com/mdn/webextensions-examples/tree/master/beastify

Product site:
https://addons.mozilla.org/en-US/firefox/addon/session-manager/

## What it does ##

Clicking a folder opens all the direct child bookmarks it has.
If however the folder has no child bookmarks, the folder shows it's child folders.

Clicking a bookmark opens that bookmark in a new tab.

The "Open selected(s)" button opens all the selected bookmarks in a new window. Opens selected folders' direct child bookmarks.   
The "Open recursively" button opens all the bookmarks in a new window per folder.  
The "Delete item(s)" is an destructive operation. It will remove all the selected bookmarks and deletes all the folders recursively.

## TODO

CICD can be implemented using the signing api
https://addons-server.readthedocs.io/en/latest/topics/api/signing.html

## Compability

https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/bookmarks/BookmarkTreeNode
