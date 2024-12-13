setTimeout(function () {
    var newDiv = document.createElement("div");
    newDiv.textContent = "test";
    document.body.appendChild(newDiv);
    window.alert("test");
}, 1000);
