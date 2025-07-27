import moment from "moment";
import { IBooking } from "@/types/booking.type";

export interface ITicketDetails {
	ticketName: string;
	quantity: number;
	amount: number;
	currency: string;
	currencyIcon: string;
	totalAmount: number;
	description: string;
}

export interface IBookingConfirmationPdfData extends IBooking {
	ticketDetails: ITicketDetails[];
	members: Array<{
		name: string;
		email?: string;
		phone: string;
	}>;
	cgst: number;
	sgst: number;
	convenienceFee: number;
}

export const generateBookingConfirmationEmail = (data: IBookingConfirmationPdfData) => {
	return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #f8f9fa;
            margin-bottom: 30px;
          }
          .booking-details {
            margin-bottom: 30px;
          }
          .ticket-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .total {
            font-size: 18px;
            font-weight: bold;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #eee;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
            <div style="text-align: center; margin-bottom: 30px;">
							<img src="https://www.murb.in/brand/brand-logo-black.svg" alt="Murb Logo" style="width: 150px;">
						</div>
          <h1>Booking Confirmed! 🎉</h1>
          <p>Thank you for your booking</p>
        </div>

        <div class="booking-details">
          <h2>Hello ${data.user?.firstName ?? "" + " " + data.user?.lastName ?? ""},</h2>
          <p>Your booking for <strong>${data.event?.title}</strong> has been confirmed.</p>
          
          <div class="ticket-info">
            <h3>Booking Details:</h3>
            <p><strong>Booking ID:</strong> ${data.id}</p>
            <p><strong>Payment ID:</strong> ${data.paymentId}</p>
            <p><strong>Event Date:</strong> ${data.bookedSlot?.date}</p>
            <p><strong>Event Time:</strong> ${data.bookedSlot?.slot?.startTime} - ${data.bookedSlot?.slot?.endTime}</p>
            ${data.event?.isOnline ? `<p><strong>Location:</strong> Online event</p>` : data.event?.isHomeService ? `<p><strong>Location:</strong> At your location</p>` : `<p><strong>Location:</strong> ${data.event?.landmark}, ${data.event?.city}, ${data.event?.state}, ${data.event?.country}- ${data.event?.pincode}</p>`}
            <p><strong>Number of Tickets:</strong> ${data.tickets?.reduce((acc, ticket) => acc + ticket.quantity, 0)}</p>
          </div>

          <div class="ticket-info">
            <h3>Ticket Details:</h3>
            ${data.members
				.map(
					(member, index) => `
              <div style="margin-bottom: 10px;">
                <p><strong>Ticket ${index + 1}:</strong></p>
                <p>Name: ${member.name}</p>
                <p>Phone: ${member.phone}</p>
                ${member.email ? `<p>Email: ${member.email}</p>` : ""}
              </div>
            `,
				)
				.join("")}
          </div>

          <div class="total">
            <p>Subtotal: ${data.currencyIcon} ${data.totalAmount}</p>
            <p>Total (including taxes): ${data.currencyIcon} ${data.totalAmountWithTax}</p>
          </div>
        </div>

        <div class="footer">
          <p>If you have any questions about your booking, please contact our support team.</p>
          <p>This is an automated email, please do not reply directly to this message.</p>
        </div>
      </body>
    </html>
  `;
};

// Function to generate invoice HTML
export const generateInvoiceHtml = (data: IBookingConfirmationPdfData) => {
	return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket Invoice</title>
  <style>
    /* Base Styles */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    :root {
      --primary-color: #cfad87;
      --primary-light: #cfad87;
      --secondary-color: #f8eee4;
      --success-color: #10b981;
      --success-light: #ecfdf5;
      --border-color: #e5e7eb;
      --text-color: #1f2937;
      --text-light: #6b7280;
      --background-light: #f9fafb;
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', sans-serif;
      color: var(--text-color);
      background-color: white;
      line-height: 1.5;
    }

    /* Layout */
    .container {
      max-width: 1024px;
      margin: 0 auto;
      padding: 0;
    }

    .card {
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: var(--shadow);
    }

    /* Header Styles */
    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-color);
    }

    .button {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .button-outline {
      border: 1px solid var(--border-color);
      background-color: white;
      color: var(--text-color);
    }

    .button-outline:hover {
      background-color: var(--background-light);
    }

    .dropdown {
      position: relative;
      display: inline-block;
    }

    .dropdown-content {
      display: none;
      position: absolute;
      right: 0;
      margin-top: 0.5rem;
      background-color: white;
      min-width: 160px;
      box-shadow: var(--shadow);
      border-radius: 0.375rem;
      padding: 0.5rem;
      z-index: 1;
    }

    .dropdown:hover .dropdown-content {
      display: block;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      padding: 0.5rem;
      border-radius: 0.25rem;
      cursor: pointer;
    }

    .dropdown-item:hover {
      background-color: var(--background-light);
    }

    /* Invoice Header */
    .invoice-header {
      position: relative;
      border-bottom: 1px solid var(--border-color);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: linear-gradient(to right, #eff6ff, #eef2ff);
    }

    .logo-container {
      display: flex;
      align-items: center;
    }

    .logo {
      height: 3rem;
      width: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.5rem;
      margin-right: 1rem;
    }

    .logo-text h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-color);
    }

    .logo-text p {
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .invoice-title {
      text-align: right;
    }

    .invoice-title h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .invoice-title p {
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .paid-stamp {
      position: absolute;
      top: 1.5rem;
      right: 6rem;
      transform: rotate(12deg);
      border: 2px solid var(--success-color);
      color: var(--success-color);
      font-weight: 700;
      padding: 0.25rem 1rem;
      border-radius: 0.25rem;
    }

    /* Grid Layout */
    .grid {
      display: grid;
      gap: 1.5rem;
    }

    .grid-cols-2 {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
      .grid-cols-2 {
        grid-template-columns: 1fr;
      }
    }

    /* Invoice Info */
    .invoice-info {
      padding: 1.5rem;
      background-color: white;
    }

    .section-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-light);
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }

    .text-right {
      text-align: right;
    }

    .font-medium {
      font-weight: 500;
    }

    .text-gray {
      color: var(--text-light);
    }

    /* Event Details */
    .event-details {
      background-color: var(--background-light);
      padding: 1.5rem;
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
    }

    .section-header {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 1rem;
    }

    .space-y {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .flex {
      display: flex;
    }

    .items-start {
      align-items: flex-start;
    }

    .icon {
      margin-right: 0.5rem;
      margin-top: 0.125rem;
      color: var(--primary-color);
    }

    .icon svg {
      height: 1.25rem;
      width: 1.25rem;
    }

    .detail-label {
      width: 8rem;
      font-size: 0.875rem;
      color: var(--text-light);
    }

    .detail-value {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-color);
    }

    /* Table Styles */
    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      text-align: left;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-light);
      border-bottom: 1px solid var(--border-color);
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .text-center {
      text-align: center;
    }

    .text-right {
      text-align: right;
    }

    /* Summary */
    .summary {
      margin-top: 1.5rem;
      display: flex;
      justify-content: flex-end;
    }

    .summary-box {
      width: 100%;
      max-width: 20rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border-color);
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      font-weight: 700;
      font-size: 1.125rem;
    }

    /* Payment Status */
    .payment-status {
      padding: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .status-box {
      background-color: var(--success-light);
      border: 1px solid #d1fae5;
      border-radius: 0.5rem;
      padding: 1rem;
      display: flex;
      align-items: center;
    }

    .status-icon {
      height: 2.5rem;
      width: 2.5rem;
      border-radius: 9999px;
      background-color: #a7f3d0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
    }

    .status-icon svg {
      height: 1.25rem;
      width: 1.25rem;
      color: var(--success-color);
    }

    /* QR Code */
    .qr-container {
      padding: 1.5rem;
      display: flex;
      justify-content: center;
      border-top: 1px solid var(--border-color);
    }

    .qr-box {
      text-align: center;
    }

    .qr-image {
      background-color: white;
      padding: 0.5rem;
      display: inline-block;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .qr-image img {
      height: 8rem;
      width: 8rem;
    }

    /* Footer */
    .footer {
      padding: 1.5rem;
      background-color: var(--background-light);
      border-top: 1px solid var(--border-color);
    }

    .footer-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .footer-grid {
        grid-template-columns: 1fr;
      }

      .footer-right {
        text-align: left !important;
      }
    }

    .footer-right {
      text-align: right;
    }

    /* Print Styles */
    @media print {
      @page {
        size: A4;
        margin: 0.5cm;
      }

      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .action-bar,
      .dropdown-content {
        display: none !important;
      }

      .container {
        padding: 0 !important;
      }

      .card {
        box-shadow: none !important;
        border: none !important;
      }
    }
  </style>
</head>

<body>
  <div class="container">
    <!-- Main Invoice -->
    <div class="card">
      <!-- Header -->
      <div class="invoice-header">
        <div class="header-content">
          <div class="logo-container">
            <div class="logo">
              <img src="https://www.murb.in/brand/brand-logo-black.svg" alt="Murb Logo" style="width: 50px;">
            </div>
            <div class="logo-text">
              <h2>Murb</h2>
              <p>Where experiences come to life</p>
            </div>
          </div>
          <div class="invoice-title">
            <h1>INVOICE</h1>
            <p>${data.id}</p>
          </div>
        </div>
        <!-- Paid Stamp -->
        <div class="paid-stamp">PAID</div>
      </div>

      <!-- Invoice Info -->
      <div class="grid grid-cols-2 invoice-info">
        <div>
          <h3 class="section-title">Invoice To</h3>
          <p class="font-medium">${data.user?.firstName ? data.user?.firstName + " " + (data.user?.lastName ?? "") : ""} </p>
          <p class="text-gray">${data.user?.email}</p>
          <p class="text-gray">${data.user?.mobileNumber ? data.user?.mobileNumber : ""}</p>
        </div>
        <div class="text-right">
          <h3 class="section-title">Payment Details</h3>
          <p class="text-gray">
            Payment ID: <span class="font-medium">${data.paymentId}</span>
          </p>
          <p class="text-gray">
            Order ID: <span class="font-medium">${data.orderId}</span>
          </p>
          <p class="text-gray">
            Issue Date: <span class="font-medium">${moment(data.createdAt).format("MMM DD, YYYY hh:mm:s a")}</span>
          </p>
        </div>
      </div>

      <!-- Event Details -->
      <div class="event-details">
        <h3 class="section-header">Booking Details</h3>
        <div class="grid grid-cols-2">
          <div class="space-y">
            <div>
              <h4 class="section-title">Sport</h4>
              <p class="font-medium" style="font-size: 1.125rem;">${data.event?.title}</p>
            </div>

            <div class="flex items-start">
              <div>
                <h4 class="section-title">Timings</h4>
                <p class="font-medium">${data.bookedSlot?.date}</p>
              </div>
            </div>

            <div class="flex items-start">
              <div>
                <p class="font-medium">${data.bookedSlot?.slot?.startTime} - ${data.bookedSlot?.slot?.endTime}</p>
                <p style="font-size: 0.875rem; color: var(--text-light);">Your Slot</p>
              </div>
            </div>
          </div>

          <div class="space-y">
            <div>
              <h4 class="section-title">Organizer</h4>
              <p class="font-medium">${data.event?.users?.firstName ?? "" + " " + data.event?.users?.lastName ?? ""}</p>
              <p class="text-gray">${data.event?.users?.email}</p>
            </div>

            <div class="flex items-start">
              <div>
                <p class="font-medium">Location</p>
                <p style="font-size: 0.875rem; color: var(--text-light);">${
					data.event?.isOnline
						? "Online event"
						: `${data.event?.isHomeService}`
							? "At your location"
							: `${data.event?.landmark}, ${data.event?.city}, ${data.event?.state}, ${data.event?.country}- ${data.event?.pincode}`
				}</p>
              </div>
            </div>

            <div class="space-y" style="margin-top: 0.25rem;">
              <div class="flex">
                <span class="detail-label">Event Type:</span>
                <span class="detail-value">${data.event?.eventSpecificType}</span>
              </div>
              <div class="flex">
                <span class="detail-label">Sport Type:</span>
                <span class="detail-value">${data.event?.sportType}</span>
              </div>
              <div class="flex">
                <span class="detail-label">Sport:</span>
                <span class="detail-value">${data.event?.tags}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ticket Details -->
      <div style="padding: 1.5rem;">
        <h3 class="section-header">Ticket Details</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="width: 50%;">Description</th>
                <th class="text-center">Quantity</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
            ${data.ticketDetails.map(
				(ticket) =>
					`<tr>
                <td>
                  <p class="font-medium">${ticket.ticketName}</p>
                  <p class="text-gray">${ticket.description}</p>
                </td>
                <td class="text-center">${ticket.quantity}</td>
                <td class="text-right">${ticket.currencyIcon} ${ticket.amount}</td>
                <td class="text-right font-medium">${ticket.currencyIcon} ${ticket.totalAmount}</td>
                </tr>`,
			)}
            </tbody>
          </table>
        </div>

        <!-- Summary -->
        <div class="summary">
          <div class="summary-box">
            <div class="summary-row">
              <span class="text-gray">Subtotal:</span>
              <span class="font-medium">${data.currencyIcon} ${data.totalAmount}</span>
            </div>
            <div class="summary-row">
              <span class="text-gray">Convenience Fee:</span>
              <span class="font-medium">${data.currencyIcon} ${data.convenienceFee}</span>
            </div>
            <div class="summary-row">
              <span class="text-gray">CGST:</span>
              <span class="font-medium">${data.currencyIcon} ${data.cgst}</span>
            </div>
            <div class="summary-row">
              <span class="text-gray">SGST:</span>
              <span class="font-medium">${data.currencyIcon} ${data.sgst}</span>
            </div>
            <div class="summary-total">
              <span>Total:</span>
              <span>${data.currencyIcon} ${data.totalAmountWithTax}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Member Details -->
      <div style="padding: 1.5rem; background-color: var(--background-light); border-top: 1px solid var(--border-color);">
        <h3 class="section-header">Member Details</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              ${data.members.map(
					(member) =>
						`<tr>
                <td class="font-medium">${member.name}</td>
                <td class="text-gray">${member.email}</td>
                <td class="text-gray">${member.phone}</td>
              </tr>`,
				)}
             
            </tbody>
          </table>
        </div>
      </div>

      <!-- Payment Status -->
      <div class="payment-status">
        <div class="flex items-start" style="margin-bottom: 1rem;">
          <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2"></rect>
              <line x1="2" x2="22" y1="10" y2="10"></line>
            </svg>
          </div>
          <h3 class="section-header" style="margin: 0;">Payment Information</h3>
        </div>

        <div class="status-box">
          <div class="status-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div>
            <p class="font-medium">Payment Completed</p>
            <p style="font-size: 0.875rem; color: var(--text-light);">Paid via Razorpay on April 18, 2025</p>
          </div>
        </div>
      </div>

      <!-- QR Code -->
      <div class="qr-container">
        <div class="qr-box">
          <div class="qr-image">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.murb.in/buyer/bookings/ticket/${data.id}" alt="Ticket QR Code">
          </div>
          <p style="font-size: 0.875rem; color: var(--text-light);">Scan to access your tickets</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-grid">
          <div>
            <h4 class="section-title">Terms & Conditions</h4>
            <p style="font-size: 0.875rem; color: var(--text-light);">
              This invoice serves as proof of payment. All bookings are subject to our terms and conditions
              available at <a href="https://www.murb.in/terms-of-service">click here</a>. Tickets are non-refundable but may be transferred according to event
              policies.
            </p>
          </div>
          <div class="footer-right">
            <h4 class="section-title">Need Help?</h4>
             <p style="font-size: 0.875rem; color: var(--text-light);">Email: communication@murb.in</p>
            <p style="font-size: 0.875rem; color: var(--text-light);">Phone: +91 91631-18752
</p>
            <p style="font-size: 0.875rem; color: var(--text-light); margin-top: 0.5rem;">
              © 2025 Murb Events Inc. All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>

</html>
`;
};
