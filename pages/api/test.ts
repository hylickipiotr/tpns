import { NextApiRequest, NextApiResponse } from "next";
import { sendEmail } from "../../utils/email";

export default async function handleTest(
  _: NextApiRequest,
  res: NextApiResponse
) {
  setTimeout(() => {
    sendEmail({
      sender: {
        email: process.env.EMAIL,
        name: "TPNC",
      },
      to: [
        {
          email: process.env.EMAIL,
        },
      ],
      subject: "Test",
      htmlContent: "Test",
    });
  }, 5000);

  res.status(200).json({ message: "Test" });
}
