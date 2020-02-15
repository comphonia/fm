const fm = function(fmId, options, callback) {
  let fm = null;
  let managerBackground = null;
  let managerContainer = null;
  let managerItems = null;
  let managerContent = null;
  let managerUploader = null;
  let uploadBtn = null;
  let closeUploadBtn = null;
  let maximizeBtn = null;
  let insertBtn = null;
  let searchInput = null;
  let uploadInput = null;

  let fetchedFiles = [];
  let selectedFiles = [];
  let fmOptions = {
    allowMultipleSelections: false,
    filterExtensions: false,
    allowedExtensions: ["img", "jpg", "png"],
    fnUpload: null,
    fnDownload: null
  };

  document.addEventListener("DOMContentLoaded", e => {
    start();
  });

  const start = () => {
    fm = document.getElementById(fmId);
    fmOptions = { ...fmOptions, ...options };

    if (fm === null || fm === undefined) {
      throw "file manager id not defined";
    }
    //bind file manager
    fm.innerHTML += fileManagerComponent();

    bindElements();
    addListeners();
    updateMangerItems();
  };

  // manager functions
  const bindElements = () => {
    exitBtn = document.querySelector(`#${fmId} .exitbtn`);
    uploadBtn = document.querySelector(`#${fmId} .uploadbtn`);
    closeUploadBtn = document.querySelector(`#${fmId} .closeuploadbtn`);
    maximizeBtn = document.querySelector(`#${fmId} .maxbtn`);
    insertBtn = document.querySelector(`#${fmId} .insertbtn`);
    searchInput = document.querySelector(`#${fmId} .manager-searchinput`);
    uploadInput = document.querySelector(`#${fmId} .manager-uploadinput`);
    managerBackground = document.querySelector(`#${fmId} .manager-background`);
    managerContainer = document.querySelector(`#${fmId} .manager-container`);
    managerContent = document.querySelector(`#${fmId} .manager-content`);
    managerUploader = document.querySelector(`#${fmId} .manager-uploader`);

    maximizeBtn.innerHTML = maximizeButtonComponent();
    uploadBtn.innerHTML = uploadButtonComponent();
    closeUploadBtn.innerHTML = closeButtonComponent();
    exitBtn.innerHTML = exitButtonComponent();
  };

  const addListeners = () => {
    exitBtn.addEventListener("click", exitManager);
    insertBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      insertFiles();
    });
    maximizeBtn.addEventListener("click", maximizeManager);
    uploadBtn.addEventListener("click", toggleUploader);
    closeUploadBtn.addEventListener("click", toggleUploader);
    searchInput.addEventListener("keyup", searchFiles);
    uploadInput.addEventListener("change", function(e) {
      handleFileUpload(e.target.files);
    });
    managerContainer.addEventListener("click", clearSelection);
  };

  const exitManager = () => {
    fm.classList.add("hidden");
  };

  let isMaximized = false;
  const maximizeManager = () => {
    isMaximized = !isMaximized;
    managerBackground.classList.toggle("maximize");
    if (isMaximized) {
      maximizeBtn.innerHTML = minimizeButtonComponent();
    } else {
      maximizeBtn.innerHTML = maximizeButtonComponent();
    }
  };

  let isUploadView = false;
  const toggleUploader = () => {
    isUploadView = !isUploadView;
    managerUploader.classList.toggle("hidden");
    if (isUploadView) {
      uploadBtn.innerHTML = closeButtonComponent();
    } else {
      uploadBtn.innerHTML = uploadButtonComponent();
    }
  };

  // file interface
  const updateMangerItems = async localFiles => {
    // fetch files
    let files = [];
    if (!localFiles) {
      fetchedFiles = await fmOptions.fnDownload();
      files = fetchedFiles;
    } else {
      files = localFiles;
    }
    // append to DOM
    managerContent.innerHTML = "";
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = "managerItem" + i;
      const url = file.url ? tagStripper(file.url) : null;
      const src = file.src ? tagStripper(file.src) : null;
      const name = file.name ? tagStripper(file.name) : null;
      const type = url ? getFileExtension(url) : null;

      if (checkIsNullOrUndefinedOrEmpty(url)) {
        throw "a url property if required for files.";
      }

      managerContent.innerHTML += managerItemComponent(
        id,
        url,
        src,
        name,
        type
      );
    }
    // add listener to items
    managerItems = document.querySelectorAll(`#${fmId} .manager-item`);

    managerItems.forEach(item => {
      item.addEventListener("click", function(e) {
        e.stopPropagation();
        selectItem(this);
      });
    });
  };

  const selectItem = item => {
    if (!fmOptions.allowMultipleSelections) {
      managerItems.forEach(item => {
        item.classList.remove("selected");
      });
      item.classList.add("selected");
      selectedFiles[0] = {
        id: item.getAttribute("data-fileId"),
        url: item.getAttribute("data-fileUrl")
      };
    }

    insertBtn.classList.remove("hidden");
  };

  const clearSelection = e => {
    if (e.currentTarget) {
      managerItems.forEach(item => {
        item.classList.remove("selected");
      });
      selectedFiles = [];
      insertBtn.classList.add("hidden");
    }
  };

  const searchFiles = e => {
    const query = e.target.value;
    if (checkIsNullOrUndefinedOrEmpty(query)) {
      updateMangerItems(fetchedFiles);
    }
    let filteredFiles = fetchedFiles.filter(file =>
      file.name.toLowerCase().includes(query.trim().toLowerCase())
    );
    updateMangerItems(filteredFiles);
  };

  const handleFileUpload = async input => {
    if (!fmOptions.allowMultipleSelections) {
      const file = input[0];
      // send file to the custom uploader
      await fmOptions.fnUpload(file);
      // close uploader when done & re-fetch files from the server
      toggleUploader();
      updateMangerItems();
    }
  };

  // send files to be inserted back to the editor
  const insertFiles = () => {
    // callback user-defined function
    callback(selectedFiles);
    exitManager();
  };

  // components
  const maximizeButtonComponent = () => {
    return `
      <span class="manager-icon"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg></span><span class="manager-btntext">Maximize</span>
      `;
  };
  const minimizeButtonComponent = () => {
    return `
      <span class="manager-icon"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg></span><span class="manager-btntext">Minimize</span>
      `;
  };
  const exitButtonComponent = () => {
    return `
      <span class="manager-icon"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span><span class="manager-btntext">Exit</span>
      `;
  };
  const closeButtonComponent = () => {
    return `
      <span class="manager-icon"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-grid"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg></span><span class="manager-btntext">Back</span>
      `;
  };
  const uploadButtonComponent = () => {
    return `
      <span class="manager-icon"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-upload">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg></span><span class="manager-btntext">Upload</span>
      `;
  };
  const managerItemComponent = (id, url, src, name, type) => {
    return ` 
      <div class="manager-item" data-fileId="${id}" data-fileUrl="${url}">
        <div class="manager-imgcontainer">
            <img src="${src}" />
        </div>
        <div class="manager-itemdetails">
            <small>${name}</small>
            <small>${type}</small>
        </div>
      </div>
      `;
  };

  const fileManagerComponent = () => {
    return `
      <div class="manager-background">
      <div class="manager-header">
          <div class="manager-headerfloatleft">
              <button class="manager-btn exitbtn"></button>
              <button class="manager-btn uploadbtn"></button>
              <button class="manager-btn maxbtn"> </button>
          </div>
          <div class="manager-headerfloatright">
              <input type="search" placeholder="search" class="manager-searchinput" />
          </div>
      </div>
      <div class="manager-container">
          <button class="manager-insertbtn insertbtn hidden">
              <span class="manager-icon"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-file-plus">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="12" y1="18" x2="12" y2="12"></line>
                      <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg></span>
              <span class="manager-btntext ">Insert File</span>
          </button>
          <div class="manager-uploader hidden">
              <div class="manager-uploadzone">
                  <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-upload">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <input type="file" class="manager-uploadinput"/>
                  <p>Click, or drop files here to upload</p>
                  <button class="closeuploadbtn" style="z-index: 2; padding: 5px;"></button>
              </div>
          </div>
          <div class="manager-content"></div>
      </div>
  </div>
      `;
  };

  // utilities
  const tagStripper = html => {
    return html.replace(/<\/?[^>]+(>|$)/g, "");
  };

  const getFileExtension = url => {
    const ext = url.match(/[0-9a-z]+$/i);
    return ext ? ext[0] : "";
  };

  const checkIsNullOrUndefinedOrEmpty = str => {
    if (
      str.trim() === null ||
      str.trim() === undefined ||
      str.trim().length <= 0
    ) {
      return true;
    }
    return false;
  };
};

/* demo */
let demo = (function() {
  fm("fm", { fnUpload: onUpload, fnDownload: onDownload }, onInsert);

  const file = {
    url: "https://cdn3.iconfinder.com/data/icons/generic-ui/64/Expand-512.png",
    src: "https://cdn3.iconfinder.com/data/icons/generic-ui/64/Expand-512.png",
    name: "file name"
  };

  let files = [
    {
      url:
        "https://cdn3.iconfinder.com/data/icons/generic-ui/64/Expand-512.png",
      src:
        "https://cdn3.iconfinder.com/data/icons/generic-ui/64/Expand-512.png",
      name: "abc"
    },
    {
      url:
        "https://cdn3.iconfinder.com/data/icons/generic-ui/64/Expand-512.png",
      src:
        "https://cdn3.iconfinder.com/data/icons/generic-ui/64/Expand-512.png",
      name: "def"
    },
    {
      url:
        "https://cdn3.iconfinder.com/data/icons/generic-ui/64/Expand-512.png",
      src:
        "https://cdn3.iconfinder.com/data/icons/generic-ui/64/Expand-512.png",
      name: "ghi"
    }
  ];

  // for (let i = 0; i < 10; i++) {
  //   files.push(file);
  // }

  /**
   * POST the file/files to the server. return a promise that resolves to null (or a url if you plan on extending it).
   *
   * @param {*} files
   * @returns {Promise<null>}
   */
  async function onUpload(files) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(files);
        resolve(null);
      }, 1000);
    });
  }
  /**
   * GET file/files to the server. return a promise that resolves to an array of JSON
   *
   * @returns {Promise<Object[]>}
   */
  async function onDownload() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(files);
      }, 1000);
    });
  }
  /**
   * callback that's called once files are selected and inserted / editor is closed
   * generate markup for a content editor using the returned file(s)
   *
   * @param {*} files
   */
  function onInsert(files) {
    console.log(`<img src=${files[0].url} />`);
  }
})();
