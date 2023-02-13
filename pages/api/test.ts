import { NextApiRequest, NextApiResponse } from "next";
import { sendEmail } from "../../utils/email";

export default async function handleTest() {
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
  }, 2000);

  return new Response(
    JSON.stringify({
      message: "Test",
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}

export const config = {
  runtime: "edge",
};
