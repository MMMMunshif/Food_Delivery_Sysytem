import nodemailer from "nodemailer";

export const sendOrderReceipt = async (req, res) => {
  try {
    const { customerEmail, customerName, dishName, quantity, totalPrice, paymentStatus } = req.body;

    if (!customerEmail || !customerName || !dishName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your gmail
        pass: process.env.EMAIL_PASS, // app password
      },
    });

    // Email message
    const mailOptions = {
      from: `"Home Chef" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: "🍴 Home Chef - Order Receipt",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #ff6600;">Order Receipt - Home Chef</h2>
          <p>Dear <b>${customerName}</b>,</p>
          <p>Thank you for ordering from Home Chef! Here are your order details:</p>
          <table style="border-collapse: collapse; width: 100%; margin-top: 10px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Dish</b></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${dishName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Quantity</b></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${quantity}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Total Price</b></td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Rs. ${totalPrice}</td>
            </tr>
            <tr>
              <td style="padding: 8px;"><b>Payment</b></td>
              <td style="padding: 8px;">${paymentStatus}</td>
            </tr>
          </table>
          <p style="margin-top: 15px;">We’ll notify you once your order is dispatched 🚚</p>
          <p style="color: gray;">Thank you for choosing Home Chef!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Receipt email sent successfully" });
  } catch (error) {
    console.error("Email sending failed:", error);
    res.status(500).json({ message: "Failed to send receipt", error: error.message });
  }
};
