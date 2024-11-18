import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const post: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const message = formData.get("message")?.toString();

  if (!name || !email || !message) {
    return new Response(JSON.stringify({ message: "入力データが不足しています" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Nodemailerの設定
  const transporter = nodemailer.createTransport({
    host: import.meta.env.SMTP_HOST,
    port: parseInt(import.meta.env.SMTP_PORT || "587"),
    auth: {
      user: import.meta.env.SMTP_USER,
      pass: import.meta.env.SMTP_PASS,
    },
  });

  try {
    console.log("運営者への問い合わせ内容メール送信を試みます。");

    // ① 運営者への問い合わせ内容メール
    const adminEmailResponse = await transporter.sendMail({
      from: import.meta.env.SMTP_USER,
      to: 'naoue007@gmail.com',
      subject: '新しい問い合わせが届きました',
      text: `名前: ${name}\nメールアドレス: ${email}\nメッセージ:\n${message}`,
    });

    console.log("運営者へのメール送信成功:", adminEmailResponse);

    console.log("問い合わせ者への受付完了メール送信を試みます。");

    // ② 問い合わせ者への受付完了メール
    const userEmailResponse = await transporter.sendMail({
      from: import.meta.env.SMTP_USER,
      to: email,
      subject: 'お問い合わせを受け付けました',
      text: `こんにちは ${name}さん,\n\nお問い合わせありがとうございます。内容を確認しました。\n\nご返信をお待ちください。\n\nメッセージ:\n${message}`,
    });

    console.log("問い合わせ者へのメール送信成功:", userEmailResponse);

    return new Response(JSON.stringify({ message: 'メールが送信されました' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("メール送信中にエラーが発生しました:", error);
    return new Response(JSON.stringify({ message: 'メールの送信に失敗しました', error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};