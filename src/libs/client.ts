//▼▼▼microCMSとの連携▼▼▼
import type { MicroCMSQueries } from "microcms-js-sdk";
import { createClient } from "microcms-js-sdk";

const client = createClient({
    serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: import.meta.env.MICROCMS_API_KEY,
});

export type Blog = {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
    title: string;
    content: string;
    eyecatch: {
        url: string,
        height: number,
        width: number
    };
    category: Category
};
export type BlogResponse = {
    totalCount: number;
    offset: number;
    limit: number;
    contents: Blog[];
};

export const getBlogs = async (queries?: MicroCMSQueries) => {
    return await client.get<BlogResponse>({ endpoint: "blogs", queries });
};
export const getBlogDetail = async (
    contentId: string,
    queries?: MicroCMSQueries
) => {
    return await client.getListDetail<Blog>({
        endpoint: "blogs",
        contentId,
        queries,
    });
};
export type Category = {
    id: string;
    name: string;
};

export type CategoryResponse = {
    totalCount: number;
    offset: number;
    limit: number;
    contents: Category[];
};

export const getCategories = async (queries?: MicroCMSQueries) => {
    return await client.get<CategoryResponse>({ endpoint: "categories", queries });
};

// 問い合わせフォームに関する記述
export type Contact = {
    name: string;
    email: string;
    message: string;
};

export const postContact = async (data: Contact) => {
    return await client.create({ endpoint: "contact", content: data });
}


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

  // Nodemailerの設定
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"), // ポートを整数に変換
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    // ① 運営者への問い合わせ内容メール
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'naoue007@gmail.com', // 運営者のメールアドレス
      subject: '新しい問い合わせが届きました',
      text: `名前: ${name}\nメールアドレス: ${email}\nメッセージ:\n${message}`,
    });

    // ② 問い合わせ者への受付完了メール
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email, // 問い合わせ者のメールアドレス
      subject: 'お問い合わせを受け付けました',
      text: `こんにちは ${name}さん,\n\nお問い合わせありがとうございます。内容を確認しました。\n\nご返信をお待ちください。\n\nメッセージ:\n${message}`,
    });

    return { message: 'メールが送信されました' };
  } catch (error) {
    return { message: 'メールの送信に失敗しました', error };
  }
}

