"use server";

import nodemailer from "nodemailer";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import string from "string-sanitizer";
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject("Failed to create access token :(");
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    // @ts-ignore
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.SENDER_EMAIL,
      accessToken,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    },
  });

  return transporter;
};

const sendEmail = async (
  senderName: string,
  senderEmail: string,
  message: string
) => {
  let emailTransporter = await createTransporter();
  
  // Get recipient emails from environment variable
  // Format: CONTACT_RECIPIENTS=email1@example.com,email2@example.com
  const recipients = process.env.CONTACT_RECIPIENTS 
    ? process.env.CONTACT_RECIPIENTS.split(',').map(email => email.trim())
    : [process.env.SENDER_EMAIL || 'contact@example.com'];
  
  return await emailTransporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to: recipients,
    text: `RECEBEMOS UMA NOVA MENSAGEM PELO FORMULARIO DE CONTATO NO SITE! \n Nome: ${senderName} \n Email: ${senderEmail} \n Mensagem:\n${message}`,
    subject: "Nova mensagem recebida pelo formulário de contato do DEWATT!!!",
  });
};

interface Data {
  name: string;
  email: string;
  message: string;
}

export async function POST(req: NextRequest, res: NextResponse) {
  console.log("started handlign request")
  const data: Data = await req.json();

  if (!data.name || !data.email || !data.message) {
    return new Response(
      "Uhmm... It looks like you forgot to fill something? Check your data and try again...",
      {
        status: 400,
      }
    );
  }

  // @ts-ignore
  if (!string.validate.isEmail(data.email)) {
    return new Response(
      "Oops! It looks like you've entered an invalid email address 😔",
      {
        status: 400,
      }
    );
  }

  const response = await sendEmail(string.addDash(data.name), data.email, string.addDash(data.message))
    .then(() => {
      console.log("returning api success")
      return new Response("success", {
        status: 200,
      });
    })
    .catch((err) => {
      console.log("returning api error")
      return new Response(`error`, {
        status: 500,
      });
    });

  return response;
}
