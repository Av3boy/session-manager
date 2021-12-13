/**
 * CSS to hide everything on the page,
 * except for elements that have the "beastify-image" class.
 */
const hidePage = 
`body > :not(.beastify-image) {
  display: none;
}`;

var selectedItems = [];
                  
function OpenSelected() {
  // TODO: Handle selected folders
  console.log(selectedItems);

  if (selectedItems.length > 0)
    browser.windows.create({url: selectedItems});

  else {
    
  }

  // Clear the selected items
  selectedItems = [];
}

function OpenItems() {
  // TODO: Not implemented
}

function DeleteSelected() {
  // TODO: Not implemented
}

function HasChildFolders(folder) {
  for (let index = 0; index < folder.children.length; index++) {
    
    if (folder.children[index].type === "folder")
      return true;
    
  }
}

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {

  // Get the popup
  var popup = document.getElementById("slide-1");
  
  // Get the bookmark list
  function getTree(bookmarkItems) {

    var header = document.getElementById("header");
    header.textContent = "Root";

    // NOTE: first is 0 index which is the root node
    // Add all the bookmark folders
    for (let i = 0; i < bookmarkItems[0].children.length; i++) {

      const element = bookmarkItems[0].children[i];
      console.log(element);

      var hasFolderChildren = HasChildFolders(element);

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

          if (hasFolderChildren)
            icon.classList.add("fas", "fa-folder"); // TODO: folders with child folders

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

      // TODO:
      // On click -> item has child folders

      /**
       * Open all the child bookmarks
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
              selectedItems.push(folder.children[index].url);

            if (folder.children[index].type === "folder")
            AddItemsToSelected(folder);
            
          }
        }
        
        AddItemsToSelected(element);

        OpenSelected();
      }

      /**
       * Open the selected bookmark
       * @param {event} e 
       */
      function bookmarkClick(e) {
        browser.windows.create({url: element.url});
      }

      // Add the functionality for the button
      if (element.type === "folder")
        node.addEventListener("click", folderClick);
    
      if (element.type === "bookmark")
        node.addEventListener("click", bookmarkClick);

      item.appendChild(icon);
      item.appendChild(checkbox);
      item.appendChild(node);
    
      // Add the new item to the popup
      popup.children[0].appendChild(item);
    }
    
  }
  
  function onRejected(error) {
    console.log(`An error: ${error}`);
  }
  
  var bookmarkTree = browser.bookmarks.getTree();
  bookmarkTree.then(getTree, onRejected);

  /*document.addEventListener("click", (e) => {

    /**
     * Given the name of a beast, get the URL to the corresponding image.
     *
    function beastNameToURL(beastName) {
      switch (beastName) {
        case "Frog":
          return browser.extension.getURL("beasts/frog.jpg");
        case "Snake":
          return browser.extension.getURL("beasts/snake.jpg");
        case "Turtle":
          return browser.extension.getURL("beasts/turtle.jpg");
      }
    }

    /**
     * Insert the page-hiding CSS into the active tab,
     * then get the beast URL and
     * send a "beastify" message to the content script in the active tab.
     *
    function beastify(tabs) {
      browser.tabs.insertCSS({code: hidePage}).then(() => {
        let url = beastNameToURL(e.target.textContent);
        browser.tabs.sendMessage(tabs[0].id, {
          command: "beastify",
          beastURL: url
        });
      });
    }

    /**
     * Remove the page-hiding CSS from the active tab,
     * send a "reset" message to the content script in the active tab.
     *
    function reset(tabs) {
      browser.tabs.removeCSS({code: hidePage}).then(() => {
        browser.tabs.sendMessage(tabs[0].id, {
          command: "reset",
        });
      });
    }

    /**
     * Just log the error to the console.
     *
    function reportError(error) {
      console.error(`Could not beastify: ${error}`);
    }

    if (e.target.textContent === "test")
    console.log("testi");

    /**
     * Get the active tab,
     * then call "beastify()" or "reset()" as appropriate.
     *
    if (e.target.classList.contains("beast")) {
      browser.tabs.query({active: true, currentWindow: true})
        .then(beastify)
        .catch(reportError);
    }
    else if (e.target.classList.contains("reset")) {
      browser.tabs.query({active: true, currentWindow: true})
        .then(reset)
        .catch(reportError);
    }
  });*/
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
