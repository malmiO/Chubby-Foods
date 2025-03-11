document.addEventListener("DOMContentLoaded", function () {
    const eventCards = document.querySelectorAll(".event-card");
    const orderForm = document.getElementById("order-form");
    const eventLabel = orderForm.querySelector("#event"); 
    const customerForm = document.getElementById("customer-form");
    const menuCombo = document.getElementById('menu-combo');

    eventCards.forEach(card => {
        card.addEventListener("click", function () {
            const eventName = this.querySelector("h4").textContent; 
            eventLabel.textContent = `Event: ${eventName}`;
            orderForm.style.display = "block"; 
            
            // Clear all input fields inside the form
            const inputs = orderForm.querySelectorAll("input, textarea");
            inputs.forEach(input => {
                if (input.type === "text" || input.type === "email" || input.type === "tel" || input.type === "date" || input.type === "number" || input.tagName.toLowerCase() === "textarea") {
                    input.value = "";
                }
            });

            menuCombo.selectedIndex = 0;

            // Clear the order items table
            document.getElementById("order-items").innerHTML = "";

            const customer_inputs = customerForm.querySelectorAll("input");
            customer_inputs.forEach(input => {
                if (input.type === "text" || input.type === "email" || input.type === "tel" || input.type === "date") {
                    input.value = "";
                }
            });
        });
    });
});
