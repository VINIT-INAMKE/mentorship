var db = firebase.firestore();

var studentId = new URLSearchParams(window.location.search).get("id");

db.collection("students")
  .doc(studentId)
  .get()
  .then((doc) => {
    if (doc.exists) {
      document.getElementById("name").value = doc.data().name;
      document.getElementById("department").value = doc.data().department;
      document.getElementById("class").value = doc.data().class;
      document.getElementById("division").value = doc.data().division;
      document.getElementById("wordPower").value = doc.data().wordPower;
      document.getElementById("grammar").value = doc.data().grammar;
      document.getElementById("writtenCommunication").value =
        doc.data().writtenCommunication;
      document.getElementById("nonVerbal").value = doc.data().nonVerbal;
      document.getElementById("presentationSkills").value =
        doc.data().presentationSkills;
      document.getElementById("groupDiscussion").value =
        doc.data().groupDiscussion;
      document.getElementById("interviewSkills").value =
        doc.data().interviewSkills;
      document.getElementById("quantitativeAptitude").value =
        doc.data().quantitativeAptitude;
      document.getElementById("technicalAptitude").value =
        doc.data().technicalAptitude;
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
  db.collection("students")
    .doc(studentId)
    .set({
      name: document.getElementById("name").value,
      department: document.getElementById("department").value,
      class: document.getElementById("class").value,
      division: document.getElementById("division").value,
      wordPower: document.getElementById("wordPower").value,
      grammar: document.getElementById("grammar").value,
      writtenCommunication: document.getElementById("writtenCommunication")
        .value,
      nonVerbal: document.getElementById("nonVerbal").value,
      presentationSkills: document.getElementById("presentationSkills").value,
      groupDiscussion: document.getElementById("groupDiscussion").value,
      interviewSkills: document.getElementById("interviewSkills").value,
      quantitativeAptitude: document.getElementById("quantitativeAptitude")
        .value,
      technicalAptitude: document.getElementById("technicalAptitude").value,
    })
    .then(() => {
      alert("Student details saved!");
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
