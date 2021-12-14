/**
 * CSS to hide everything on the page,
 * except for elements that have the "beastify-image" class.
 */
const hidePage = 
`body > :not(.beastify-image) {
  display: none;
}`;

var previousSlide = 1;
var currentSlide = 1;
var selectedItems = [];

/**
 * 
 * @param {number} slide 
 */
function ChangeSlide(slide) {

  // Handle slide change
  previousSlide = currentSlide;
  currentSlide = slide;

  var back = document.getElementById("back");
  back.href = "#slide-" + currentSlide;

  if (currentSlide === 1) 
    back.classList.add("hidden");
  else 
    back.classList.remove("hidden");
}

/**
 * Empties the selected items.
 */
function ClearSelectedItems() {
    selectedItems = [];
}
                  
function OpenSelected() {
  // TODO: Handle selected folders
  console.log(selectedItems);

  // TODO:
  // change selected items from holding url strings to hold the actual objects
  // this way we have more control over what needs to be done when something is selected
  if (selectedItems.length > 0)
    browser.windows.create({url: selectedItems});

  else {
    
  }

  // Clean up items
  ClearSelectedItems();
}

/**
 * 
 */
function OpenItems() {
  // TODO: Not implemented
}

/**
 * Destructive operation. \n
 * Removes all the selected bookmarks and deletes all the folders recursively.
 */
function DeleteSelected() {

  for (let index = 0; index < selectedItems.length; index++) {

    // Remove a bookmark
    if (selectedItems[index].type === "bookmark")
      browser.bookmarks.remove(selectedItems[index].id);
    
    // Recursively deletes a folder and all it's contents 
    else if (selectedItems[index].type === "folder")
      browser.bookmarks.removeTree(selectedItems[index].id);

    // else
    // TODO: Handle type error
    
  }

}

/**
 * Looks for child of the given type in direct children 
 * @param {bookmarks.BookmarkTreeNode} folder 
 * @param {string} type 
 * @returns 
 */
function HasChildrenOfType(folder, type) {
  for (let index = 0; index < folder.children.length; index++) {
    
    if (folder.children[index].type === type)
      return true;
  }

  return false;
}

/**
 * Listens for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {

  // As with JSON, use the Fetch API & ES6
  fetch('../.env')
  .then(response => response.text())
  .then(data => {
  	
    var integrity = data.split("=");

  	var fontAwesome = document.getElementById("fontawesome");
    fontAwesome.integrity = integrity;
  });

  // Get the popup
  var popup = document.getElementById("popup-content");
  console.log(document);
  
  // Get the bookmark list
  function getTree(bookmarkItems) {

    var header = document.getElementById("header");
    header.textContent = "Current Folder: Root";

    // NOTE: first is 0 index which is the root node
    // Add all the bookmark folders
    for (let i = 0; i < bookmarkItems[0].children.length; i++) {

      const element = bookmarkItems[0].children[i];
      console.log(element);

      var hasFolderChildren = HasChildrenOfType(element, "folder");
      var hasBookmarkChildren = HasChildrenOfType(element, "bookmark");

      // New poup item
      const item = document.createElement("div");
      item.classList.add("grid-item");

      // Icon
      const icon = document.createElement("i");

      switch (element.type) {
        case "bookmark":
          icon.classList.add("fas", "fa-bookmark");
          break;

        case "folder":
          // TODO: folders with bookmarks,

          if (element.children.length <= 0)
            icon.classList.add("fas", "fa-folder"); // TODO: Handle empty folders

          else if (hasFolderChildren)
            icon.classList.add("fas", "fa-folder"); // TODO: folders with child folders

          else if (hasBookmarkChildren)
          icon.classList.add("fa", "fas-folder");

          else
            icon.classList.add("fas", "fa-folder");

          break;

        default:
          icon.classList.add("fas", "fa-question");
          icon.title = "Unable to detect item type";
          break;
      }

      // Checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.addEventListener("click", (e) => selectedItems.push(element));

      // TODO: Handle empty folders, folders with child folders, folders with bookmarks, bookmarks
      // Construct a popup node
      const node = document.createElement("a");    
      node.href = "#slide-2";
      node.classList.add("button", "beast");

      var textnode = document.createTextNode(element.title);
      node.appendChild(textnode);

      /**
       * Opens all the direct child bookmarks.
       * If a folder has no child bookmarks, shows child folders in new slide.
       * @param {event} e 
       */
      function folderClick(e) {
    
        // TODO:
        // element has children -> element is directory
        // element doesn't have children -> element.url 
        // set header as folder name

        /**
         * Recursively adds all the folders into the pool
         * @param {*} folder 
         */
        function AddItemsToSelected(folder) {
          for (let index = 0; index < folder.children.length; index++) {
            if (folder.children[index].type === "bookmark")
              selectedItems.push(folder.children[index]);

            if (folder.children[index].type === "folder")
            AddItemsToSelected(folder);
            
          }
        }
        
        AddItemsToSelected(element);

        OpenSelected();
      }

      // Add the functionality for the button
      if (element.type === "folder")
        node.addEventListener("click", folderClick);
    
      // Opens selected bookmark in a new tab.
      if (element.type === "bookmark")
        node.addEventListener("click", (e) => browser.windows.create({url: element.url}));

      item.appendChild(icon);
      item.appendChild(checkbox);
      item.appendChild(node);
    
      // Add the new item to the popup
      popup.children[0].appendChild(item);
    }
    
  }
  
  /**
   * 
   * @param {string} error Error message containing information about the error that has occured
   */
  function onRejected(error) {
    var container = document.getElementById("error-content-container");
    container.textContent = error;
  }
  
  var bookmarkTree = browser.bookmarks.getTree();
  bookmarkTree.then(getTree, onRejected);

}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute beastify content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs.executeScript({file: "/content_scripts/beastify.js"})
.then(listenForClicks)
.catch(reportExecuteScriptError);
