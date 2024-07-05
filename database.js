var db = firebase.firestore();

function fetchStudentsData() {
  var tableBody = document
    .getElementById("students-table")
    .getElementsByTagName("tbody")[0];
  db.collection("students")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        var student = doc.data();
        var row = tableBody.insertRow();

        row.insertCell(0).innerText = student.name;
        row.insertCell(1).innerText = student.department;
        row.insertCell(2).innerText = student.class;
        row.insertCell(3).innerText = student.division;
        row.insertCell(4).innerText = student.wordPower;
        row.insertCell(5).innerText = student.grammar;
        row.insertCell(6).innerText = student.writtenCommunication;
        row.insertCell(7).innerText = student.nonVerbal;
        row.insertCell(8).innerText = student.presentationSkills;
        row.insertCell(9).innerText = student.groupDiscussion;
        row.insertCell(10).innerText = student.interviewSkills;
        row.insertCell(11).innerText = student.quantitativeAptitude;
        row.insertCell(12).innerText = student.technicalAptitude;
      });
    })
    .catch((error) => {
      console.error("Error fetching student data: ", error);
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

window.onload = fetchStudentsData;
