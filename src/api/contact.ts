import nodemailer from 'nodemailer';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, message } = req.body;

  // リクエストデータの確認
  console.log("受け取ったデータ:", { name, email, message }); 

  // Nodemailer設定の環境変数を確認
  console.log("SMTP設定:", {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
  });

  // Nodemailerの設定
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    console.log("運営者への問い合わせ内容メール送信を試みます。"); // 運営者へのメール送信前のログ

    // ① 運営者への問い合わせ内容メール
    const adminEmailResponse = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'naoue007@gmail.com', // 運営者のメールアドレス
      subject: '新しい問い合わせが届きました',
      text: `名前: ${name}\nメールアドレス: ${email}\nメッセージ:\n${message}`,
    });

    console.log("運営者へのメール送信成功:", adminEmailResponse);

    console.log("問い合わせ者への受付完了メール送信を試みます。"); // 問い合わせ者へのメール送信前のログ

    // ② 問い合わせ者への受付完了メール
    const userEmailResponse = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email, // 問い合わせ者のメールアドレス
      subject: 'お問い合わせを受け付けました',
      text: `こんにちは ${name}さん,\n\nお問い合わせありがとうございます。内容を確認しました。\n\nご返信をお待ちください。\n\nメッセージ:\n${message}`,
    });

    console.log("問い合わせ者へのメール送信成功:", userEmailResponse);

    return res.status(200).json({ message: 'メールが送信されました' });
  } catch (error) {
    console.error("メール送信中にエラーが発生しました:", error); // エラー発生時のログ
    return res.status(500).json({ message: 'メールの送信に失敗しました', error });
  }
}
