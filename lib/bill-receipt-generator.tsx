export interface ReceiptData {
  billNumber: string
  consumerName: string
  accountNumber: string
  address: string
  period: string
  billingPeriodStart: string
  billingPeriodEnd: string
  currentReading: number
  previousReading: number
  kwhUsed: number
  rate: number
  amount: number
  dueDate: string
  status: string
  createdAt: string
  companyName: string
  contactNumber: string
  email: string
}

export function generateBillReceiptHTML(data: ReceiptData): string {
  const billDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const dueDate = new Date(data.dueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const startDate = new Date(data.billingPeriodStart).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const endDate = new Date(data.billingPeriodEnd).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Power Bill Statement - ${data.accountNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333;
          background: #f5f5f5;
          padding: 20px;
        }
        .container { 
          max-width: 800px; 
          margin: 0 auto;
          background: white;
          padding: 40px;
          border: 2px solid #000;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #000;
          padding-bottom: 20px;
        }
        .header h1 {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
          letter-spacing: 2px;
        }
        .header h2 {
          font-size: 14px;
          font-weight: normal;
          margin: 5px 0;
          text-decoration: underline;
        }
        .header p {
          font-size: 12px;
          margin: 3px 0;
        }
        .consumer-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          padding: 15px 0;
          border-bottom: 1px solid #ccc;
        }
        .consumer-info {
          flex: 1;
        }
        .consumer-info label {
          font-weight: bold;
          font-size: 12px;
          display: block;
          margin-bottom: 5px;
        }
        .consumer-info input {
          border: none;
          border-bottom: 1px solid #000;
          width: 95%;
          padding-bottom: 5px;
          font-size: 12px;
        }
        .bill-number {
          text-align: right;
          font-size: 36px;
          font-weight: bold;
          margin-top: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          border: 2px solid #000;
        }
        table th, table td {
          border: 1px solid #000;
          padding: 12px;
          text-align: left;
          font-size: 12px;
          font-weight: bold;
        }
        table th {
          background: #f9f9f9;
          text-align: center;
        }
        table td {
          text-align: center;
        }
        .total-row {
          border-top: 2px solid #000;
          font-weight: bold;
          background: #f0f0f0;
        }
        .footer-section {
          display: flex;
          margin: 30px 0;
          gap: 20px;
        }
        .amount-due-box {
          flex: 1;
          background: #f9f9f9;
          border: 2px solid #000;
          padding: 20px;
          text-align: right;
        }
        .amount-due-box label {
          font-size: 14px;
          font-weight: bold;
          display: block;
        }
        .amount-due-box .value {
          font-size: 28px;
          font-weight: bold;
          color: #0066cc;
          margin: 10px 0;
        }
        .due-date-box {
          flex: 1;
          background: #f9f9f9;
          border: 2px solid #000;
          padding: 20px;
        }
        .due-date-box label {
          font-size: 14px;
          font-weight: bold;
          display: block;
          margin-bottom: 10px;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffc107;
          padding: 15px;
          margin-bottom: 20px;
          font-size: 11px;
          line-height: 1.5;
        }
        .company-info {
          text-align: center;
          font-size: 10px;
          margin-top: 30px;
          border-top: 1px solid #ccc;
          padding-top: 15px;
          color: #666;
        }
        @media print {
          body { background: white; padding: 0; }
          .container { border: none; box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>POWER BILL</h1>
          <h2>STATEMENT OF ACCOUNT</h2>
          <h1 style="font-size: 18px; margin-top: 10px;">${data.companyName}</h1>
        </div>

        <div class="consumer-section">
          <div class="consumer-info">
            <label>CONSUMER:</label>
            <input type="text" value="${data.consumerName}" readonly>
          </div>
          <div class="bill-number">NO</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 20%;">MONTHLY YEAR</th>
              <th colspan="2" style="width: 40%;">READING</th>
              <th style="width: 20%;">KWH USED</th>
              <th style="width: 20%;">TOTAL AMOUNT DUE</th>
            </tr>
            <tr>
              <th></th>
              <th>CURRENT</th>
              <th>PREVIOUS</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${data.period}</td>
              <td>${data.currentReading.toFixed(2)}</td>
              <td>${data.previousReading.toFixed(2)}</td>
              <td>${data.kwhUsed.toFixed(2)}</td>
              <td>₱${data.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer-section">
          <div class="warning" style="flex: 1;">
            If not paid within in (10) days after due date, service will be disconnected without any prior without notices
          </div>
          <div class="due-date-box">
            <label>DUE DATE</label>
            <div style="font-size: 16px; font-weight: bold;">${dueDate}</div>
          </div>
        </div>

        <div class="footer-section">
          <div style="flex: 1; border: 2px solid #000; padding: 15px;">
            <strong>TOTAL AMOUNT DUE</strong>
            <div style="font-size: 24px; font-weight: bold; color: #0066cc; margin-top: 10px;">₱${data.amount.toFixed(2)}</div>
          </div>
        </div>

        <div class="company-info">
          <div><strong>${data.companyName}</strong></div>
          <div>${data.address}</div>
          <div>Phone: ${data.contactNumber} | Email: ${data.email}</div>
          <div style="margin-top: 10px;">Generated on ${billDate}</div>
        </div>
      </div>
    </body>
    </html>
  `
}
