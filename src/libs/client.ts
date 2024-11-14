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

