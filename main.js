firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    var db = firebase.firestore();
    db.collection("students")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          var student = doc.data();
          var card = document.createElement("div");
          card.className = "student-card";

          var img = document.createElement("img");
          img.src = student.imageURL || "default-image-url"; // Replace with a default image URL
          img.alt = student.name;

          var name = document.createElement("h3");
          name.textContent = student.name;

          var department = document.createElement("p");
          department.textContent = "Department: " + student.department;

          var studentClass = document.createElement("p");
          studentClass.textContent = "Class: " + student.class;

          var division = document.createElement("p");
          division.textContent = "Division: " + student.division;

          card.appendChild(img);
          card.appendChild(name);
          card.appendChild(department);
          card.appendChild(studentClass);
          card.appendChild(division);

          card.setAttribute("data-id", doc.id);
          card.onclick = function () {
            window.location.href = "student.html?id=" + doc.id;
          };

          document.getElementById("student-list").appendChild(card);
        });
      });
  } else {
    window.location.href = "index.html";
  }
});

function addStudent() {
  var db = firebase.firestore();
  db.collection("students")
    .add({
      name: "New Student",
      imageURL: "", // Placeholder for the image URL
      department: "",
      class: "",
      division: "",
      wordPower: "",
      grammar: "",
      writtenCommunication: "",
      nonVerbal: "",
      presentationSkills: "",
      groupDiscussion: "",
      interviewSkills: "",
      quantitativeAptitude: "",
      technicalAptitude: "",
    })
    .then((docRef) => {
      window.location.href = "student.html?id=" + docRef.id;
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
