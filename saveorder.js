import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js'; 
import { emailJsConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

emailjs.init(emailJsConfig.publicKey);

// SaveOrder function
function SaveOrder() {
    const eventLabel = document.getElementById("event");
    const eventText = eventLabel.textContent.replace("Event: ", "").trim(); // Extract event name
    const orderDate = document.getElementById("order-date").value;
    const specialRequests = document.getElementById("order-special requests").value;
    const notes = document.getElementById("order-notes").value;
    const orderItems = [];

    // Validate order date
    if (!orderDate) {
        alert("Please select a date for your order.");
        return;
    }

    // Validate menu items
    document.querySelectorAll("#order-items tr").forEach(row => {
        const itemName = row.querySelector("td:first-child").textContent.trim(); // Get item name from table
        const itemQuantity = row.querySelector("td:nth-child(2)").textContent.trim(); // Get quantity from table

        if (itemName && itemQuantity > 0) {
            orderItems.push({ name: itemName, quantity: itemQuantity });
        }
    });

    if (orderItems.length === 0) {
        alert("Please add at least one menu item.");
        return;
    }

    // Prepare order data
    const orderData = {
        event: eventText,
        date: orderDate,
        items: orderItems,
        specialRequests: specialRequests,
        notes: notes,
        OrderCreated_timestamp: serverTimestamp() 
    };


    // Push order to Firestore
    addDoc(collection(db, "orders"), orderData)
        .then((docRef) => {
            alert("Order saved successfully! Now enter your details.");
            document.querySelector(".customer-details").style.display = "block"; 

            // Scroll to the customer details form
            document.querySelector(".customer-details").scrollIntoView({ behavior: "smooth" });

            // Store order ID for later use
            localStorage.setItem("orderId", docRef.id);
        })
        .catch(error => {
            console.error("Error saving order: ", error);
            alert("An error occurred while saving your order. Please try again.");
        });
}

// SubmitOrder function
function submitOrder() {
    const fullName = document.getElementById("fname").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const zip = document.getElementById("zip").value.trim();

    // Validate customer details
    if (!fullName || !email || !phone || !address || !city || !zip) {
        alert("Please fill out all customer details.");
        return;
    }

    // Get order ID from localStorage
    const orderId = localStorage.getItem("orderId");

    if (!orderId) {
        alert("No order found. Please save your order first.");
        return;
    }

    // Prepare customer data
    const customerData = {
        fullName,
        email,
        phone,
        address,
        city,
        zip,
        orderId, // Link customer details to the order
        timestamp: serverTimestamp()
    };

    // Push customer details to Firestore
    addDoc(collection(db, "customers"), customerData)
        .then(() => {

            alert("Order submitted successfully!");

            // Send order details via email
            sendOrderEmail(fullName, email, phone, address, city, zip);

            // Display order report
            displayOrderReport(orderId, fullName, email, phone, address, city, zip);

            // Hide order form and customer details form
            document.querySelector(".order-form").style.display = "none";
            document.querySelector(".customer-details").style.display = "none";

            // Clear localStorage
            localStorage.removeItem("orderId");
          
        })
        .catch(error => {
            console.error("Error saving customer details: ", error);
            alert("An error occurred while submitting your order. Please try again.");
        });
}

// Function to send order details via Email.js
function sendOrderEmail(fullName, email, phone, address, city, zip) {
    const ownerEmail = "malmioshadhi2022@gmail.com"; 
    const orderItems = [];

    document.querySelectorAll("#order-items tr").forEach(row => {
        const itemName = row.querySelector("td:first-child").textContent.trim();
        const itemQuantity = row.querySelector("td:nth-child(2)").textContent.trim();
        if (itemName && itemQuantity > 0) {
            orderItems.push(`${itemName} (Qty: ${itemQuantity})`);
        }
    });

    const specialRequests = document.getElementById("order-special requests").value;
    const notes = document.getElementById("order-notes").value;

    const orderDetails = {
        owner_email: ownerEmail,
        customer_name: fullName,
        customer_email: email,
        customer_phone: phone,
        customer_address: `${address}, ${city}, ${zip}`,
        order_items: orderItems.join("\n"),
        order_date: document.getElementById("order-date").value,
        special_requests: specialRequests,
        additional_notes: notes
    };

    emailjs.send(emailJsConfig.serviceID,emailJsConfig.templateID, orderDetails)
        .then(() => {
            console.log("Email sent successfully!");
            alert("Order details have been sent to the owner.");
        })
        .catch(error => {
            console.error("Error sending email:", error);
            alert("Failed to send the email. Check the console for details.");
        });
}

// Display order report
function displayOrderReport(orderId, fullName, email, phone, address, city, zip) {
    const orderReport = document.querySelector(".order-report");

    // Populate order report
    document.getElementById("order-report-date").textContent = document.getElementById("order-date").value;
    document.getElementById("order-report-name").textContent = fullName;
    document.getElementById("order-report-email").textContent = email;
    document.getElementById("order-report-phone").textContent = phone;
    document.getElementById("order-report-address").textContent = address;
    document.getElementById("order-report-city").textContent = city;
    document.getElementById("order-report-zip").textContent = zip;

    // Populate order items
    const orderItemsTable = document.getElementById("order-report-items");
    orderItemsTable.innerHTML = ""; // Clear existing rows

    document.querySelectorAll("#order-items tr").forEach(row => {
        const itemName = row.querySelector("td:first-child").textContent.trim();
        const itemQuantity = row.querySelector("td:nth-child(2)").textContent.trim();

        const newRow = orderItemsTable.insertRow();
        newRow.innerHTML = `
            <td>${itemName}</td>
            <td>${itemQuantity}</td>
        `;
    });

    // Show order report
    orderReport.style.display = "block";
}


// Make functions globally accessible
window.SaveOrder = SaveOrder;
window.submitOrder = submitOrder;

function printOrderReport() {
    const orderReport = document.querySelector(".order-report");
    const printContent = orderReport.cloneNode(true);
    const printButton = printContent.querySelector(".print-order-report");
    if (printButton) {
        printButton.style.display = "none";
    }
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
        <html>
            <head>
                <h1>Thank you for your order!</h1>
                <title>Order Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding:100px; max-width:80%;}
                    h1 { text-align: center; color: Green; text-decoration: italic; text-size: 24px; margin-bottom: 20px; }
                    title { text-size: 33px; padding: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
                    th { background-color: #f9f9f9; }
                    .print-order-report { display: none; }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

window.printOrderReport = printOrderReport;