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

/**
 * Selected items structure consists of folder objects which have their id's and children
 * Child bookmarks are stored in an string array.
 * @example [{folder: {id: 1, urls: ["", ""], folders: [{folder: {id: 2, urls: ["", ""]]}}]
 */
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

/**
 * 
 */
function OpenSelected() {
  console.log(selectedItems);

  // loop folder objects
  for (let i = 0; i < selectedItems.length; i++) {
    browser.windows.create({url: selectedItems[i].folder.urls});
  }

  // Clean up items
  ClearSelectedItems();
}

/**
 * 
 */
function OpenRecursive() {
  // TODO: Not implemented

  function Loop(folder) {
    for (let i = 0; i < folder.length; i++) {

      if (folder[i].folders.length > 0)
        Loop(folder);
        
    }
  }

  Loop(selectedItems);

  ClearSelectedItems();
}

/**
 * TODO: This needs to be fixed
 * Destructive operation. \n
 * Removes all the selected bookmarks and deletes all the folders recursively.
 */
function DeleteSelected() {

  for (let index = 0; index < selectedItems.length; index++) {

    // Remove a bookmark
    if (selectedItems[index].type === "bookmark")
      browser.bookmarks.remove(selectedItems[index].folder.urls.id); // TODO: fix this 
    
    // Recursively deletes a folder and all it's contents 
    else if (selectedItems[index].type === "folder")
      browser.bookmarks.removeTree(selectedItems[index].id);

    // else
    // TODO: Handle type error
    
  }

  ClearSelectedItems();
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
          if (element.children.length <= 0)
            icon.classList.add("fas", "fa-folder"); // TODO: Handle empty folders

          else if (hasFolderChildren)
            icon.classList.add("fas", "fa-folder"); // TODO: folders with child folders

          else if (hasBookmarkChildren)
            icon.classList.add("fa", "fas-folder"); // TODO: folders with bookmarks,

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
      checkbox.addEventListener("click", (e) => {   

        if (element.type === "bookmark")
          selectedItems.push({folder: selectedItems.length + 1, urls: [element.url]})

        if (element.type === "folder") // TODO:
          selectedItems.push({folder: selectedItems.length + 1, urls: []})
      });

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

        header.textContent = element.title;

        /**
         * Recursively adds all the folders into the pool
         * @param {*} folder
         * @param {number} id
         */
        function AddItemsToSelected(folder, id) {

          var returnValue = {folder: id + 1, urls: [], folders: []};

          for (let index = 0; index < folder.children.length; index++) {

            // TODO: Handle adding items to the selected items
            
            if (folder.children[index].type === "bookmark")
              returnValue.urls.push(folder.children[index].url);

            if (folder.children[index].type === "folder")
              returnValue.folders.push(AddItemsToSelected(folder, id + 1));
            
          }

          return returnValue;
        }
        
        selectedItems.push(AddItemsToSelected(element, selectedItems.length));
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
 * Add basic funtionality for all the buttons
 */
function Init() {
  var buttonSelected = document.getElementById("buttonSelected");
  buttonSelected.addEventListener("click", () => OpenSelected());

  var buttonRecursive = document.getElementById("buttonRecursive");
  buttonRecursive.addEventListener("click", () => OpenRecursive());

  var buttonDelete = document.getElementById("buttonDelete");
  buttonDelete.addEventListener("click", () => ShowModal('deleteConfirmation'));

  SetModalFunctions();

  // As with JSON, use the Fetch API & ES6
  fetch('../.env')
  .then(response => response.text())
  .then(data => {
  	
    var integrity = data.split("=");

  	var fontAwesome = document.getElementById("fontawesome");
    fontAwesome.integrity = integrity;
  });
}

Init();
listenForClicks();