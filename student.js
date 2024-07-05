var db = firebase.firestore();
var storage = firebase.storage();
var studentId = new URLSearchParams(window.location.search).get("id");

// Initialize FilePond for profile image
FilePond.registerPlugin(
  FilePondPluginFileValidateType,
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginImageCrop,
  FilePondPluginImageResize,
  FilePondPluginImageTransform,
  FilePondPluginImageEdit
);
const imageInputElement = document.querySelector('input[id="image"]');
const imagePond = FilePond.create(imageInputElement, {
  acceptedFileTypes: ["image/*"],
  labelIdle: `Drag & Drop your picture or <span class="filepond--label-action">Browse</span>`,
  imagePreviewHeight: 140,
  imageCropAspectRatio: "1:1",
  imageResizeTargetWidth: 0,
  imageResizeTargetHeight: 0,
  stylePanelLayout: "circle",
  styleLoadIndicatorPosition: "center bottom",
  styleProgressIndicatorPosition: "right bottom",
  styleButtonRemoveItemPosition: "left bottom",
  styleButtonProcessItemPosition: "right bottom",
});

// Initialize FilePond for documents
const filePonds = {};
const fields = [
  "wordPowerFiles",
  "grammarFiles",
  "writtenCommunicationFiles",
  "nonVerbalFiles",
  "presentationSkillsFiles",
  "groupDiscussionFiles",
  "interviewSkillsFiles",
  "quantitativeAptitudeFiles",
  "technicalAptitudeFiles",
];

fields.forEach((field) => {
  const inputElement = document.querySelector(`input[id="${field}"]`);
  filePonds[field] = FilePond.create(inputElement, {
    allowMultiple: true,
  });
});

db.collection("students")
  .doc(studentId)
  .get()
  .then((doc) => {
    if (doc.exists) {
      var student = doc.data();
      document.getElementById("name").value = student.name;
      document.getElementById("department").value = student.department;
      document.getElementById("class").value = student.class;
      document.getElementById("division").value = student.division;
      document.getElementById("wordPower").value = "";
      document.getElementById("grammar").value = "";
      document.getElementById("writtenCommunication").value = "";
      document.getElementById("nonVerbal").value = "";
      document.getElementById("presentationSkills").value = "";
      document.getElementById("groupDiscussion").value = "";
      document.getElementById("interviewSkills").value = "";
      document.getElementById("quantitativeAptitude").value = "";
      document.getElementById("technicalAptitude").value = "";
    }
  });

function deleteStudent() {
  if (confirm("Are you sure you want to delete this student?")) {
    db.collection("students")
      .doc(studentId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          var student = doc.data();
          var promises = [];

          // Delete profile image
          if (student.imageURL) {
            var oldImageRef = storage.refFromURL(student.imageURL);
            promises.push(oldImageRef.delete());
          }

          // Delete all documents
          fields.forEach((field) => {
            if (student[field] && Array.isArray(student[field])) {
              student[field].forEach((url) => {
                var fileRef = storage.refFromURL(url);
                promises.push(fileRef.delete());
              });
            }
          });

          // Wait for all deletions to complete
          Promise.all(promises)
            .then(() => {
              // Delete student record from Firestore
              db.collection("students")
                .doc(studentId)
                .delete()
                .then(() => {
                  alert("Student record and files deleted successfully!");
                  window.location.href = "main.html";
                })
                .catch((error) => {
                  console.error("Error removing student: ", error);
                  alert("Error: Failed to delete student record.");
                });
            })
            .catch((error) => {
              console.error("Error deleting files: ", error);
              alert("Error: Failed to delete all associated files.");
            });
        } else {
          alert("Student record not found.");
        }
      })
      .catch((error) => {
        console.error("Error fetching student data: ", error);
        alert("Error: Failed to fetch student data.");
      });
  }
}

function saveStudent() {
  db.collection("students")
    .doc(studentId)
    .get()
    .then((doc) => {
      var studentData = doc.exists ? doc.data() : {};
      var now = new Date();
      var formattedDate = `[${now.toLocaleDateString("en-GB")}]`;
      var formattedTime = `[${now.toLocaleTimeString("en-US")}]`;

      var updatedData = {
        name: document.getElementById("name").value,
        department: document.getElementById("department").value,
        class: document.getElementById("class").value,
        division: document.getElementById("division").value,
      };

      var fieldsToUpdate = [
        { id: "wordPower", field: "wordPower" },
        { id: "grammar", field: "grammar" },
        { id: "writtenCommunication", field: "writtenCommunication" },
        { id: "nonVerbal", field: "nonVerbal" },
        { id: "presentationSkills", field: "presentationSkills" },
        { id: "groupDiscussion", field: "groupDiscussion" },
        { id: "interviewSkills", field: "interviewSkills" },
        { id: "quantitativeAptitude", field: "quantitativeAptitude" },
        { id: "technicalAptitude", field: "technicalAptitude" },
      ];

      fieldsToUpdate.forEach((item) => {
        var value = document.getElementById(item.id).value;
        if (value.trim() !== "") {
          updatedData[item.field] =
            (studentData[item.field] || "") +
            `${formattedDate} ${formattedTime} ${value}\n`;
        } else {
          updatedData[item.field] = studentData[item.field] || "";
        }
      });

      db.collection("students")
        .doc(studentId)
        .set(updatedData)
        .then(() => {
          alert("Student details saved!");
        });
    });
}

function submitFiles() {
  var storageRef = storage.ref();
  var studentName = document.getElementById("name").value;

  var imageFiles = imagePond.getFiles();
  if (imageFiles.length > 0) {
    var image = imageFiles[0].file;
    var imageRef = storageRef.child(`images/${studentName}/profile_image.jpg`);

    // Check if there's an existing image
    db.collection("students")
      .doc(studentId)
      .get()
      .then((doc) => {
        if (doc.exists && doc.data().imageURL) {
          var oldImageRef = storage.refFromURL(doc.data().imageURL);
          oldImageRef
            .delete()
            .then(() => {
              uploadNewImage(image, imageRef);
            })
            .catch((error) => {
              console.error("Error removing old image: ", error);
              uploadNewImage(image, imageRef);
            });
        } else {
          uploadNewImage(image, imageRef);
        }
      });
  }

  fields.forEach((field) => {
    var filePondInstance = filePonds[field];
    var files = filePondInstance.getFiles();
    if (files.length > 0) {
      files.forEach((fileItem) => {
        var file = fileItem.file;
        var fileRef = storage
          .ref()
          .child(`documents/${studentName}/${field}/${file.name}`);
        fileRef.put(file).then(() => {
          fileRef.getDownloadURL().then((url) => {
            var updateData = {};
            updateData[field] = firebase.firestore.FieldValue.arrayUnion(url);
            db.collection("students").doc(studentId).update(updateData);
          });
        });
      });
    }
  });

  alert("Files submitted!");
}

function uploadNewImage(image, imageRef) {
  imageRef.put(image).then(() => {
    imageRef.getDownloadURL().then((url) => {
      db.collection("students").doc(studentId).update({ imageURL: url });
    });
  });
}

function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
}

function navigateTo(page) {
  window.location.href = page;
}
