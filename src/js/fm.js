const fm = function(fmId, options) {
  let fm = null;
  let managerBackground = null;
  let managerContainer = null;
  let managerContent = null;
  let managerUploader = null;
  let uploadBtn = null;
  let closeUploadBtn = null;
  let maximizeBtn = null;
  let insertBtn = null;
  let searchInput = null;

  let files = [];
  let selectedFiles = [];
  let fmOptions = {
    allowMultipleSelections: false,
    verifyExtensions: false,
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
      return;
    }

    bindElements();
    addListeners();
    updateMangerItems();
  };

  // manager functions
  const bindElements = () => {
    uploadBtn = document.querySelector(`#${fmId} .uploadbtn`);
    closeUploadBtn = document.querySelector(`#${fmId} .closeuploadbtn`);
    maximizeBtn = document.querySelector(`#${fmId} .maxbtn`);
    insertBtn = document.querySelector(`#${fmId} .insertbtn`);
    searchInput = document.querySelector(`#${fmId} .searchinput`);
    managerBackground = document.querySelector(`#${fmId} .manager-background`);
    managerContainer = document.querySelector(`#${fmId} .manager-container`);
    managerContent = document.querySelector(`#${fmId} .manager-content`);
    managerUploader = document.querySelector(`#${fmId} .manager-uploader`);

    maximizeBtn.innerHTML = maximizeButtonComponent();
    uploadBtn.innerHTML = uploadButtonComponent();
  };

  const addListeners = () => {
    maximizeBtn.addEventListener("click", maximizeManager);
    uploadBtn.addEventListener("click", toggleUploader);
    closeUploadBtn.addEventListener("click", toggleUploader);
    searchInput.addEventListener("keyup", searchFiles);
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
  const searchFiles = e => {
    console.log(e.target.value);
  };

  const updateMangerItems = async () => {
    // fetch files
    files = await options.fnDownload();
    // append to DOM
    managerContent.innerHTML = "";
    for (let i = 0; i < files.length; i++) {
      let id = "managerItem" + i;
      let url = file.url ? tagStripper(file.url) : null;
      let src = file.src ? tagStripper(file.src) : null;
      let name = file.name ? tagStripper(file.name) : null;
      let type = url ? getFileExtension(url) : null;

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
    let managerItems = document.querySelectorAll(`#${fmId} .manager-item`);
    
    managerItems.forEach(item => {
      item.addEventListener('click',function(){
        console.log('id -', this.getAttribute('data-fileId'))
        console.log('url -', this.getAttribute('data-fileUrl'))
      })
    });

  };

  // components
  const maximizeButtonComponent = () => {
    return `
    <span class="manager-icon"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg></span><span>Maximize</span>
    `;
  };
  const minimizeButtonComponent = () => {
    return `
    <span class="manager-icon"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg></span><span>Minimize</span>
    `;
  };
  const closeButtonComponent = () => {
    return `
    <span class="manager-icon"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></span><span>Close</span>
    `;
  };
  const uploadButtonComponent = () => {
    return `
    <span class="manager-icon"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-upload">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg></span><span>Upload</span>
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

  // utilities
  const tagStripper = html => {
    return html.replace(/<\/?[^>]+(>|$)/g, "");
  };

  const getFileExtension = url => {
    return url.match(/\.[0-9a-z]+$/i)[0];
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

fm("fm", { fnUpload: onUpload, fnDownload: onDownload });

/* demo */

const file = {
  url: "https://cdn3.iconfinder.com/data/icons/generic-ui/64/Expand-512.png",
  src: "https://cdn3.iconfinder.com/data/icons/generic-ui/64/Expand-512.png",
  name: "file name"
};

let files = [];

for (let i = 0; i < 10; i++) {
  files.push(file);
}

/**
 * POST the file/files to the server. return a promise that resolves to null (or a url if you plan on extending it).
 *
 * @param {*} file
 * @returns {Promise<null>}
 */
async function onUpload(file) {
  return new Promise((resolve, reject) => {});
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
