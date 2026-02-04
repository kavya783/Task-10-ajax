// Get containers for card and table views
const cardContainer = document.getElementById("cardContainer");
const tableBody = document.getElementById("tableBody");

// Variables to track editing, deleting, and image data
let editStudentId = null;
let deleteStudentId = null;
let img = "";

// Function to fetch all students using AJAX
function ajaxStudents() {
    $.ajax({
        url: "http://localhost:3000/studentdetails",
        method: "GET",
        success: function (data) {

            // Clear existing table and cards
            tableBody.innerHTML = "";
            cardContainer.innerHTML = "";

            // Loop through each student record
            data.forEach(stu => {

                // Add student row in table view
                tableBody.innerHTML += `
                <tr>
                    <td>
                        <img src="data:image/png;base64,${stu.image}" 
                             class="img-thumbnail"
                             style="width:100px;height:100px;object-fit:cover">
                    </td>
                    <td class="bg-info">${stu.name}</td>
                    <td class="bg-info">${stu.branch}</td>
                    <td class="bg-info">${stu.phone}</td>
                    <td>
                        <div class="d-flex justify-content-around">
                            <!-- View button -->
                            <button class="btn btn-primary btn-sm"
                                data-id="${stu.id}" data-action="view">
                                <i class="bi bi-eye"></i>
                            </button>

                            <!-- Edit button -->
                            <button class="btn btn-secondary btn-sm"
                                data-id="${stu.id}" data-action="edit">
                                <i class="bi bi-pencil-fill"></i>
                            </button>

                            <!-- Delete button -->
                            <button class="btn btn-danger btn-sm"
                                data-id="${stu.id}" data-action="delete">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;

                // Add student card layout (mobile view)
                cardContainer.innerHTML += `
                <div class="card mb-3 shadow-sm">
                    <div class="card-body bg-info text-center">
                        <img src="data:image/png;base64,${stu.image}" 
                             class="img-fluid rounded"
                             style="max-height:120px;object-fit:cover">

                        <p class="text-center pb-0 mb-1"><b>Name:</b> ${stu.name}</p>
                        <p  class="text-center mb-2"><b>Branch:</b> ${stu.branch}</p>
                        <p  class="text-center "><b>Phone:</b> ${stu.phone}</p>

                        <div class="d-flex justify-content-around">
                            <button class="btn btn-primary btn-sm"
                                data-id="${stu.id}" data-action="view">
                                <i class="bi bi-eye"></i>
                            </button>

                            <button class="btn btn-secondary btn-sm"
                                data-id="${stu.id}" data-action="edit">
                                <i class="bi bi-pencil-fill"></i>
                            </button>

                            <button class="btn btn-danger btn-sm"
                                data-id="${stu.id}" data-action="delete">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
            });
        }
    });
}

// Load students on page start
ajaxStudents();


// Handle image upload and convert to base64
$("#image").on("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    // Reset input value
    this.value = "";

    // Limit image size to 2MB
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
        alert("Image is too large! Max 2MB");
        return;
    }

    // Read image as base64
    const reader = new FileReader();
    reader.onload = function (e) {
        img = e.target.result.split(',')[1];
          console.log("Base64 part only:", img);
        // Preview image
        const preview = document.getElementById("previewImage");
        preview.src = "data:image/png;base64," + img;
        preview.style.display = "block";
    };

    reader.readAsDataURL(file);
});


// Add or Update Student
$(document).on("click", "#addStudentBtn", function () {

    const Name = $('#name').val().trim();
    const Branch = $('#branch').val().trim();
    const Phone = $('#phone').val().trim();

    // Error containers
    const nameError = document.getElementById("nameerror");
    const branchError = document.getElementById("brancherror");
    const phoneError = document.getElementById("phoneerror");
    const imageError = document.getElementById("imageerror");

    // Clear errors
    nameError.innerHTML = "";
    branchError.innerHTML = "";
    phoneError.innerHTML = "";
    imageError.innerHTML = "";

    // Name validation
    if (!/^[A-Z][a-z]{2,}$/.test(Name)) {
        nameError.innerHTML = "First name must start with capital & min 3 letters";
        return;
    }

    // Branch validation
    if (!/^[A-Z][a-z]{2,}$/.test(Branch)) {
        branchError.innerHTML = "First letter must start with capital & min 3 letters";
        return;
    }

    // Phone validation
    if (!/^[0-9]{10}$/.test(Phone)) {
        phoneError.innerHTML = "Enter valid 10 digit phone number";
        return;
    }

    // Image validation
    if (!img && editStudentId === null) {

        imageError.innerHTML = "Please select an image";
      
        return;
    }
     // Base64 approximate size check
  const approxSize = img.length * 0.75;
  const maxBytes = 2 * 1024 * 1024;

  if (approxSize > maxBytes) {
    alert("Selected image exceeds 2MB.");
    return;
  }
    // Default add request
    let url = "http://localhost:3000/studentdetails";
    let method = "POST";

    // Change to update request if editing
    if (editStudentId !== null) {
        url = `http://localhost:3000/studentdetails/${editStudentId}`;
        method = "PUT";
    }

    //Send Ajax request
    $.ajax({
        url: url,
        method: method,
        contentType: "application/json",
       data: JSON.stringify({
    name: Name,
    branch: Branch,
    phone: Phone,
    image: img || undefined
}),

        success: function () {
            ajaxStudents();

            // Close modal
            const modal = bootstrap.Modal.getInstance(
                document.getElementById("studentModal")
            );
            modal.hide();
        },
        error: function (err) {
            console.log("Error adding student:", err);
        }
    });
});


// Handle view/edit/delete button clicks
$(document).on("click", "button[data-action]", function () {

    const id = $(this).data("id");
    const action = $(this).data("action");

    // VIEW student
    if (action === "view") {
        $.get(`http://localhost:3000/studentdetails/${id}`, function (stu) {

            $("#viewModalBody").html(`
                <div class="text-center">
                    <img src="data:image/png;base64,${stu.image}" 
                         class="img-fluid rounded mb-2"
                         style="max-height:200px">
                    <h5>Name: ${stu.name}</h5>
                    <h6>Branch: ${stu.branch}</h6>
                    <h6>Phone: ${stu.phone}</h6>
                </div>
            `);

            new bootstrap.Modal(
                document.getElementById("viewStudentModal")
            ).show();
        });
    }

    //  EDIT Student
    if (action === "edit") {
        editStudentId = id;

        $.get(`http://localhost:3000/studentdetails/${id}`, function (stu) {

            $('#name').val(stu.name);
            $('#branch').val(stu.branch);
            $('#phone').val(stu.phone);

            img = stu.image;

            // Show Preview Image
            const preview = document.getElementById("previewImage");
            preview.src = "data:image/png;base64," + img;
            preview.style.display = "block";

            $('#addStudentBtn').text("Update Student");

            new bootstrap.Modal(
                document.getElementById("studentModal")
            ).show();
        });
    }

    //DELETE Student
    if (action === "delete") {
        deleteStudentId = id;

        new bootstrap.Modal(
            document.getElementById("deleteModal")
        ).show();
    }
});


// Confirm delete
$("#confirmDeleteBtn").click(function () {
    $.ajax({
        url: `http://localhost:3000/studentdetails/${deleteStudentId}`,
        type: "DELETE",
        success: function () {
            ajaxStudents();
            deleteStudentId = null;

            bootstrap.Modal.getInstance(
                document.getElementById("deleteModal")
            ).hide();
        }
    });
});


// Reset modal when closed
$('#studentModal').on("hidden.bs.modal", function () {
    editStudentId = null;

    $('#image').val('');
    $('#name').val('');
    $('#branch').val('');
    $('#phone').val('');

    document.getElementById("previewImage").style.display = "none";
    img = "";

    $('#addStudentBtn').text("Add Student");
});
