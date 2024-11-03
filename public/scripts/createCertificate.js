document
  .getElementById("generateCertificateButton")
  .addEventListener("click", async () => {
    const data = {
      studentName: document.getElementById("studentName").value,
      courseName: document.getElementById("courseName").value,
      technologies: document
        .getElementById("technologies")
        .value.split(",")
        .map((tech) => tech.trim()),
    };

    try {
      const response = await fetch(
        "https://pdf-generator-w70m.onrender.com/api/v1/certificate/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (response.ok && result?.success) {
        // Hide the form and show the success card
        document.getElementById("certificateForm").style.display = "none";
        const successCard = document.getElementById("successCard");
        successCard.style.display = "block";

        // Set up the download button
        const downloadButton = document.getElementById("downloadPdfButton");
        downloadButton.onclick = () => {
          const link = document.createElement("a");
          link.href = result?.data;
          link.target = "_blank";
          link.download = "certificate.pdf";
          link.click();
        };
      } else {
        alert("Error creating certificate: " + result?.message);
      }
    } catch (error) {
      alert("An error occurred while creating the certificate.");
    }
  });

// Handle Recreate PDF button click
document.getElementById("recreatePdfButton").addEventListener("click", () => {
  // Hide the success card and show the form
  document.getElementById("successCard").style.display = "none";
  document.getElementById("certificateForm").style.display = "block";

  // Clear the input fields
  document.getElementById("studentName").value = "";
  document.getElementById("courseName").value = "";
  document.getElementById("technologies").value = "";
});
