/**
 * Shows the modal with the given id
 * @param {string} id 
 */
function ShowModal(id) {
    
    var modal = document.getElementById(id);
    modal.style.display = "block";

    // Get the <span> element that closes the modal
    var span = modal.getElementsByClassName("close")[0];

    span.onclick = () =>
      modal.style.display = "none";

}

function HideModal(id) {
  var modal = document.getElementById(id);
  modal.style.display = "none";
}