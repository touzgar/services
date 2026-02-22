import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
    mediaUploader: f({
        image: { maxFileSize: "16MB", maxFileCount: 1 },
        video: { maxFileSize: "64MB", maxFileCount: 1 }
    })
        .onUploadComplete(async ({ metadata, file }) => {
            // Return metadata
            return { url: file.ufsUrl };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
