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
 * @example [
 *  {id: 1, urls: ["", ""], folders: [{folder: {id: 2, urls: ["", ""]] },
 *  {id: 3, urls: ["", ""], folders: [{folder: {id: 4, urls: ["", ""]] }
 * ]
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
  else {
    document.getElementById('slide-' + currentSlide).click();
    back.classList.remove("hidden");
  }

}

/**
 * Empties the selected items.
 */
function ClearSelectedItems() {
    selectedItems = [];
}

/**
 * Opens all the direct child bookmarks.
 * If a folder has no child bookmarks, shows child folders in new slide.
 * 
 * For more information, see {@link folderClick()}
 */
function OpenSelected() {
  console.log(selectedItems);

  if (selectedItems[0].folders.length > 0)
    ChangeSlide(2); // TODO: ?

  // loop folder objects
  for (let i = 0; i < selectedItems.length; i++) {
      console.log(selectedItems[i].urls);
      browser.windows.create({url: selectedItems[i].urls});
  }

  // Clean up items
  ClearSelectedItems();
} 

/**
 * Opens all the bookmarks in a new window per folder.  
 */
function OpenRecursive() {

  /**
   * Opens all the child bookmarks of the looping folder and continues to it's possible child folders
   * @param {*} folder 
   */
  function Loop(folder) {
    for (let i = 0; i < folder.length; i++) {

      // Open bookmarks in this folder
      browser.windows.create({url: folder[i].urls});

      // Loop the current folder's children
      if (folder[i].folders.length > 0)
        Loop(folder[i].folders);
        
    }
  }

  Loop(selectedItems);  // Start looping from the root of the selected items
  ClearSelectedItems(); // Operation finished, clear the selected items
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
      browser.bookmarks.remove(selectedItems[index].folder.urls.id); // TODO: fix this by adding an id to the url's  
    
    // Recursively deletes a folder and all it's contents 
    else if (selectedItems[index].type === "folder")
      browser.bookmarks.removeTree(selectedItems[index].id);

    // else
    // TODO: Handle type error
    
  }

  ClearSelectedItems(); // Operation finished, clear the selected items
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
 * Check for a valid url
 * For more info on url validity
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows/create
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL
 * @param {string} url 
 * @returns 
 */
function IsValidURL(url) {
  try {
    // creating a URL object from the given url stirng will throw an error
    const check = new URL(url);

    // Make sure the url is not a firefox configuration page
    if (check.protocol === "about:")
      return false;

    return true;
  }
  catch (error) {
    return false;
  }
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
            icon.classList.add("fas", "fa-folder"); // TODO: folders with bookmarks,

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

        var returnValue = {folder: selectedItems.length + 1, urls: [], folders: []}; 

        if (element.type === "bookmark" && IsValidURL(element.url))
        returnValue.urls.push(element.url)

        if (element.type === "folder") // TODO:
          returnValue.folders.push(element)

        selectedItems.push(returnValue);
      });

      // TODO: Handle empty folders, folders with child folders, folders with bookmarks, bookmarks
      // Construct a popup node
      const node = document.createElement("a");    
      node.href = "#slide-2";

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
            
            if (folder.children[index].type === "bookmark" && IsValidURL(folder.children[index].url))
              returnValue.urls.push(folder.children[index].url);

            if (folder.children[index].type === "folder") {}
              //returnValue.folders.push(AddItemsToSelected(folder, id + 1));
            
          }

          return returnValue;
        }
        
        // Recursively add all the child folders
        selectedItems.push(AddItemsToSelected(element, selectedItems.length));
        OpenSelected();
      }

      item.appendChild(icon);
      item.appendChild(checkbox);
      item.appendChild(node);

      // Add the functionality for the button
      if (element.type === "folder") {
        node.addEventListener("click", folderClick);

        const arrow = document.createElement("a");
        arrow.classList.add("fas", "fa-arrow-right");
        arrow.style.float = "right";

        item.appendChild(arrow);
      }    
      // Opens selected bookmark in a new tab.
      if (element.type === "bookmark" && IsValidURL(element.url))
        node.addEventListener("click", (e) => browser.windows.create({url: element.url}));
    
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

  var modalDelete = document.getElementById("modalDelete");
  modalDelete.addEventListener("click", (e) => DeleteSelected());

  var modalCancel = document.getElementById("modalCancel");
  modalCancel.addEventListener("click", (e) => HideModal("deleteConfirmation"));

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