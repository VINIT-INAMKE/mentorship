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
  stylePanelLayout: " circle",
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
      document.getElementById("wordPower").value = student.wordPower;
      document.getElementById("grammar").value = student.grammar;
      document.getElementById("writtenCommunication").value =
        student.writtenCommunication;
      document.getElementById("nonVerbal").value = student.nonVerbal;
      document.getElementById("presentationSkills").value =
        student.presentationSkills;
      document.getElementById("groupDiscussion").value =
        student.groupDiscussion;
      document.getElementById("interviewSkills").value =
        student.interviewSkills;
      document.getElementById("quantitativeAptitude").value =
        student.quantitativeAptitude;
      document.getElementById("technicalAptitude").value =
        student.technicalAptitude;
    }
  });

function deleteStudent() {
  if (confirm("Are you sure you want to delete this student?")) {
    db.collection("students")
      .doc(studentId)
      .delete()
      .then(() => {
        alert("Student record deleted successfully!");
        window.location.href = "main.html";
      })
      .catch((error) => {
        console.error("Error removing student: ", error);
        alert("Error: Failed to delete student record.");
      });
  }
}

function saveStudent() {
  var studentData = {
    name: document.getElementById("name").value,
    department: document.getElementById("department").value,
    class: document.getElementById("class").value,
    division: document.getElementById("division").value,
    wordPower: document.getElementById("wordPower").value,
    grammar: document.getElementById("grammar").value,
    writtenCommunication: document.getElementById("writtenCommunication").value,
    nonVerbal: document.getElementById("nonVerbal").value,
    presentationSkills: document.getElementById("presentationSkills").value,
    groupDiscussion: document.getElementById("groupDiscussion").value,
    interviewSkills: document.getElementById("interviewSkills").value,
    quantitativeAptitude: document.getElementById("quantitativeAptitude").value,
    technicalAptitude: document.getElementById("technicalAptitude").value,
  };

  db.collection("students")
    .doc(studentId)
    .set(studentData)
    .then(() => {
      alert("Student details saved!");
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
