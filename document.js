document.addEventListener("DOMContentLoaded", function () {
  const storage = firebase.storage();
  const storageRef = storage.ref();
  const fileListContainer = document.getElementById("fileList");
  const backButton = document.getElementById("backButton");
  const refreshButton = document.getElementById("refreshButton");
  const currentPathSpan = document.getElementById("currentPath");
  let currentPath = "";

  function updateFileList(prefix) {
    fileListContainer.innerHTML = ""; // Clear current list
    listAllFilesAndFolders(prefix);
    currentPathSpan.textContent = prefix || "/";
  }

  function listAllFilesAndFolders(prefix = "") {
    const listRef = storageRef.child(prefix);

    listRef
      .listAll()
      .then(function (result) {
        if (result.prefixes.length === 0 && result.items.length === 0) {
          fileListContainer.innerHTML = "<p>No files or folders found.</p>";
        }

        // List folders
        result.prefixes.forEach(function (folderRef) {
          const folderItem = document.createElement("div");
          folderItem.classList.add("folder-item");
          const folderName = document.createElement("span");
          folderName.textContent = folderRef.name;
          folderName.classList.add("folder-name");
          folderName.onclick = function () {
            currentPath = folderRef.fullPath;
            updateFileList(currentPath);
            backButton.disabled = false;
          };
          folderItem.appendChild(folderName);
          fileListContainer.appendChild(folderItem);
        });

        // List files
        result.items.forEach(function (fileRef) {
          fileRef
            .getDownloadURL()
            .then(function (url) {
              const fileItem = document.createElement("div");
              fileItem.classList.add("file-item");
              const fileName = document.createElement("span");
              fileName.textContent = fileRef.name;
              const downloadLink = document.createElement("a");
              downloadLink.href = url;
              downloadLink.classList.add("download-link");
              downloadLink.setAttribute("target", "_blank"); // Open link in new tab
              downloadLink.innerHTML = '<i class="fas fa-download"></i>';
              downloadLink.download = fileRef.name; // Set download attribute with the filename

              fileItem.appendChild(fileName);
              fileItem.appendChild(downloadLink);
              fileListContainer.appendChild(fileItem);
            })
            .catch(function (error) {
              console.error("Error getting download URL: ", error);
            });
        });
      })
      .catch(function (error) {
        console.error("Error listing files: ", error);
        fileListContainer.innerHTML = "<p>Error fetching files.</p>";
      });
  }

  backButton.onclick = function () {
    const pathParts = currentPath.split("/").filter(Boolean);
    pathParts.pop(); // Go up one level
    currentPath = pathParts.join("/");
    updateFileList(currentPath);
    if (!currentPath) {
      backButton.disabled = true;
    }
  };
  refreshButton.onclick = function () {
    location.reload();
  };

  // Initial call to list files and folders at the root level
  updateFileList(currentPath);
});
function navigateTo(page) {
  window.location.href = page;
}
