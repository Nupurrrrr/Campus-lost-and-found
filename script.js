// Get the report form
const reportForm = document.getElementById("reportForm");


// Run this only if the form exists
if (reportForm) {

    reportForm.addEventListener("submit", async function (event) {

        // Stop page from refreshing
        event.preventDefault();

        // Get values from the form
        const type = document.getElementById("type").value;
        const itemName = document.getElementById("itemName").value;
        const description = document.getElementById("description").value;
        const location = document.getElementById("location").value;
        const date = document.getElementById("date").value;
        const contact = document.getElementById("contact").value;


        try {

            // Send data to backend
            const response = await fetch("/api/items", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    type: type,
                    itemName: itemName,
                    description: description,
                    location: location,
                    date: date,
                    contact: contact
                })

            });


            // Get response from server
            const result = await response.json();

            console.log("Server response:", result);


            // Check if successful
            if (response.ok) {

                alert("Your report has been submitted successfully!");

                reportForm.reset();

            } else {

                alert("Something went wrong: " + result.error);

            }

        } catch (error) {

            console.log("Error:", error);

            alert("Could not connect to the server!");

        }

    });

}