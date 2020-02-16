window.mediamanager = function(mediamanagerId, options, callback) {
	let mediamanager = null;
	let managerBackground = null;
	let managerContainer = null;
	let managerItems = null;
	let managerContent = null;
	let managerUploader = null;
	let managerHeader = null;
	let uploadBtn = null;
	let closeUploadBtn = null;
	let maximizeBtn = null;
	let insertBtn = null;
	let searchInput = null;
	let uploadInput = null;

	let fetchedFiles = [];
	let selectedFiles = [];
	let mediamanagerOptions = {
		allowMultipleSelections: false,
		filterExtensions: false,
    allowedExtensions: ["img", "jpg", "png"],
    fallbackSrc: "",
		fnUpload: null,
		fnDownload: null
	};

	const start = () => {
		mediamanager = document.getElementById(mediamanagerId);
		mediamanagerOptions = { ...mediamanagerOptions, ...options };

		if (mediamanager === null || mediamanager === undefined) {
			throw "file manager id not defined";
		}
    //bind file manager
    mediamanager.innerHTML = ""
		mediamanager.innerHTML += fileManagerComponent();

		bindElements();
		addListeners();
		updateMangerItems();
	};

	// manager functions
	const bindElements = () => {
		exitBtn = document.querySelector(`#${mediamanagerId} .exitbtn`);
		uploadBtn = document.querySelector(`#${mediamanagerId} .uploadbtn`);
		closeUploadBtn = document.querySelector(`#${mediamanagerId} .closeuploadbtn`);
		maximizeBtn = document.querySelector(`#${mediamanagerId} .maxbtn`);
		insertBtn = document.querySelector(`#${mediamanagerId} .insertbtn`);
		searchInput = document.querySelector(`#${mediamanagerId} .manager-searchinput`);
		uploadInput = document.querySelector(`#${mediamanagerId} .manager-uploadinput`);
		managerBackground = document.querySelector(
			`#${mediamanagerId} .manager-background`
		);
		managerContainer = document.querySelector(
			`#${mediamanagerId} .manager-container`
		);
		managerContent = document.querySelector(`#${mediamanagerId} .manager-content`);
		managerUploader = document.querySelector(`#${mediamanagerId} .manager-uploader`);
		managerHeader = document.querySelector(`#${mediamanagerId} .manager-header`);

		// Make the DIV element draggable:
		dragElement(managerBackground);

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
    managerContainer.addEventListener("click", clearSelection);

		uploadInput.addEventListener("change", function(e) {
			handleFileUpload(e.target.files);
		});

    Array.from(managerHeader.children).forEach((child)=>{
      child.addEventListener("mousedown", function(e){
        e.stopPropagation()
      });
    })
    
	};

	const showManager = () => {
		mediamanager.classList.remove("hidden");
	};

	const exitManager = () => {
		mediamanager.classList.add("hidden");
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
			fetchedFiles = await mediamanagerOptions.fnDownload();
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
			const type = file.type ? file.type : url ? getFileExtension(url) : null;

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
		managerItems = document.querySelectorAll(`#${mediamanagerId} .manager-item`);

		managerItems.forEach(item => {
			item.addEventListener("click", function(e) {
				e.stopPropagation();
				selectItem(this);
			});
		});
	};

	const selectItem = item => {
		if (!mediamanagerOptions.allowMultipleSelections) {
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
		if (!mediamanagerOptions.allowMultipleSelections) {
			const file = input[0];
			// send file to the custom uploader
			await mediamanagerOptions.fnUpload(file);
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

	// https://www.w3schools.com/howto/howto_js_draggable.asp
	function dragElement(elmnt) {
		var pos1 = 0,
			pos2 = 0,
			pos3 = 0,
			pos4 = 0;
		if (managerHeader) {
			// if present, the header is where you move the DIV from:
			managerHeader.onmousedown = dragMouseDown;
		} else {
			// otherwise, move the DIV from anywhere inside the DIV:
			elmnt.onmousedown = dragMouseDown;
		}

		function dragMouseDown(e) {
			e = e || window.event;
			e.preventDefault();
			// get the mouse cursor position at startup:
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeDragElement;
			// call a function whenever the cursor moves:
			document.onmousemove = elementDrag;
		}

		function elementDrag(e) {
			e = e || window.event;
			e.preventDefault();
			// calculate the new cursor position:
			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;
			// set the element's new position:
			elmnt.style.top = elmnt.offsetTop - pos2 + "px";
			elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
		}

		function closeDragElement() {
			// stop moving when mouse button is released:
			document.onmouseup = null;
			document.onmousemove = null;
		}
	}
	start();
	showManager();
};
