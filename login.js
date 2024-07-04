function login() {
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      window.location.href = "main.html";
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
}
