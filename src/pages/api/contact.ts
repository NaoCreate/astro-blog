import type { APIRoute } from 'astro';
import sgMail from '@sendgrid/mail';
import { google } from 'googleapis';

// SendGridのAPIキーを設定
sgMail.setApiKey(import.meta.env.SENDGRID_API_KEY);

// Google Sheets APIの認証設定
const auth = new google.auth.GoogleAuth({
  keyFile: 'google-service-key-AstroContactForm.json', // サービスアカウントキーのファイルパス
  scopes: ['https://www.googleapis.com/auth/spreadsheets'], // 使用するGoogle APIのスコープ
});

// Google Sheets APIクライアントの作成
const sheets = google.sheets({ version: 'v4', auth });

// スプレッドシートのIDを設定（スプレッドシートのURLから取得）
const SPREADSHEET_ID = '1vNlzZXsUzC9B1PJdPg9-TLvgW8gD4__n74-9shL0R6Q';

export const post: APIRoute = async ({ request }) => {
  const data = await request.json();
  const { name, email, message } = data;

  // --- スプレッドシートへの保存処理 ---
  try {
    // スプレッドシートに問い合わせ内容を追加する
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID, // スプレッドシートのID
      range: 'testForm!A2', // データを追加するシート名とセル範囲
      valueInputOption: 'RAW', // 入力オプション（RAWはそのまま保存）
      requestBody: {
        values: [[new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }), name, email, message]],
        // スプレッドシートに保存するデータ(A列:日時, B列:名前, C列:メールアドレス, D列:内容)
      },
    });
    console.log('スプレッドシートにデータを保存しました:', response.data);
  } catch (sheetsError) {
    console.error('スプレッドシート保存エラー:', sheetsError);
    return new Response(
      JSON.stringify({ message: 'スプレッドシートへの保存中にエラーが発生しました', error: sheetsError.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // --- SendGridでのメール送信処理 ---
  try {
    // サイト管理者への通知メール
    await sgMail.send({
      to: 'naocreate52@gmail.com', // 管理者のメールアドレス
      from: 'contact@naocreate.net', // 認証済みの送信元アドレス
      subject: '新しいお問い合わせがあります',
      text: `名前: ${name}\nメールアドレス: ${email}\nメッセージ:\n${message}`,
    });

    // 問い合わせ者への確認メール
    await sgMail.send({
      to: email, // 問い合わせ者のメールアドレス
      from: 'contact@naocreate.net', // 認証済みの送信元アドレス
      subject: 'お問い合わせを受け付けました',
      text: `こんにちは ${name}さん,\n\nお問い合わせありがとうございます。内容を確認しました。\n\nご返信をお待ちください。\n\nメッセージ:\n${message}`,
    });
  } catch (sendGridError) {
    console.error('メール送信エラー:', sendGridError);
    return new Response(
      JSON.stringify({ message: 'メール送信中にエラーが発生しました', error: sendGridError.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // --- 正常終了時のレスポンス ---
  return new Response(JSON.stringify({ message: 'メールが送信され、データが保存されました' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
