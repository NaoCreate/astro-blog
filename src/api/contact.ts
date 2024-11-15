// ▼▼▼Nodemailerを使用した問い合わせメール送信機能▼▼▼
import nodemailer from 'nodemailer';

// 問い合わせ内容の型を定義
type ContactData = {
  name: string;
  email: string;
  message: string;
};

// レスポンスの型を定義
type ResponseData = {
  message: string;
  error?: unknown;
};

export async function sendContactEmail(data: ContactData): Promise<ResponseData> {
  const { name, email, message } = data;

  // 必須の環境変数をチェック
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return {
      message: '環境変数が設定されていません。SMTP_HOST, SMTP_USER, SMTP_PASSを確認してください。',
    };
  }

  // Nodemailerの設定
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    // ① 運営者への問い合わせ内容メール
    await transporter.sendMail({
      from: smtpUser,
      to: 'naoue007@gmail.com', // 運営者のメールアドレス
      subject: '新しい問い合わせが届きました',
      text: `名前: ${name}\nメールアドレス: ${email}\nメッセージ:\n${message}`,
    });

    // ② 問い合わせ者への受付完了メール
    await transporter.sendMail({
      from: smtpUser,
      to: email, // 問い合わせ者のメールアドレス
      subject: 'お問い合わせを受け付けました',
      text: `こんにちは ${name}さん,\n\nお問い合わせありがとうございます。内容を確認しました。\n\nご返信をお待ちください。\n\nメッセージ:\n${message}`,
    });

    return { message: 'メールが送信されました' };
  } catch (error) {
    console.error('メール送信エラー:', error); // ログにエラーを記録
    return { message: 'メールの送信に失敗しました', error };
  }
}
