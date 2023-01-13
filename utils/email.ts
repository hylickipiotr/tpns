import { SENDINBLUE_API_URL } from "../constants";
import { Product, ProductStatus } from "../types/product";

export interface EmailData {
  sender: {
    name: string;
    email: string;
  };
  to: { email: string }[];
  subject: string;
  htmlContent: string;
}

export interface SendEmailError {
  message: string;
  code: string;
}

export interface SendEmailSuccess {
  messageId: string;
}

export interface SendEmailResponse {
  data?: SendEmailSuccess;
  error?: SendEmailError;
}

export async function sendEmail(data: EmailData): Promise<SendEmailResponse> {
  const headers = new Headers();
  headers.append("accept", "application/json");
  headers.append("api-key", process.env.SENDINBLUE_API_KEY);
  headers.append("content-type", "application/json");

  const body = JSON.stringify(data);

  const response = await fetch(SENDINBLUE_API_URL, {
    method: "POST",
    headers,
    body,
  });

  const responseData: SendEmailSuccess | SendEmailError = await response.json();

  const isError = "code" in responseData;
  if (isError) {
    return {
      error: responseData,
    };
  }

  return {
    data: responseData,
  };
}

export function createProductStatusEmailData(product: Product): EmailData {
  const subjectStatusMap: { [key in ProductStatus]?: string } = {
    inStock: `Produkt "${product.name}" jest dostępny`,
    lowStock: `Produkt "${product.name}" jest dostępny w niewielkich ilościach`,
  };

  const email = process.env.EMAIL;

  return {
    sender: {
      name: "TPNC",
      email,
    },
    to: [
      {
        email,
      },
    ],
    subject: subjectStatusMap[product.status] || "Zmiana status produktu",
    htmlContent: `<html><head></head><body><a href="${product.url}">${product.url}</a></body></html>`,
  };
}
